// ========================
// get the packages we need
// ========================  
var parse = require('koa-bodyparser');
var fs = require('co-fs');
var Koa_jwt = require('koa-jwt');
var Koa = require('koa');
const session = require('koa-session-store')
var morgan      = require('koa-morgan');
var mongoose    = require('mongoose');
var config = require('./config'); // get our config file
var router = require('./Routers/mainRouter');
const Pug = require('koa-pug')
const MongooseStore = require('koa-session-mongoose')

// create app instance
var app = new Koa();

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 3000 //set port
var con = mongoose.createConnection(config.database_session) // connect to session

app.keys = ['eow5u6ciu3r23j']
//mongoose.connect(config.database); // connect to collection users
//mongoose.connect(config.database_session) // connect to session
// use body parser so we can get info from POST and/or URL parameters
app.use(parse())
// use morgan to log requests to the console
app.use(morgan('dev'))
//use pug to render pages
const pug = new Pug({
    viewPath: './views',
    basedir: './views',
    app: app // equals to pug.use(app) and app.use(pug.middleware) 
})
 app.use(session({
   store: new MongooseStore({
     connection: con,
     collection: 'session',
     expires: 60 * 60, // 2 weeks is the default
     model: 'KoaSession'
  })
}))

/*app.use(ctx => {
  var n = ctx.session.views || 0
  ctx.session.views = ++n
})*/
// =======================
// routes ================
// =======================
//set routes that protected and not protected (unless part) with JWT
app.use(Koa_jwt({ secret: config.JWT_SECRET }).unless({ path: ['/api/authenticate', '/api/authenticate/refresh', '/', '/setup'] }))
//use all routers
app
.use(router.routes())
.use(router.allowedMethods());

// =======================
// start the server ======
// =======================

app.listen(port);
console.log('Magic happens at http://localhost:' + port);