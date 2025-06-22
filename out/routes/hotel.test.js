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
const hotels_1 = require("../routes/hotels"); // adjust path as needed
const app = new koa_1.default();
app.use((0, koa_bodyparser_1.default)());
app.use(hotels_1.router.routes());
app.use(hotels_1.router.allowedMethods());
describe('Hotel Routes', () => {
    it('GET /api/v1/hotels should return hotels list', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback()).get('/api/v1/hotels');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
    it('GET /api/v1/hotels/1 should return single hotel or 404', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback()).get('/api/v1/hotels/1');
        expect([200, 404]).toContain(res.status);
    }));
    // You can mock authentication for secured routes in separate describe blocks
});
