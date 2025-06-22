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
const supertest_1 = __importDefault(require("supertest"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploads_1 = require("../../Demo_API_Final/routes/uploads");
describe('Image upload API', () => {
    const app = new koa_1.default();
    app.use(uploads_1.router.routes()).use(uploads_1.router.allowedMethods());
    const dummyImagePath = path_1.default.join(__dirname, 'test-image.jpg');
    const dummyFileContent = Buffer.from('dummy image content');
    beforeAll(() => {
        if (!fs_1.default.existsSync(dummyImagePath)) {
            fs_1.default.writeFileSync(dummyImagePath, dummyFileContent);
        }
    });
    it('should upload an image and return 201 with file info', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback())
            .post('/api/v1/images')
            .attach('upload', dummyImagePath);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('filename');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('extension');
        expect(res.body.links).toHaveProperty('path');
    }));
    it('should return 404 for nonexistent image UUID', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app.callback()).get('/api/v1/images/1b0b6b17c12d236949bd67200');
        expect(res.status).toBe(404);
    }));
    afterAll(() => {
        if (fs_1.default.existsSync(dummyImagePath)) {
            fs_1.default.unlinkSync(dummyImagePath);
        }
    });
});
