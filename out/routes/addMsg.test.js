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
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const supertest_1 = __importDefault(require("supertest"));
const addMsg_1 = require("../routes/addMsg"); // Adjust to your actual file path
// Mock the msgs model
jest.mock('../models/msgs', () => ({
    add_Msg: jest.fn(() => Promise.resolve({ affectedRows: 1 }))
}));
const msgs = require('../models/msgs');
describe('addMsg controller', () => {
    const app = new koa_1.default();
    const router = new koa_router_1.default();
    app.use((0, koa_bodyparser_1.default)());
    // Middleware to mock authentication
    app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        ctx.state.user = {
            user: {
                id: 123,
                username: 'testuser',
                email: 'test@example.com'
            }
        };
        yield next();
    }));
    router.post('/api/v1/posts/:id/message', addMsg_1.addMsg);
    app.use(router.routes()).use(router.allowedMethods());
    it('should add a message and return success', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app.callback())
            .post('/api/v1/posts/456/message')
            .send({ messagetxt: 'This is a test message' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'added' });
        expect(msgs.add_Msg).toHaveBeenCalledWith(456, 123, 'testuser', 'test@example.com', 'This is a test message');
    }));
});
