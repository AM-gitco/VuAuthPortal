import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";

declare module 'express-session' {
  interface Session {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  return createServer(app);
}
