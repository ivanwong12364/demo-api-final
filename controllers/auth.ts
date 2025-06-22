require("dotenv").config(); // 在這裡加入這行
import passport from "koa-passport";
import { BasicStrategy } from "passport-http";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { RouterContext } from "koa-router";
import * as users  from '../models/users';
import bcrypt from 'bcryptjs';

// Define user interface for type safety
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  passwordsalt: string;
  avatarurl: string;
  role: string;
  google_id?: string;
  auth_provider?: string;
  dateregistered?: string;
  about?: string;
}

const verifyPassword = (user: User, password: string) => {
  console.log('db loaded user hashed pwd: '+user.password);
  console.log('input password '+ password);
  const hash = user.password;
  return  bcrypt.compareSync(password, hash);
}

// Basic Authentication Strategy (existing)
passport.use(new BasicStrategy(async (username, password, done) => {
  let result: User[] = [];
  try {
    result = await users.findByUsername(username) as User[];
    console.log('user found');
  } catch (error) {
    console.error(`Error during authentication for user ${username}: ${error}`);
    done(null, false);
  }
  if(result.length) {
    const user = result[0];
    console.log('username: '+ user.username);
    if(verifyPassword(user, password)) {
      console.log('done')
      done(null, {user: user});
    } else {
      console.log(`Password incorrect for ${username}`);
      done(null, false);
    }
  } else {
    console.log(`No user found with username ${username}`);
    done(null, false);
  }
}));

// Google OAuth2 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: "/api/v1/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let existingUser = await users.findByGoogleId(profile.id) as User[];
    
    if (existingUser.length > 0) {
      // User exists, return the user
      return done(null, { user: existingUser[0] });
    }
    
    // Check if user exists with the same email
    let emailUser = await users.findByEmail(profile.emails?.[0]?.value || '') as User[];
    
    if (emailUser.length > 0) {
      // User exists with same email, link Google account
      const userToLink = emailUser[0] as User;
      await users.linkGoogleAccount(userToLink.id, profile.id);
      const updatedUser = await users.getByUserId(userToLink.id) as User[];
      return done(null, { user: updatedUser[0] });
    }
    
    // Create new user (only for public users, not operators)
    // 注意：這裡的屬性名稱必須與資料庫欄位名稱完全一致
    const newUser = {
      username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'google_user',
      email: profile.emails?.[0]?.value || '',
      password: '', // No password for OAuth users
      passwordsalt: '',
      avatarurl: profile.photos?.[0]?.value || '',
      role: 'user', // Always 'user' for OAuth registrations - no admin privileges
      google_id: profile.id, // 修改：使用蛇形命名 google_id 而不是駝峰式 googleId
      auth_provider: 'google' // 修改：使用蛇形命名 auth_provider 而不是駝峰式 authProvider
    };
    
    const result = await users.addOAuthUser(newUser) as User;
    if (result) {
      return done(null, { user: result });
    } else {
      return done(new Error('Failed to create user'), false);
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

export const basicAuth = async (ctx: RouterContext, next: any) => {
  await passport.authenticate("basic", { session: false })(ctx, next);
  if(ctx.status == 401)
  {
    ctx.body = {
      message: 'you are not authorized'
    };
   }
}

export const googleAuth = async (ctx: RouterContext, next: any) => {
  await passport.authenticate("google", { 
    scope: ['profile', 'email'],
    session: false 
  })(ctx, next);
}

export const googleCallback = async (ctx: RouterContext, next: any) => {
  await passport.authenticate("google", { 
    session: false,
    failureRedirect: '/login?error=oauth_failed'
  })(ctx, async () => {
    if (ctx.state.user) {
      // Generate a temporary token or session for the frontend
      const user = ctx.state.user.user as User;
      const token = Buffer.from(`${user.username}:oauth_user`, 'utf8').toString('base64');
      
      // 修改：重定向到前端應用程式的 URL，而不是後端 API 的 URL
      // 假設前端運行在 http://localhost:5174，請根據您的實際前端 URL 修改
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      ctx.redirect(`${frontendUrl}/login/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarurl: user.avatarurl,
        role: user.role
      }))}`);
    } else {
      // 同樣地，失敗時也重定向到前端
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      ctx.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  });
}

