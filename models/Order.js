'use strict'

var mongoose = require('../controllers/connect');

var Order = mongoose.Schema({
    id: {
		type: String,
		required: true,
		unique: true
	},
    typeOrder: {
        type: String,
        required: true
    },
    dateEvent: {
        type: Date,
        required: true
    },
    tt: {
        type: String
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
    nameExec: {
        type: String,
        required: true
    },
    themeTT: {
        type: String,
        required: true
    },
    personalAcc: {
        type: String,
        required: true
    },
    nameCont: {
        type: String
    }
});

var order;

Order.statics.getNext = function () {
    return order.findOne({ sort:{ 'id': -1 } }).exec().then( o => {
        if(o) return o.id;
        else return 1;
    });
}

order = mongoose.model('Order', Order);

module.exports = order;
