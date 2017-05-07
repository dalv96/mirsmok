'use strict';

var mongoose = require('../controllers/connect');

var Manager = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    usage: {
        type: Boolean,
        required: true
    }
});

var manager;

Manager.statics.getNext = function () {
    return manager.find().sort({id: -1}).exec().then( o => {
        if(o[0] != null) {
            const newID = o[0].id + 1;
            return newID;
        } else return 1;
    })
}

manager = mongoose.model('Manager', Manager);

module.exports = manager;
