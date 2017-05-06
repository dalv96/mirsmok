'use strict';

var mongoose = require('../controllers/connect');

var Manager = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    usage: {
        type: Boolean,
        required: true
    }
});

var manager = mongoose.model('Manager', Manager);

module.exports = manager;
