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

function changeUsage(main, sub) {
    Exec.findOne({_id: main}).then(ex => {
        ex.usage = true;
        ex.save();
    })
    if(sub) {
        Exec.findOne({_id: sub}).then(ex => {
            ex.usage = true;
            ex.save()
        })
    }
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
        }).then(()=> {
            changeUsage(req.body.mainExec, req.body.subExec || null);
            render(res, true);
        })
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
                if(req.body.comment.trim().length < 1) {
                    o.answers.comment = null;
                } else o.answers.comment = req.body.comment.trim();
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
            if(req.body.comment.trim().length < 1) {
                o.answers.comment = null;
            } else o.answers.comment = req.body.comment.trim();
            console.log('Saving order ', o.id);
            return o.save();
        }).then(() => res.redirect('/'));
    },

    getAnaliticPage: function (req, res) {
        Order.find().populate('author').then( o => {
            var ret = o.map( item => {
                return {
                    stage: item.stage,
                    type: item.type,
                    date: item.info.dateInit,
                    department: item.author.department,
                    exec: item.nameExec,
                    answers: item.answers.values
                }
            })
            res.render('analitic', {orders: ret});
        })
    },

    search: function (req, res) {
        switch (req.query.filter) {
            case 'comment':
                Order.find({'answers.comment' : {$ne: null }}).populate('author').sort({_id:-1}).then( o => {
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
