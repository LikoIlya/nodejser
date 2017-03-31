// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var config = require('../../config')
var Schema = mongoose.Schema;
var users = mongoose.createConnection(config.database) // connect to collection users
// set up a mongoose model and pass it using module.exports
module.exports = users.model('User', new Schema({ 
    username: String,
    password: String,
    role: String
}));