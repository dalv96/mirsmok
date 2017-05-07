'use strict';

var mongoose = require('../controllers/connect');

var Exec = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
    usage: {
        type: Boolean,
        required: true
    }
});

var exec;

Exec.statics.getNext = function () {
    return exec.find().sort({id: -1}).exec().then( o => {
        if(o[0] != null) {
            const newID = o[0].id + 1;
            return newID;
        } else return 1;
    })
}

exec = mongoose.model('Exec', Exec);

module.exports = exec;
