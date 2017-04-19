'use strict'

var mongoose = require('../controllers/connect');

var Order = mongoose.Schema({
    id: {
		type: String,
		required: true,
		unique: true
	},
    type: {
        type: String,
        required: true
    },
    stage: {
        type: Number
    },
    nameExec: {
        type: [String],
        required: true
    },
    depInit: {
        type: Number
    },
    info: {
        dateInit: {
            type: Date
        },
        dateEvent: {
            type: Date,
            required: true
        },
        nameAbon: {
            type: String,
            required: true
        },
        adress: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        themeTT: {
            type: String
        },
        numberTT: {
            type: String
        },
        personalAcc: {
            type: String
        },
        nameCont: {
            type: String
        }
    },
    answers: {
        values: [Number],
        comment: String
    }
});

var order;

Order.statics.getNext = function () {
    return order.find().exec().then( o => {
        if(o[o.length-1]) return ++o[o.length-1].id;
        else return 1;
    });
}

order = mongoose.model('Order', Order);

module.exports = order;
