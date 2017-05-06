'use strict';

const Order = require('../models').Order;
const Account = require('../models').Account;
var acc;

Account.find().then( a => {
    acc = a[1]._id;
});

Order.getNext().then(q => {
    for (var i = q; i < q + 10000; i++) {
       var order = new Order({
           id: i,
           type: 1,
           stage: 0,
           author: acc,
           nameExec: ['590d784159943a2168fa6adc', null],
           info: {
               dateInit: new Date(),
               dateEvent: new Date(),
               nameAbon: 'asds',
               phone: 'sdasdas',
               adress: 'asdasd',
           }
       })
       if(1 == 0) { //Инсталяция
           order.info.personalAcc = 'asdasdasd';
       } else { // Ремонты
           order.info.numberTT = 'asdasdasdas';
           order.info.themeTT = 'asdasdasdasd';
       }
       console.log('Init order', order.id);
       order.save();
    }
})
