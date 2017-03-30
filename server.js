// ========================
// get the packages we need
// ========================
var ms = require('ms');
var koa = require('koa');   
var parse = require('koa-bodyparser');
var r = require('rethinkdbdash');
var fs = require('co-fs');
var Koa_jwt = require('koa-jwt');
var Koa = require('koa');
var Router = require('koa-router');
var morgan      = require('koa-morgan');
var mongoose    = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
const jwt_refresh = require('./app/TokenRefresh');
const Pug = require('koa-pug')

// create app instance
var app = new Koa();

// =======================
// configuration =========
// =======================

var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
// use body parser so we can get info from POST and/or URL parameters
app.use(parse())
// use morgan to log requests to the console
app.use(morgan('dev'));
const pug = new Pug({
    viewPath: './views',
    basedir: './views',
    app: app // equals to pug.use(app) and app.use(pug.middleware) 
})
// =======================
// routes ================
// =======================

app.use(Koa_jwt({ secret: config.JWT_SECRET }).unless({ path: ['/api/authenticate', '/api/authenticate/refresh','/','/setup'] }))

// API ROUTES -------------------

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

apiRouter.post('/authenticate', async function(ctx) {

    // find the user
    await User.findOne({
        name:  ctx.request.body.name
    }, function(err, user) {
        console.log(`${ctx.request.socket.address().address}\n${ctx.request.ip}`)
        if (err) throw err;

        if (!user) {
        ctx.response.body = { success: false, message: 'Authentication failed. User not found.' };
        } else if (user) {

        // check if password matches
        if (user.password != ctx.request.body.password) {
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
    });
apiRouter.get('/', function(ctx) {
    ctx.body = { message: 'Welcome to the coolest API on earth!' };
});
apiRouter.get('/users', async function(ctx) {
    ctx.body = await User.find({})
});
apiRouter.post('/authenticate/refresh', async function (ctx) {
    let token = await jwt_refresh.refresh(ctx.request.body.token, 300, config.JWT_SECRET);
    ctx.response.body = {
        success: true,
        message: 'Enjoy your refreshed token!',
        token: token
    };
});

const router = new Router()

router
    .use('/api', apiRouter.routes())
    .get('/', function (ctx) {
        ctx.body = 'Hello! The API is at http://localhost:' + port + '/api';
    })
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
    });

app
.use(router.routes())
.use(router.allowedMethods());

// =======================
// start the server ======
// =======================

app.listen(port);
console.log('Magic happens at http://localhost:' + port);