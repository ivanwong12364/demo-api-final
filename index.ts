require("dotenv").config(); 
import path from 'path';
import Koa from "koa";
import Router, { RouterContext } from "koa-router";
import logger from "koa-logger";
import json from "koa-json";
import passport from "koa-passport";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { router as articles } from "./routes/articles";
import { router as hotels } from "./routes/hotels"; // Ensure this path is correct
import { router as special } from "./routes/special";
import { router as uploads } from "./routes/uploads";
import { router as users, authRouter as usersAuthRouter } from "./routes/users"; // 修改這行，同時匯入 router 和 authRouter
import serve from "koa-static";

const app: Koa = new Koa();
const router: Router = new Router();

/*const welcomeAPI = async (ctx: RouterContext, next: any) => {
  ctx.body = { message: "Welcome to the blog API!" };
  await next();
};

router.get("/api/v1", welcomeAPI);
*/

// For Document:
app.use(serve(path.join(__dirname, "docs"), { index: "index.html" })); // 使用絕對路徑並指定 index.html
app.use(serve(path.join(__dirname, 'img'))); // 使用絕對路徑提供 img 資料夾中的圖片
app.use(cors());
app.use(logger());
app.use(json());
app.use(bodyParser());
app.use(router.routes());
app.use(passport.initialize());
app.use(hotels.routes()).use(hotels.allowedMethods()); // Move hotels first
app.use(articles.middleware()); // articles after hotels
app.use(special.middleware());
app.use(uploads.middleware());
app.use(users.middleware());
app.use(usersAuthRouter.routes()).use(usersAuthRouter.allowedMethods()); // 新增這行，使用 authRouter

app.use(async (ctx: RouterContext, next: any) => {
  try {
    await next();
    console.log(ctx.status);
    // 只有當請求沒有被處理時才返回 404
    if (ctx.status === 404 && ctx.body === undefined) {
      ctx.body = { err: "No such endpoint existed" };
    }
  } catch (err: any) {
    ctx.body = { err: err.message || err };
  }
});

let port = process.env.PORT || 10888;
app.listen(10888, () => {
  console.log(`Koa Started at ${port}`);
});

