
// API ROUTES -------------------
var Router = require('koa-router');
const bcrypt = require('bcrypt-nodejs')
// get an instance of the router for api routes
var apiRouter = new Router();

apiRouter.use(async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        console.log(err)
        ctx.status = err.status || 500
        if (err.message)
            ctx.body = err.message
    }
})

apiRouter
    .post('/authenticate', async function (ctx) {
        // find the user
        await User.findOne({
            name: ctx.request.body.name
        }, function (err, user) {
            console.log(`${ctx.request.socket.address().address}\n${ctx.request.ip}`)
            if (err) throw err;

            if (!user) {
                ctx.response.body = { success: false, message: 'Authentication failed. User not found.' };
            } else if (user) {

                // check if password matches
                if (bcrypt.compareSync(ctx.request.body.password, user.passwor)){
                    ctx.response.body = { success: false, message: 'Authentication failed. Wrong password.' };
                } else {
                    // if user is found and password is right
                    // create a token
                    let token = jwt.sign(user, config.JWT_SECRET, {
                        expiresIn: 300 // expires in 24 hours
                    });
                    // return the information including token as JSON
                    ctx.response.body = {
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    };
                }
            }
        });
    })
    .get('/', function (ctx) {
        ctx.body = { message: 'Welcome to the coolest API on earth!' };
    }).get('/users', async function (ctx) {
        ctx.body = await User.find({})
    }).post('/authenticate/refresh', async function (ctx) {
        let token = await jwt_refresh.refresh(ctx.request.body.token, 300, config.JWT_SECRET);
        ctx.response.body = {
            success: true,
            message: 'Enjoy your refreshed token!',
            token: token
        };
    
    });
module.exports = apiRouter;