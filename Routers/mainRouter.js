// =======================
// routes ================
// =======================
const Router = require('koa-router');
const apiRouter = require('./api')//use api routes
const router = new Router();
router
    .use('/api', apiRouter.routes())
    .get('/setup', ctx => {
        ctx.render('user')
    })
    .post('/setup', async function (ctx) {
        // create a sample user
        let user = new User({
            username: ctx.request.body.username,
            password: ctx.request.body.password,
            role: 'user'
        });
        await user.save()// save the sample user
        let out = { success: true };
        ctx.body = out;
    })
    .get('/', function (ctx) {
        ctx.body = 'Hello! The API is at /api';
    });
module.exports = router;