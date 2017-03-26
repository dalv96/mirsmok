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
            console.log('Init order', order.id);
            return order.save();
        }).then(()=> res.redirect('/'))

    },

    collect: function (req, res) {
        Order.findOne({stage:0, id: req.params.id }).then( o => {
            if (o) {
                var d = common.dateToStr(o.dateEvent);
                res.render('order', {order: o, date: d});
            } else res.render('404');
        })
    },

    saveOrder: function (req, res) {
        Order.findOne({ id: req.params.id }).then( o => {
            o.stage = 1;
            o.answers.firstQ = req.body.first;
            o.answers.secQ = req.body.sec;
            o.answers.thirdQ = req.body.third;
            o.answers.comment = req.body.comment;
            console.log('Saving order ', o.id);
            return o.save();
        }).then(() => res.redirect('/'));
    },

    getAnaliticPage: function (req, res) {
        var option = {
            stage: 1
        };
        var now = new Date();
        switch (req.query.period) {
            case 'year':
                option = {
                    stage: 1,
                    dateInit: {
                        $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1)
                    }
                }
                break;
            case 'season':
                option = {
                    stage: 1,
                    dateInit: {
                        $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate() + 1)
                    }
                }
                break;
            case 'month':
                option = {
                    stage: 1,
                    dateInit: {
                        $gte: new Date(now.getFullYear(), now.getMonth() -1, now.getDate() + 1)
                    }
                }
                break;
            case 'week':
                option = {
                    stage: 1,
                    dateInit: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
                    }
                }
                break;
            case 'day':
                option = {
                    stage: 1,
                    dateInit: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                    }
                }
                break;
        }
        Order.find(option).then( o => {
            var averages = common.calculateAverages(o);
            res.render('analitic', {averages, period:req.query.period});
        })
    },

    search: function (req, res) {
        Order.find({'answers.comment' : {$ne: "" }}).sort({_id:-1}).then( o => {
            res.render('ordersSearch', {orders: o});
        })
    },

    getContent: function (req, res) {
        Order.findOne({'id' : req.params.id}).then( o => {
            if (o) {
                var d = common.dateToStr(o.dateEvent);
                res.render('orderContent', {order: o, date: d});
            } else res.render('404');
        })
    }
};
