'use strict'

var models = require('../models');
var Order = models.Order;
var common = require('./common');

module.exports = {
    getInitPage: function (req, res) {
        res.render('init');
    },

    getOrdersPage: function (req, res) {
        Order.find({ stage: 0 }).sort({ dateInit: -1}).then( o => {
            res.render('orders', {orders: o});
        })
    },

    init: function (req, res) {
        Order.getNext().then( ids => {
            var order = new Order({
                id: ids,
                type: req.body.type,
                stage: 0,
                dateEvent: new Date(req.body.date),
                dateInit: new Date(),
                nameAbon: req.body.nameAbon,
                phone: req.body.phone,
                nameExec: req.body.nameExec,
                adress: req.body.adress,
                initiator: res.locals.__user.dep
            })
            if(req.body.type == 0) { //Инсталяция
                order.personalAcc = req.body.personalAcc;
                order.nameCont = req.body.nameCont;
            } else { // Ремонты
                order.numberTT = req.body.numberTT;
                order.themeTT = req.body.themeTT;
            }
            return order.save();
        }).then(()=> res.redirect('/'))

    },

    collect: function (req, res) {
        Order.findOne({ id: req.params.id }).then( o => {
            var d = common.dateToStr(o.dateEvent);
            res.render('order', {order: o, date: d});
        })

    }
};
