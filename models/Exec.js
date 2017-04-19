'use strict';

var mongoose = require('../controllers/connect');

var Exec = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    fullName: {
        type: String,
        required: true
    }
});

var exec = mongoose.model('Exec', Exec);

module.exports = exec;
