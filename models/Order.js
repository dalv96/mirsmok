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
    nameExec: {
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
});

var order;

Order.statics.getNext = function () {
    return order.find().sort({ 'id': -1 }).exec().then( o => {
        console.log(o[0].id);
        if(o[0]) return ++o[0].id;
        else return 1;
    });
}

order = mongoose.model('Order', Order);

module.exports = order;
