import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get Supabase credentials from environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/make-server-59dde27b/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-59dde27b/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Use service role key to create user with auto-confirmed email
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    );

    // Generate a unique user ID and create user without email system
    const userId = crypto.randomUUID();
    
    // Store user directly in KV store to bypass all email rate limiting
    const userProfile = {
      id: userId,
      email,
      name,
      password, // In production, this should be hashed
      allergies: [],
      severity: {},
      createdAt: new Date().toISOString(),
    };

    // Store user profile in KV store
    await kv.set(`user:${userId}:profile`, userProfile);
    
    // Also store for login lookup
    await kv.set(`email:${email}`, {
      userId,
      password, // In production, this should be hashed
      email,
      name,
    });

    return c.json({ 
      success: true,
      user: {
        id: userId,
        email,
        name,
      }
    });
  } catch (err: any) {
    console.error('Signup error during main signup flow:', err);
    return c.json({ error: err.message || 'Signup failed' }, 500);
  }
});

// Login endpoint
app.post("/make-server-59dde27b/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Check user credentials in KV store
    const userRecord = await kv.get(`email:${email}`);
    
    if (!userRecord) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Simple password check (in production, use proper hashing)
    if (userRecord.password !== password) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user:${userRecord.userId}:profile`);

    // Generate a simple access token (in production, use JWT)
    const accessToken = btoa(`${userRecord.userId}:${Date.now()}`);

    return c.json({ 
      success: true,
      accessToken: accessToken,
      user: profile || {
        id: userRecord.userId,
        email: userRecord.email,
        name: userRecord.name,
        allergies: [],
        severity: {},
      }
    });
  } catch (err: any) {
    console.error('Login error during main login flow:', err);
    return c.json({ error: err.message || 'Login failed' }, 500);
  }
});

// Get user profile endpoint (requires auth)
app.get("/make-server-59dde27b/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    // Simple token validation (in production, use proper JWT validation)
    const decoded = atob(accessToken);
    const [userId] = decoded.split(':');
    
    if (!userId) {
      return c.json({ error: 'Invalid access token' }, 401);
    }

    const profile = await kv.get(`user:${userId}:profile`);

    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ 
      success: true,
      user: profile
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return c.json({ error: err.message || 'Failed to fetch profile' }, 500);
  }
});

// Update user profile endpoint (requires auth)
app.put("/make-server-59dde27b/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    // Simple token validation (in production, use proper JWT validation)
    const decoded = atob(accessToken);
    const [userId] = decoded.split(':');
    
    if (!userId) {
      return c.json({ error: 'Invalid access token' }, 401);
    }

    const updates = await c.req.json();

    // Get existing profile
    const existingProfile = await kv.get(`user:${userId}:profile`) || {};

    // Update profile
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:profile`, updatedProfile);

    return c.json({ 
      success: true,
      user: updatedProfile
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    return c.json({ error: err.message || 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);
