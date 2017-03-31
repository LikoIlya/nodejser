// =======================
// routes ================
// =======================
const Router = require('koa-router');
const bcrypt = require('bcrypt-nodejs')
const apiRouter = require('./api')//use api routes
const router = new Router();
const salt = bcrypt.genSaltSync();
router
    .use('/api', apiRouter.routes())
    .get('/setup', ctx => {
        ctx.render('user')
    })
    .post('/setup', async function (ctx) {
        // create a sample user
        let user = new User({
            username: ctx.request.body.username,
            password: bcrypt.hashSync(ctx.request.body.password,salt),
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