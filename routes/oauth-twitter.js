const Router = require('koa-router');
const axios = require('axios');
const router = new Router();

const clientId = process.env.TWITTER_CLIENT_ID; // From X Developer Portal
const clientSecret = process.env.TWITTER_CLIENT_SECRET; // From X Developer Portal
const redirectUri = process.env.TWITTER_REDIRECT_URI; // e.g., http://localhost:5173/callback

router.get('/auth/twitter', async (ctx) => {
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.write&state=state123`;
  ctx.redirect(authUrl);
});

router.get('/callback', async (ctx) => {
  const { code, state } = ctx.query;
  if (!code) {
    ctx.body = 'Authorization failed';
    return;
  }

  const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('redirect_uri', redirectUri);

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = response.data.access_token;
    ctx.cookies.set('twitter_access_token', accessToken, { httpOnly: true });
    ctx.redirect('/');
  } catch (error) {
    ctx.body = 'Error exchanging code for token';
    console.error(error);
  }
});

module.exports = router;