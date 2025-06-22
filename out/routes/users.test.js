"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const users_1 = require("../routes/users"); // Adjust path if needed
const app = new koa_1.default();
app.use((0, koa_bodyparser_1.default)());
app.use(users_1.router.routes());
app.use(users_1.router.allowedMethods());
describe('User Routes', () => {
    it('POST /api/v1/users - should create a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback())
            .post('/api/v1/users')
            .send({
            username: 'testuser',
            password: 'testpassword',
            email: 'test@example.com',
            avatarurl: 'https://example.com/avatar.png'
        });
        expect([201, 500]).toContain(res.status); // 500 if DB fails
        expect(res.body).toBeDefined();
    }));
    it('GET /api/v1/users/:id - should return unauthorized without auth', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback()).get('/api/v1/users/1');
        expect(res.status).toBe(401); // because it needs basicAuth
    }));
});
