import Router, { RouterContext } from "koa-router";
import bodyParser from "koa-bodyparser";
import * as model from "../models/hotels";
import * as likes from "../models/likes";
import * as favs from "../models/favs";
import * as msgs from "../models/msgs";
import { validateHotel } from "../controllers/validation";
import { basicAuth } from "../controllers/auth";

interface Hotel {
  id: number;
  title: string;
  alltext: string;
  summary: string | null;
  imageurl: string;
  agencyid: number;
  description: string;
  links: {
    likes: string;
    fav: string;
    msg: string;
    self: string;
  };
}

const router: Router = new Router({ prefix: "/api/v1/hotels" });

const getAll = async (ctx: RouterContext, next: any) => {
  const { limit = 100, page = 1, order = "dateCreated", direction = "ASC" } = ctx.request.query;
  const parsedLimit = parseInt(limit as string, 10);
  const parsedPage = parseInt(page as string, 10);
  const result = await model.getAll(20, 1, order, direction); // Fix limit and page if needed
  if (result.length) {
    const body: Hotel[] = result.map((hotel: any) => {
      const { id = 0, title = "", alltext = "", summary = "", imageurl = "", agencyid = 0, description = "" }: Partial<Hotel> = hotel;
      const links = {
        likes: `http://${ctx.host}/api/v1/hotels/${hotel.id}/likes`,
        fav: `http://${ctx.host}/api/v1/hotels/${hotel.id}/fav`,
        msg: `http://${ctx.host}/api/v1/hotels/${hotel.id}/msg`,
        self: `http://${ctx.host}/api/v1/hotels/${hotel.id}`,
      };
      return { id, title, alltext, summary, imageurl, agencyid, description, links };
    });
    ctx.body = body;
    await next();
  }
};

const createHotel = async (ctx: RouterContext, next: any) => {
  const body = ctx.request.body;
  console.log(`role of user ${ctx.state.user.user.role}`);
  if (ctx.state.user.user.role === "admin") {
    let result = await model.add(body);
    if (result.status == 201) {
      ctx.status = 201;
      ctx.body = body;
    } else {
      ctx.status = 500;
      ctx.body = { err: "Insert data failed" };
    }
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized` };
    ctx.status = 401;
  }
};

const getById = async (ctx: RouterContext, next: any) => {
  let id = +ctx.params.id;
  let hotel = await model.getById(id); // Changed from 'article' to 'hotel'
  if (hotel.length) {
    ctx.body = hotel[0];
    ctx.status = 200;
  } else {
    ctx.status = 404;
  }
  await next();
};

const updateHotel = async (ctx: RouterContext, next: any) => {
  let id = +ctx.params.id;
  if (ctx.state.user.user.role === "admin") {
    let c: any = ctx.request.body;
    console.log("agencyid " + c.agencyid); // Changed from 'authorid' to 'agencyid'
    if (c.agencyid == ctx.state.user.user.id) {
      let result = await model.update(c, id);
      if (result) {
        ctx.status = 201;
        ctx.body = `Hotel with id ${id} updated`;
      }
      await next();
    } else {
      ctx.body = { message: "You are not the agency and you have no right to update this hotel" };
      ctx.status = 401;
    }
  } else {
    ctx.body = { msg: " you are not authorized" };
    ctx.status = 401;
  }
};

const deleteHotel = async (ctx: RouterContext, next: any) => {
  let id = +ctx.params.id;
  if (ctx.state.user.user.role === "admin") {
    let hotel: any = await model.deleteById(id); // Changed from 'article' to 'hotel'
    ctx.status = 201;
    ctx.body = hotel.affectedRows ? { message: "removed" } : { message: "error" };
    await next();
  } else {
    ctx.body = { msg: " you are not authorized" };
    ctx.status = 401;
  }
};

async function likesCount(ctx: RouterContext, next: any) {
  const id = ctx.params.id;
  const result = await likes.count(id);
  ctx.body = result ? result : 0;
  await next();
}

async function likePost(ctx: RouterContext, next: any) {
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const id = parseInt(ctx.params.id);
  const result: any = await likes.like(id, uid);
  ctx.body = result.affectedRows ? { message: "liked", userid: result.userid } : { message: "error" };
  await next();
}

async function dislikePost(ctx: RouterContext, next: any) {
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const id = parseInt(ctx.params.id);
  const result: any = await likes.dislike(id, uid);
  ctx.body = result.affectedRows ? { message: "disliked" } : { message: "error" };
  await next();
}

async function userFav(ctx: RouterContext, next: any) {
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const result = await favs.listFav(uid);
  ctx.body = result ? result : 0;
  await next();
}

async function postFav(ctx: RouterContext, next: any) {
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const id = parseInt(ctx.params.id);
  const result: any = await favs.addFav(id, uid);
  ctx.body = result.affectedRows ? { message: "added", userid: result.userid } : { message: "error" };
  await next();
}

async function rmFav(ctx: RouterContext, next: any) {
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const id = parseInt(ctx.params.id);
  const result: any = await favs.removeFav(id, uid);
  ctx.body = result.affectedRows ? { message: "removed" } : { message: "error" };
  await next();
}

async function listMsg(ctx: RouterContext, next: any) {
  const id = parseInt(ctx.params.id);
  const result = await msgs.getMsg(id);
  ctx.body = result ? result : 0;
  await next();
}

async function addMsg(ctx: RouterContext, next: any) {
  const id = parseInt(ctx.params.id);
  const user = ctx.state.user;
  const uid: number = user.user.id;
  const uname = user.user.username;
  const uemail = user.user.email;
  let msg: any = ctx.request.body;
  console.log("ctx.request.body ", ctx.request.body);
  console.log("..msg ", msg);
  const result: any = await msgs.add_Msg(id, uid, uname, uemail, msg);
  ctx.body = result.affectedRows ? { message: "added" } : { message: "error" };
  await next();
}

async function rmMsg(ctx: RouterContext, next: any) {
  if (ctx.state.user.user.role === "admin") {
    let b: any = ctx.request.body;
    const id = parseInt(ctx.params.id);
    const result: any = await msgs.removeMsg(id, b);
    ctx.body = result.affectedRows ? { message: "removed" } : { message: "error" };
    await next();
  } else {
    ctx.body = { msg: ` ${ctx.state.user.user.role} role is not authorized to delete user comment` };
    ctx.status = 401;
  }
}

router.get("/", getAll);
router.post("/", basicAuth, bodyParser(), validateHotel, createHotel); // Changed from createArticle
router.get("/:id([0-9]{1,})", getById);
router.put("/:id([0-9]{1,})", basicAuth, bodyParser(), validateHotel, updateHotel); // Changed from updateArticle
router.delete("/:id([0-9]{1,})", basicAuth, deleteHotel); // Changed from deleteArticle
router.get("/:id([0-9]{1,})/likes", likesCount);
router.post("/:id([0-9]{1,})/likes", basicAuth, likePost);
router.del("/:id([0-9]{1,})/likes", basicAuth, dislikePost);
router.get("/fav", basicAuth, userFav);
router.post("/:id([0-9]{1,})/fav", basicAuth, postFav);
router.del("/:id([0-9]{1,})/fav", basicAuth, rmFav);
router.get("/:id([0-9]{1,})/msg", listMsg);
router.post("/:id([0-9]{1,})/msg", basicAuth, bodyParser(), addMsg);
router.del("/:id([0-9]{1,})/msg", basicAuth, bodyParser(), rmMsg);

export { router };