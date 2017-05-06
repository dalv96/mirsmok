'use strict';

const Order = require('../models').Order;
const Account = require('../models').Account;

var acc;
Account.find().then( a => {
    acc = a[2]._id;
});
Order.find({stage: 0}).then( o => {
    for (var i = 0; i < 2000; i++) {
        o[i].stage = 1;
        o[i].answers.collector = acc;
        o[i].answers.values = [
            Math.floor(Math.random() * (10 - 0)) + 0,
            Math.floor(Math.random() * (10 - 0)) + 0,
            Math.floor(Math.random() * (10 - 0)) + 0,
            Math.floor(Math.random() * (10 - 0)) + 0
        ];
        console.log('Saving order ', o[i].id);
        o[i].save();
    }
})
