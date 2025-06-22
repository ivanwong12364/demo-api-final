"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = exports.basicAuth = void 0;
require("dotenv").config(); // 在這裡加入這行
const koa_passport_1 = __importDefault(require("koa-passport"));
const passport_http_1 = require("passport-http");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const users = __importStar(require("../models/users"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const verifyPassword = (user, password) => {
    console.log('db loaded user hashed pwd: ' + user.password);
    console.log('input password ' + password);
    const hash = user.password;
    return bcryptjs_1.default.compareSync(password, hash);
};
// Basic Authentication Strategy (existing)
koa_passport_1.default.use(new passport_http_1.BasicStrategy((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    let result = [];
    try {
        result = (yield users.findByUsername(username));
        console.log('user found');
    }
    catch (error) {
        console.error(`Error during authentication for user ${username}: ${error}`);
        done(null, false);
    }
    if (result.length) {
        const user = result[0];
        console.log('username: ' + user.username);
        if (verifyPassword(user, password)) {
            console.log('done');
            done(null, { user: user });
        }
        else {
            console.log(`Password incorrect for ${username}`);
            done(null, false);
        }
    }
    else {
        console.log(`No user found with username ${username}`);
        done(null, false);
    }
})));
// Google OAuth2 Strategy
koa_passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: "/api/v1/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        // Check if user already exists with this Google ID
        let existingUser = yield users.findByGoogleId(profile.id);
        if (existingUser.length > 0) {
            // User exists, return the user
            return done(null, { user: existingUser[0] });
        }
        // Check if user exists with the same email
        let emailUser = yield users.findByEmail(((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || '');
        if (emailUser.length > 0) {
            // User exists with same email, link Google account
            const userToLink = emailUser[0];
            yield users.linkGoogleAccount(userToLink.id, profile.id);
            const updatedUser = yield users.getByUserId(userToLink.id);
            return done(null, { user: updatedUser[0] });
        }
        // Create new user (only for public users, not operators)
        // 注意：這裡的屬性名稱必須與資料庫欄位名稱完全一致
        const newUser = {
            username: profile.displayName || ((_e = (_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.split('@')[0]) || 'google_user',
            email: ((_g = (_f = profile.emails) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.value) || '',
            password: '', // No password for OAuth users
            passwordsalt: '',
            avatarurl: ((_j = (_h = profile.photos) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.value) || '',
            role: 'user', // Always 'user' for OAuth registrations - no admin privileges
            google_id: profile.id, // 修改：使用蛇形命名 google_id 而不是駝峰式 googleId
            auth_provider: 'google' // 修改：使用蛇形命名 auth_provider 而不是駝峰式 authProvider
        };
        const result = yield users.addOAuthUser(newUser);
        if (result) {
            return done(null, { user: result });
        }
        else {
            return done(new Error('Failed to create user'), false);
        }
    }
    catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
    }
})));
const basicAuth = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield koa_passport_1.default.authenticate("basic", { session: false })(ctx, next);
    if (ctx.status == 401) {
        ctx.body = {
            message: 'you are not authorized'
        };
    }
});
exports.basicAuth = basicAuth;
const googleAuth = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield koa_passport_1.default.authenticate("google", {
        scope: ['profile', 'email'],
        session: false
    })(ctx, next);
});
exports.googleAuth = googleAuth;
const googleCallback = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield koa_passport_1.default.authenticate("google", {
        session: false,
        failureRedirect: '/login?error=oauth_failed'
    })(ctx, () => __awaiter(void 0, void 0, void 0, function* () {
        if (ctx.state.user) {
            // Generate a temporary token or session for the frontend
            const user = ctx.state.user.user;
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
        }
        else {
            // 同樣地，失敗時也重定向到前端
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            ctx.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
    }));
});
exports.googleCallback = googleCallback;
