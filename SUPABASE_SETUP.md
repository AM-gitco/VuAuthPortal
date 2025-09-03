# Supabase Authentication Setup Guide

## Overview
This project has been refactored to use Supabase for authentication instead of the custom backend. This document provides instructions for setting up Supabase and configuring the application.

## Steps to Set Up Supabase

1. **Create a Supabase Account**
   - Go to [Supabase](https://supabase.com/) and sign up for an account
   - Create a new project

2. **Configure Authentication**
   - In your Supabase dashboard, go to Authentication → Settings
   - Enable Email/Password sign-in method
   - Configure Email Templates for confirmation and password reset

3. **Set Up Google OAuth**
   - Go to Authentication → Providers → Google
   - Enable Google OAuth
   - Set up a Google Cloud project and configure OAuth credentials
   - Add your application's redirect URL

4. **Configure Environment Variables**
   - In your project's `.env` file, update the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - You can find these values in your Supabase project settings

5. **Email Domain Restriction**
   - The application is configured to only allow emails with the domain `vu.edu.pk`
   - This is implemented in the authentication flow

## Removed Backend Files
The following backend files are no longer needed and can be removed:
- `server/users.json`
- `server/otp_codes.json`
- `server/pending_users.json`
- `server/routes.ts` (authentication routes)
- `server/storage.ts`
- `server/db.ts`

## Authentication Flow
1. **Sign Up**
   - User enters email, password, and other details
   - Supabase sends a confirmation email
   - User confirms email by clicking the link

2. **Login**
   - User enters email and password
   - If email domain is not `vu.edu.pk`, they are signed out
   - Otherwise, they are authenticated and redirected to the dashboard

3. **Password Reset**
   - User enters their email
   - Supabase sends a password reset link
   - User clicks the link and sets a new password

4. **Google OAuth**
   - User clicks "Sign in with Google"
   - After authentication, the email domain is checked
   - If not `vu.edu.pk`, they are signed out