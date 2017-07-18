'use strict'

var conf = require('../conf');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var options = {
    useMongoClient: true,
    promiseLibrary: global.Promise
};

var url = conf.get("database:url");
var name = conf.get("database:name");
var uri = 'mongodb://' + url + '/' + name;

mongoose.connect(uri, options);

mongoose.connection.on('connected', function() {
    console.log('Connected to DB.');
});

module.exports = mongoose;
