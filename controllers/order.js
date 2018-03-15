'use strict'

var models = require('../models');
var Order = models.Order;
var Account = models.Account;
var City = models.City;
var Manager = models.Manager;
var Exec = models.Exec;
var common = require('./common');
var logger = require('./log');

function render(res, success) {
    Exec.find().sort({ name: 1 }).populate('manager').then(execs => {
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

    getOrdersPage: async (req, res) => {
        var query = req.query;

        var orders = await Order.find({ stage: 0 })
                        .deepPopulate('author.city')
                        .sort({ id: -1 });

        var dlina = orders.length,
            perPage = 500,
            pages = Math.ceil(dlina/perPage),
            nowPage = query.page || 1;

        res.locals.dlina = dlina;
        res.locals.pages = pages;
        res.locals.nowPage = nowPage;
        if(nowPage > pages) nowPage = pages;
        orders = orders.slice((nowPage-1)*perPage, nowPage*perPage);

        res.render('orders/orders', {orders: orders});
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
            logger.log(`Init order ${order.id}`);
            return order.save();
        }).then(()=> {
            changeUsage(req.body.mainExec, req.body.subExec || null);
            render(res, true);
        })
    },

    editOrder: function (req, res) {
        var robots = {
            'ГУС Симферополь': 'robot_1',
            'ГУС Евпатория': 'robot_2',
            'ГУС Феодосия': 'robot_3',
            'ГУС Севастополь': 'robot_4',
            'ГУС Ялта': 'robot_5'
        };

        Order.findOne({ id: req.params.id }).then( o => {
            if(!o.author) {
                Account.findOne({login: robots[req.body.author]}).then( acc => {
                    o.author = acc;
                    return o.save();
                })
            }

            if(res.locals.__user.role == 2) {
                o.info.dateEvent = req.body.dateEvent;
                o.info.nameAbon = req.body.nameAbon;
                o.info.adress = req.body.adress;
                o.info.phone = req.body.phone;
                o.nameExec = [req.body.mainExec, req.body.subExec || null];
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
            logger.log(`Editing order ${o.id}`);
            return o.save();
        }).then(() => res.redirect(req.originalUrl));
    },

    collect: function (req, res) {
        Order.findOne({stage:0, id: req.params.id }).populate('author nameExec').then( o => {
            if (o) {
                var d = common.dateToStr(o.info.dateEvent);
                Exec.find().sort({ name: 1 }).populate('manager').then(execs => {
                    res.render('orders/order', {order: o, date: d, edit:2, execs: execs});
                })
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
            logger.log(`Editing order ${o.id}`);
            return o.save();
        }).then(() => res.redirect('/'));
    },

    getAnaliticPage: async (req, res) => {
        var execs = await Exec.find();
        var cities = await City.find();
        var managers = await Manager.find();
        var orders = await Order.find({author: {$ne: null}}).populate('author nameExec');

        var ret = [];
        orders.forEach( item => {
            if(item.nameExec.length > 0) {
                var ms = [];

                if(item.nameExec[0])
                    ms.push(item.nameExec[0].manager)
                if(item.nameExec[1])
                    ms.push(item.nameExec[1].manager);

                ret.push({
                    stage: item.stage,
                    type: item.type,
                    date: item.info.dateEvent,
                    city: item.author.city,
                    exec: item.nameExec,
                    manager: ms,
                    answers: item.answers.values
                })
            }
        });

        res.render('analitic', {
            orders: ret,
            execs: execs,
            cities: cities,
            managers: managers
        });
    },

    export: async (req, res) => {
        var query = req.query;
        res.locals.queries = query;
        res.locals.url = req.url;
        var filter = {};

        if (query.id != '' && !isNaN(query.id)) {
            filter.id = query.id
        }

        if (query.type && query.type != 'none') {
            if (query.type == 'install') {
                filter.type = 0;
            }
            if (query.type == 'remonts') {
                filter.type = 1;
            }
        }

        if (query.gus && query.gus != 'none') {
            if(query.gus == 'unknown') {
                filter.author = null;
            } else {
                var acc = await Account.find({city: query.gus});
                acc = acc.map( item => {
                    return {
                        author: item._id
                    };
                });
                filter['$or'] = acc;
            }
        }

        if (query.exec && query.exec != 'none') {
            if(query.exec == 'unknown') {
                filter.nameExec = [];
            } else {
                filter.nameExec = query.exec;
            }
        }

        if (query.stage && query.stage != 'none') {
            filter.stage = query.stage;
        }

        var orders = await Order.find(filter).deepPopulate('author.city').sort({_id:-1});

        res.send(orders);
    },

    search: async (req, res) => {
        var query = req.query;
        res.locals.queries = query;
        res.locals.url = req.url;
        var filter = {};

        if (query.id != '' && !isNaN(query.id)) {
            filter.id = query.id
        }

        if (query.type && query.type != 'none') {
            if (query.type == 'install') {
                filter.type = 0;
            }
            if (query.type == 'remonts') {
                filter.type = 1;
            }
        }

        if (query.gus && query.gus != 'none') {
            if(query.gus == 'unknown') {
                filter.author = null;
            } else {
                var acc = await Account.find({city: query.gus});
                acc = acc.map( item => {
                    return {
                        author: item._id
                    };
                });
                filter['$or'] = acc;
            }
        }

        if (query.exec && query.exec != 'none') {
            if(query.exec == 'unknown') {
                filter.nameExec = [];
            } else {
                filter.nameExec = query.exec;
            }
        }

        if (query.stage && query.stage != 'none') {
            filter.stage = query.stage;
        }

        // if (!query.start) query.start = new Date(1996, 7, 28);
        // else query.start = new Date(query.start);
        //
        // if (!query.end) query.end = new Date(2101, 7, 28);
        // else query.end = new Date(query.end);

        // filter['info.dateEvent'] = { $gte: new Date(query.start), $lte: new Date(query.end) }

        var orders = await Order.find(filter).deepPopulate('author.city').sort({_id:-1});

        var dlina = orders.length,
            perPage = 100,
            pages = Math.ceil(dlina/perPage),
            nowPage = query.page || 1;

        res.locals.dlina = dlina;
        res.locals.pages = pages;
        res.locals.nowPage = nowPage;
        if(nowPage > pages) nowPage = pages;
        orders = orders.slice((nowPage-1)*perPage, nowPage*perPage);

        var execs = await Exec.find();
        var cities = await City.find();

        res.render('search', {orders: orders, execs: execs, cities: cities});
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
                Exec.find().sort({ name: 1 }).populate('manager').then(execs => {
                    res.render('orders/order', {order: o, date: d, edit: editFlag, execs: execs});
                })
            } else res.render('404');
        })
    },

    delete: function (req, res) {
        Order.findOne({'id' : req.params.id}).populate('author').then( o => {
            if(o.stage == 0 && (res.locals.__user.role == 2 || res.locals.__user.role == 0)) {
                logger.log(`Delete order ${o.id}`);
                return o.remove();
            }
        }).then(() => res.status(200).send('Ok'))

    }
};
