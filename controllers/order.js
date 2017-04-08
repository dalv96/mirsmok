'use strict'

var models = require('../models');
var Order = models.Order;
var common = require('./common');

module.exports = {
    getInitPage: function (req, res) {
        res.render('orders/init');
    },

    getOrdersPage: function (req, res) {
        Order.find({ stage: 0 }).sort({ dateInit: -1}).then( o => {
            res.render('orders/orders', {orders: o});
        })
    },

    init: function (req, res) {
        Order.getNext().then( ids => {
            var arr = [res.locals.__user.fullName];
            for (var i = 2; i <= 3; i++) {
                if(req.body['nameExec'+i]) {
                    arr.push(req.body['nameExec'+i]);
                }
            }
            var order = new Order({
                id: ids,
                type: req.body.type,
                stage: 0,
                dateEvent: new Date(req.body.date),
                dateInit: new Date(),
                nameAbon: req.body.nameAbon,
                phone: req.body.phone,
                nameExec: arr,
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
        }).then(()=> res.render('orders/init', {success:true}))

    },

    editOrder: function (req, res) {
        Order.findOne({ id: req.params.id }).then( o => {
            if(res.locals.__user.role == 3) {
                o.stage = 1;
                o.answers.firstQ = req.body.first;
                o.answers.secQ = req.body.sec;
                o.answers.thirdQ = req.body.third;
                o.answers.comment = req.body.comment;
            }
            if(res.locals.__user.role == 2) {
                var arr = [o.nameExec[0]];
                for (var i = 2; i <= 3; i++) {
                    if(req.body['nameExec'+i]) {
                        arr.push(req.body['nameExec'+i]);
                    }
                }
                o.type = req.body.type;
                o.dateEvent = new Date(req.body.date);
                o.nameAbon = req.body.nameAbon;
                o.phone = req.body.phone;
                o.nameExec = arr;
                o.adress = req.body.adress;

                if(req.body.type == 0) { //Инсталяция
                    o.personalAcc = req.body.personalAcc;
                    o.nameCont = req.body.nameCont;
                    o.numberTT = null;
                    o.themeTT = null;
                } else { // Ремонты
                    o.numberTT = req.body.numberTT;
                    o.themeTT = req.body.themeTT;
                    o.personalAcc = null;
                    o.nameCont = null;
                }
            }
            console.log('Editing order ', o.id);
            return o.save();
        }).then(() => res.redirect('/'));
    },

    collect: function (req, res) {
        Order.findOne({stage:0, id: req.params.id }).then( o => {
            if (o) {
                var d = common.dateToStr(o.dateEvent);
                res.render('orders/order', {order: o, date: d});
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
        switch (req.query.filter) {
            case 'comment':
                Order.find({'answers.comment' : {$ne: "" }}).sort({_id:-1}).then( o => {
                    res.render('orders/ordersSearch', {orders: o});
                })
                break;
            case 'my':
                var filter = res.locals.__user.dep || {$ne: null};
                    Order.find({initiator:filter}).sort({_id:-1}).then( o => {
                        res.render('orders/ordersSearch', {orders: o});
                    })
                break;
            default:
                Order.find().sort({_id:-1}).then( o => {
                    res.render('orders/ordersSearch', {orders: o});
                })
                break;
        }

    },

    getContent: function (req, res) {
        Order.findOne({'id' : req.params.id}).then( o => {
            if (o) {
                var d = common.dateToStr(o.dateEvent);
                res.render('orders/orderEdit', {order: o, date: d});
            } else res.render('404');
        })
    }
};
