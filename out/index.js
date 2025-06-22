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
require("dotenv").config();
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_passport_1 = __importDefault(require("koa-passport"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const cors_1 = __importDefault(require("@koa/cors"));
const articles_1 = require("./routes/articles");
const hotels_1 = require("./routes/hotels"); // Ensure this path is correct
const special_1 = require("./routes/special");
const uploads_1 = require("./routes/uploads");
const users_1 = require("./routes/users"); // 修改這行，同時匯入 router 和 authRouter
const koa_static_1 = __importDefault(require("koa-static"));
const app = new koa_1.default();
const router = new koa_router_1.default();
/*const welcomeAPI = async (ctx: RouterContext, next: any) => {
  ctx.body = { message: "Welcome to the blog API!" };
  await next();
};

router.get("/api/v1", welcomeAPI);
*/
// For Document:
app.use((0, koa_static_1.default)(path_1.default.join(__dirname, "docs"), { index: "index.html" })); // 使用絕對路徑並指定 index.html
app.use((0, koa_static_1.default)(path_1.default.join(__dirname, 'img'))); // 使用絕對路徑提供 img 資料夾中的圖片
app.use((0, cors_1.default)());
app.use((0, koa_logger_1.default)());
app.use((0, koa_json_1.default)());
app.use((0, koa_bodyparser_1.default)());
app.use(router.routes());
app.use(koa_passport_1.default.initialize());
app.use(hotels_1.router.routes()).use(hotels_1.router.allowedMethods()); // Move hotels first
app.use(articles_1.router.middleware()); // articles after hotels
app.use(special_1.router.middleware());
app.use(uploads_1.router.middleware());
app.use(users_1.router.middleware());
app.use(users_1.authRouter.routes()).use(users_1.authRouter.allowedMethods()); // 新增這行，使用 authRouter
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
        console.log(ctx.status);
        // 只有當請求沒有被處理時才返回 404
        if (ctx.status === 404 && ctx.body === undefined) {
            ctx.body = { err: "No such endpoint existed" };
        }
    }
    catch (err) {
        ctx.body = { err: err.message || err };
    }
}));
let port = process.env.PORT || 10888;
app.listen(10888, () => {
    console.log(`Koa Started at ${port}`);
});
