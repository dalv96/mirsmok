'use strict'

var models = require('../models');
var Order = models.Order;

module.exports = {
    init: function (req, res) {
        Order.getNext().then( ids => {
            console.log(ids);
            var order = new Order({
                id: ids,
                type: req.body.type,
                dateEvent: new Date(req.body.date),
                nameAbon: req.body.nameAbon,
                phone: req.body.phone,
                nameExec: req.body.nameExec,
                adress: req.body.adress
            })
            if(req.body.type == 0) { //Инсталяция
                order.personalAcc = req.body.personalAcc;
                order.nameCont = req.body.nameCont;
            } else {
                order.numberTT = req.body.numberTT;
                order.themeTT = req.body.themeTT;
            }
            return order.save();
        }).then(()=> res.redirect('/'))

    }
};
