'use strict'

var models = require('../models');
var Order = models.Order;
var Account = models.Account;
var Exec = models.Exec;
var common = require('./common');

function render(res, success) {
    Exec.find().sort({ name: 1 }).then(execs => {
        res.render('orders/init', {execs: execs, success: success});
    })
}

module.exports = {
    getInitPage: function (req, res) {
        Exec.find().sort({ name: 1 }).then(execs => {
            render(res, false);
        })
    },

    getOrdersPage: function (req, res) {
        Order.find({ stage: 0 }).populate('author').sort({ id: -1 }).then( o => {
            res.render('orders/orders', {orders: o});
        })
    },

    init: function (req, res) {
        Order.getNext().then( ids => {
            var order = new Order({
                id: ids,
                type: req.body.type,
                stage: 0,
                author: res.locals.__user._id,
                nameExec: [req.body.mainExec, req.body.subExec || null],
                info: {
                    dateInit: new Date(),
                    dateEvent: new Date(req.body.date),
                    nameAbon: req.body.nameAbon,
                    phone: req.body.phone,
                    adress: req.body.adress,
                }
            })
            if(req.body.type == 0) { //Инсталяция
                order.info.personalAcc = req.body.personalAcc;
            } else { // Ремонты
                order.info.numberTT = req.body.numberTT;
                order.info.themeTT = req.body.themeTT;
            }
            console.log('Init order', order.id);
            return order.save();
        }).then(()=> render(res, true))
    },

    editOrder: function (req, res) {
        Order.findOne({ id: req.params.id }).then( o => {
            if(res.locals.__user.role == 2) {
                o.info.dateEvent = req.body.dateEvent;
                o.info.nameAbon = req.body.nameAbon;
                o.info.adress = req.body.adress;
                o.info.phone = req.body.phone;
                if(o.type == 0) {
                    o.info.numberTT = req.body.numberTT;
                    o.info.themeTT = req.body.themeTT;
                }
                if(o.type == 1)
                    o.info.personalAcc = req.body.personalAcc;
            }
            if(res.locals.__user.role == 3) {
                o.answers.values = req.body.answers;
                o.answers.comment = req.body.comment;
            }
            console.log('Editing order ', o.id);
            return o.save();
        }).then(() => res.redirect('/'));
    },

    collect: function (req, res) {
        Order.findOne({stage:0, id: req.params.id }).populate('author nameExec').then( o => {
            if (o) {
                var d = common.dateToStr(o.info.dateEvent);
                res.render('orders/order', {order: o, date: d, edit:2});
            } else res.render('404');
        })
    },

    saveOrder: function (req, res) {
        Order.findOne({ id: req.params.id }).then( o => {
            o.stage = 1;
            o.answers.collector = res.locals.__user._id;
            o.answers.values = req.body.answers;
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
                Order.find({'answers.comment' : {$ne: "" }}).populate('author').sort({_id:-1}).then( o => {
                    res.render('orders/ordersSearch', {orders: o});
                })
                break;
            case 'my':
                var filter = {};
                if( res.locals.__user.dep != null) {
                    filter = {'author' : res.locals.__user._id};
                } else filter = {'answers.collector': res.locals.__user._id};
                    Order.find(filter).populate('author').sort({_id:-1}).then( o => {
                        res.render('orders/ordersSearch', {orders: o});
                    })
                break;
            default:
                Order.find().populate('author').sort({_id:-1}).then( o => {
                    res.render('orders/ordersSearch', {orders: o});
                })
                break;
        }

    },

    getContent: function (req, res) {
        Order.findOne({'id' : req.params.id}).populate('author nameExec').then( o => {
            if (o) {
                var d = common.dateToStr(o.info.dateEvent);
                var editFlag;
                if(res.locals.__user.role == 2 && o.stage == 0) {
                    editFlag = 1;
                }
                if( res.locals.__user.role == 3 && o.stage == 1) editFlag = 2;
                res.render('orders/order', {order: o, date: d, edit: editFlag});
            } else res.render('404');
        })
    },

    delete: function (req, res) {
        Order.findOne({'id' : req.params.id}).populate('author').then( o => {
            if(o.stage == 0 && res.locals.__user.role == 2) {
                return o.remove();
            }
        }).then(() => res.status(200).send('Ok'))

    }
};
