import Router from 'koa-router';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
dotenv.config();
const router = new Router();
// X API client
const twitterClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
});
// Middleware to validate Authorization header
const authenticate = async (ctx, next) => {
    const authHeader = ctx.request.headers.authorization;
    // Adjust based on your auth setup in routes/articles.ts
    const expectedToken = process.env.AUTH_TOKEN || ctx.state.user;
    if (!authHeader || authHeader !== `Basic ${expectedToken}`) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
    }
    await next();
};
// POST /post-to-twitter
router.post('/post-to-twitter', authenticate, async (ctx) => {
    const { text } = ctx.request.body;
    if (!text) {
        ctx.status = 400;
        ctx.body = { error: 'Text is required' };
        return;
    }
    try {
        const tweet = await twitterClient.v2.tweet(text);
        ctx.status = 200;
        ctx.body = { message: 'Tweet posted successfully', data: tweet.data };
    }
    catch (error) {
        console.error('Error posting to X:', error);
        ctx.status = 500;
        ctx.body = { error: 'Failed to post to X', details: error instanceof Error ? error.message : String(error) };
    }
});
export { router };
