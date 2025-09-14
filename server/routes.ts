import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "./email";
import { insertUserSchema } from "../shared/schema";

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.issues });
      }

      const { fullName, username, email, password } = validationResult.data;

      const existingUser = await storage.getUserByEmailOrUsername(email, username);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email or username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const pendingUser = await storage.createPendingUser({
        fullName,
        username,
        email,
        password: hashedPassword,
      });

      const otp = crypto.randomInt(100000, 999999).toString();
      const magicToken = crypto.randomBytes(32).toString("hex");
      const magicLink = `${req.protocol}://${req.get("host")}/verify-email?token=${magicToken}`;

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await storage.createOtp({ email, code: otp, expiresAt });
      await storage.createOtp({ email, code: magicToken, expiresAt });

      await sendVerificationEmail(email, otp, magicLink);

      res.status(201).json({ message: "Signup successful. Please check your email to verify your account." });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile setup
  app.post("/api/user/setup-profile", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in via session
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { degreeProgram, subjects } = req.body;
      
      if (!degreeProgram || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ 
          message: "Degree program and at least one subject are required" 
        });
      }

      // Get user ID from session
      const userId = req.session.userId;
      
      const updatedUser = await storage.updateUserProfile(userId, degreeProgram, subjects);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({ 
        message: "Profile setup completed successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const otpCode = await storage.getOtp(email, code);
      if (!otpCode) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      const pendingUser = await storage.getPendingUserByEmail(email);
      if (!pendingUser) {
        return res.status(400).json({ message: "No pending user found for this email" });
      }

      const newUser = await storage.createUser({
        fullName: pendingUser.fullName,
        username: pendingUser.username,
        email: pendingUser.email,
        password: pendingUser.password,
      });

      await storage.deletePendingUser(email);
      await storage.markOtpAsUsed(otpCode.id);

      // @ts-ignore
      req.session.userId = newUser.id;

      res.status(200).json({ message: "Email verified successfully", user: newUser });
    } catch (error) {
      console.error("Error during verification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}
