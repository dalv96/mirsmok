'use strict';

var mongoose = require('../controllers/connect');

var Exec = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    usage: {
        type: Boolean,
        required: true
    }
});

var exec = mongoose.model('Exec', Exec);

module.exports = exec;
