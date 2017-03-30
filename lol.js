var koa = require('koa');
var _ = require('koa-route');
var parse = require('co-body');
var r = require('rethinkdbdash');
var fs = require('co-fs');
var jwt = require('jsonwebtoken');
var app = new koa();

app.use(_.get('/index', function*(){
    this.type = "text/html";
    this.body = yield fs.readFile('index.html');
}));

app.use(_.get('/home', function(request, response){
    response.contentType('text/html');
    response.send("It's homepage");
    //response.post("It's homepage");
    //response.end();
}))

app.use(_.post('/session', function*(){
    var creds = yield parse(this);
    var users = yield r.table('users').getAll(creds.username, {index:'username'}).run();
    var user = users[0];
console.log("db here");
    if(user && user.password === creds.password){
        this.status = 200;
        this.set('x-auth-token', jwt.sign({userId: user.id}, 'secret'));
    } else {
        var e = new Error('invalid credit');
        e.status = 401;
        throw e;
    }
console.log("script finished");
}));

app.use(_.get('/accounts', function*(){
    this.body = yield r.table('accounts').getAll(
        this.userId, {index: 'userId'}
    ).run();
    console.log("ids parsed");
}));

app.use(function(){
    console.log('Server running...');
}).listen(3000);