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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const upload_1 = require("../routes/upload"); // adjust the path to your router
const app = new koa_1.default();
app.use(upload_1.router.routes());
app.use(upload_1.router.allowedMethods());
describe('Image Upload Endpoint', () => {
    it('should upload an image and respond with status 201 and file info', () => __awaiter(void 0, void 0, void 0, function* () {
        const testImagePath = path_1.default.join(__dirname, 'test-image.jpg'); // Provide your own small image
        if (!fs_1.default.existsSync(testImagePath)) {
            fs_1.default.writeFileSync(testImagePath, 'fake image content'); // dummy file for testing
        }
        const res = yield (0, supertest_1.default)(app.callback())
            .post('/api/v1/images')
            .attach('upload', testImagePath);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('filename');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('extension');
        expect(res.body).toHaveProperty('links');
        expect(res.body.links).toHaveProperty('path');
    }));
    it('should return 404 when requesting a non-existing image', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback()).get('/api/v1/images/00000000-0000-0000-0000-000000000000');
        expect(res.status).toBe(404);
    }));
});
