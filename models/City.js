'use strict';

var mongoose = require('../controllers/connect');

var City = mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

var city;

City.statics.getNext = function () {
    return city.find().sort({id: -1}).exec().then( o => {
        if(o[0] != null) {
            const newID = o[0].id + 1;
            return newID;
        } else return 1;
    })
}

city = mongoose.model('City', City);

module.exports = city;
