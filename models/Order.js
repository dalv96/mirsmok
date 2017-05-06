'use strict'

var mongoose = require('../controllers/connect');

var Order = mongoose.Schema({
    id: {
		type: Number,
		required: true,
		unique: true
	},
    type: {
        type: Number,
        required: true
    },
    stage: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    nameExec: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exec'
        }],
        required: true
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
        }
    },
    answers: {
        collector: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
        values: [Number],
        comment: String
    }
});

var order;

Order.statics.getNext = function () {
    return order.find().sort({id: -1}).exec().then( o => {
        if(o[0] != null) {
            const newID = o[0].id + 1;
            return newID;
        } else return 1;
    })
}

order = mongoose.model('Order', Order);

module.exports = order;
