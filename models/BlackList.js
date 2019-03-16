'use strict';

var mongoose = require('../controllers/connect');

var BlackList = mongoose.Schema({
    phone: {
        type: String,
        required: true
    }
});

var blackList = mongoose.model('BlackList', BlackList);

module.exports = blackList;
