'use strict'

var fs = require('fs');
var nconf = require('nconf');

nconf.argv()
    .env()
    .file({
        file: 'conf/conf.json'
    });

module.exports = nconf;
