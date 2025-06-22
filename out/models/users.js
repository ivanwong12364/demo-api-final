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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteById = exports.update = exports.linkGoogleAccount = exports.findByEmail = exports.findByGoogleId = exports.findByUsername = exports.addOAuthUser = exports.add = exports.getByUserId = exports.getSearch = exports.getAll = void 0;
const db = __importStar(require("../helpers/database"));
const getAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, page = 1) {
    const offset = (page - 1) * limit;
    const query = "SELECT * FROM users LIMIT  ? OFFSET  ?;";
    const data = yield db.run_query(query, [limit, offset]);
    return data;
});
exports.getAll = getAll;
const getSearch = (sfield, q) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT ${sfield} FROM users WHERE ${sfield} LIKE '%${q}%' `;
    try {
        const data = yield db.run_query(query, null);
        return data;
    }
    catch (error) {
        return error;
    }
});
exports.getSearch = getSearch;
const getByUserId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let query = "SELECT * FROM users WHERE id = ?";
    let values = [id];
    let data = yield db.run_query(query, values);
    return data;
});
exports.getByUserId = getByUserId;
const add = (user) => __awaiter(void 0, void 0, void 0, function* () {
    let keys = Object.keys(user);
    let values = Object.values(user);
    let key = keys.join(',');
    let parm = '';
    for (let i = 0; i < values.length; i++) {
        parm += '?,';
    }
    parm = parm.slice(0, -1);
    let query = `INSERT INTO users (${key}) VALUES (${parm})`;
    try {
        yield db.run_query(query, values);
        return { "status": 201 };
    }
    catch (error) {
        return error;
    }
});
exports.add = add;
// New function for OAuth users - ensures proper user creation with OAuth fields
const addOAuthUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // Ensure OAuth users always have 'user' role and proper auth provider
    // 注意：這裡的屬性名稱必須與資料庫欄位名稱完全一致
    const oauthUser = Object.assign(Object.assign({}, user), { role: 'user', auth_provider: user.auth_provider || 'google', password: user.password || '', passwordsalt: user.passwordsalt || '' });
    let keys = Object.keys(oauthUser);
    let values = Object.values(oauthUser);
    let key = keys.join(',');
    let parm = '';
    for (let i = 0; i < values.length; i++) {
        parm += '?,';
    }
    parm = parm.slice(0, -1);
    let query = `INSERT INTO users (${key}) VALUES (${parm}) RETURNING *`;
    try {
        const result = yield db.run_query(query, values);
        return result[0]; // Return the created user
    }
    catch (error) {
        console.error('Error creating OAuth user:', error);
        return null;
    }
});
exports.addOAuthUser = addOAuthUser;
const findByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM users where username = ?';
    const user = yield db.run_query(query, [username]);
    return user;
});
exports.findByUsername = findByUsername;
// New function to find user by Google ID
const findByGoogleId = (googleId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM users WHERE google_id = ?'; // 修改：使用蛇形命名 google_id
    try {
        const user = yield db.run_query(query, [googleId]);
        return user;
    }
    catch (error) {
        console.error('Error finding user by Google ID:', error);
        return [];
    }
});
exports.findByGoogleId = findByGoogleId;
// New function to find user by email
const findByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
        const user = yield db.run_query(query, [email]);
        return user;
    }
    catch (error) {
        console.error('Error finding user by email:', error);
        return [];
    }
});
exports.findByEmail = findByEmail;
// New function to link Google account to existing user
const linkGoogleAccount = (userId, googleId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'UPDATE users SET google_id = ?, auth_provider = ? WHERE id = ?'; // 修改：使用蛇形命名
    try {
        yield db.run_query(query, [googleId, 'google', userId]);
        return { status: 200, message: 'Google account linked successfully' };
    }
    catch (error) {
        console.error('Error linking Google account:', error);
        return { status: 500, error: 'Failed to link Google account' };
    }
});
exports.linkGoogleAccount = linkGoogleAccount;
const update = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log("user " , user)
    // console.log("id ",id)
    let keys = Object.keys(user);
    let values = Object.values(user);
    let updateString = "";
    for (let i = 0; i < values.length; i++) {
        updateString += keys[i] + "=" + "'" + values[i] + "'" + ",";
    }
    updateString = updateString.slice(0, -1);
    // console.log("updateString ", updateString)
    let query = `UPDATE users SET ${updateString} WHERE ID=${id} RETURNING *;`;
    try {
        yield db.run_query(query, values);
        return { "status": 201 };
    }
    catch (error) {
        return error;
    }
});
exports.update = update;
const deleteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let query = "Delete FROM users WHERE ID = ?";
    let values = [id];
    try {
        yield db.run_query(query, values);
        return { "affectedRows": 1 };
    }
    catch (error) {
        return error;
    }
});
exports.deleteById = deleteById;
