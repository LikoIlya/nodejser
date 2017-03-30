var koa = require('koa');   
var parse = require('co-body');
var r = require('rethinkdbdash');
var fs = require('co-fs');
var jwt = require('jsonwebtoken');
var koa = require('koa');
var fs = require('co-fs');
var site = require('koa-route');
var app = new koa();

app.use(site.get('/people.json', function(ctx) {
  // We want to set the content-type header so that the browser understands
  //  the content of the response.
  ctx.type='application/json'
  // Normally, the would probably come from a database, but we can cheat:
  var people = [
    { name: 'Dave', location: 'Atlanta' },
    { name: 'Santa Claus', location: 'North Pole' },
    { name: 'Man in the Moon', location: 'The Moon' }
  ];

  // Since the request is for a JSON representation of the people, we
  //  should JSON serialize them. The built-in JSON.stringify() function
  //  does that.
  var peopleJSON = JSON.stringify(people);

  // Now, we can use the response object's send method to push that string
  //  of people JSON back to the browser in response to this request:
  ctx.body=people;
}));
app.use(function(){
    console.log('Server running...');
}).listen(3000);