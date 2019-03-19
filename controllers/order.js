'use strict';

var models = require('../models');
var Order = models.Order;
var Account = models.Account;
var City = models.City;
var Manager = models.Manager;
var Exec = models.Exec;
var BlackList = models.BlackList;
var common = require('./common');
var logger = require('./log');
var xl = require('excel4node');


var populateQuery = {
    authorCity: {
        path: 'author',
        select: 'city fullName',
        populate: {
            path: 'city',
            select: 'name'
        },
        options: {
            lean: true
        }
    }
};

function render(res, success) {
    Exec
        .find()
        .sort({ name: 1 })
        .populate('manager')
        .then(execs => {
            res.render('orders/init', {execs: execs, success: success});
        })
}

function changeUsage(main, sub) {
    Exec
        .findOne({_id: main})
        .then(ex => {
            ex.usage = true;
            ex.save();
        });

    if (sub) {
        Exec
            .findOne({_id: sub})
            .then(ex => {
                ex.usage = true;
                ex.save()
            })
    }
}

module.exports = {

    addToBlackList: async (req, res) => {
        var phone = req.body.phone,
            isExist = await BlackList.findOne({ phone: phone });

        if (!isExist) {
            new BlackList({
                phone: phone
            }).save();
        }

        await Order.updateMany({'info.phone': phone}, {$set: {inBlackList: true}});
        res.sendStatus(200);
    },

    getInitPage: function (req, res) {
        Exec
            .find()
            .sort({ name: 1 })
            .then(execs => {
                render(res, false);
            })
    },

    getMyOrders: async (req, res) => {
        var query = req.query;

        var acc = await Account.find({city: res.locals.__user.city});

        acc = acc.map( item => {
            return {
                author: item._id
            };
        });

        var orders = await Order
                        .find({$or: acc, nameExec: [], inBlackList: false})
                        .populate(populateQuery.authorCity)
                        .lean()
                        .sort({ 'info.dateInit': 1 });

        var dlina = orders.length,
            perPage = 1000,
            pages = Math.ceil(dlina/perPage),
            nowPage = query.page || 1;

        res.locals.dlina = dlina;
        res.locals.pages = pages;
        res.locals.nowPage = nowPage;
        if(nowPage > pages) nowPage = pages;
        orders = orders.slice((nowPage-1)*perPage, nowPage*perPage);

        res.render('orders/orders', {orders: orders});
    },

    getOrdersPage: async (req, res) => {
        var query = req.query;

        var orders = await Order.find({ stage: 0, inBlackList: false })
                        .populate(populateQuery.authorCity)
                        .lean()
                        .sort({ 'info.dateInit': 1 });

        var dlina = orders.length,
            perPage = 1000,
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
            });

            if(req.body.type === 0) { //Инсталяция
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

    editOrder: async (req, res) => {
        var robots = {
            'ГУС Симферополь': 'robot_1',
            'ГУС Евпатория': 'robot_2',
            'ГУС Феодосия': 'robot_3',
            'ГУС Севастополь': 'robot_4',
            'ГУС Ялта': 'robot_5'
        };

        var o = await Order.findOne({ id: req.params.id });

        if(!o.author) {
            Account.findOne({login: robots[req.body.author]}).then( acc => {
                o.author = acc;
                return o.save();
            })
        }

        if(res.locals.__user.role !== 3) {
            if(req.body.dateEvent)
                o.info.dateEvent = req.body.dateEvent;
            if(req.body.nameAbon)
                o.info.nameAbon = req.body.nameAbon;
            if(req.body.adress)
                o.info.adress = req.body.adress;
            if(req.body.phone)
                o.info.phone = req.body.phone;
            if(req.body.mainExec)
                o.nameExec = [req.body.mainExec, null || o.nameExec[1]];
            if(req.body.subExec) {
                o.nameExec = [req.body.mainExec || o.nameExec[0], req.body.subExec];
            }
            if(o.type === 0) {
                o.info.numberTT = req.body.numberTT;
                o.info.themeTT = req.body.themeTT;
            }
            if(o.type === 1)
                o.info.personalAcc = req.body.personalAcc;
        }
        
        if(res.locals.__user.role === 3) {
            o.stage = 1;
            o.answers.values = req.body.answers;
            o.answers.collector = res.locals.__user._id;
            if(req.body.comment.trim().length < 1) {
                o.answers.comment = null;
            } else o.answers.comment = req.body.comment.trim();
        }
        logger.log(`Editing order ${o.id}`);
        var done = await o.save();
        res.redirect(req.originalUrl);
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
        var execs = await Exec.find().lean();
        var cities = await City.find().lean();
        var managers = await Manager.find().lean();
        var orders = await Order.find({author: {$ne: null}, inBlackList: false  }).populate('author nameExec').lean();

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
        var filter = { inBlackList: false };

        if (query.id !== '' && !isNaN(query.id)) {
            filter.id = query.id
        }

        if (query.type && query.type !== 'none') {
            if (query.type === 'install') {
                filter.type = 0;
            }
            if (query.type === 'remonts') {
                filter.type = 1;
            }
        }

        if (query.gus && query.gus !== 'none') {
            if(query.gus === 'unknown') {
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

        if (query.exec && query.exec !== 'none') {
            if(query.exec === 'unknown') {
                filter.nameExec = [];
            } else {
                filter.nameExec = query.exec;
            }
        }

        if (query.stage && query.stage !== 'none') {
            filter.stage = query.stage;
        }

        if (query.start) {
            let dateParts = query.start.split(".");
            query.start = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
        }

        if (query.end) {
            let dateParts = query.end.split(".");
            query.end = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
        }

        if(query.end === 'Invalid Date' || query.start === 'Invalid Date') {

        } else {

            if(query.start && query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start), $lte: new Date(query.end) }

            if(query.start && !query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start) }

            if(!query.start && query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start) }

        }

        var orders = await Order.find(filter).populate('nameExec').lean().sort({_id:-1});

        var wb = new xl.Workbook({
          dateFormat: 'dd/mm/yyyy'
        });

        var ws = wb.addWorksheet('Таблица 1');

        var style = wb.createStyle({
            font: {
                color: '#000000',
                size: 11,
                bold: true
            },
            alignment: {
                 wrapText: true,
                 horizontal: 'center'
            }
        });

        var questionStyle = wb.createStyle({
            font: {
                color: '#000000',
                size: 9,
                bold: true
            },
            alignment: {
                 wrapText: true,
                 horizontal: 'center'
            }
        });

        var align = wb.createStyle({
            alignment: {
                 horizontal: 'center'
            }
        });

        var titles = [
            {
                text: 'ID',
                width: 6,
                style: style
            },
            {
                text: 'Монтажник',
                width: 18,
                style: style
            },
            {
                text: 'Ф.И.О. инженера 1',
                width: 18,
                style: style
            },
            {
                text: 'Ф.И.О. инженера 2',
                width: 18,
                style: style
            },
            {
                text: 'Соответствует ли услуга договорным условиям (тарифному плану), и довольны ли Вы ее качеством?',
                width: 15,
                style: questionStyle
            },
            {
                text: 'Продемонстрировал ли наш инженер использование ЛК?',
                width: 15,
                style: questionStyle
            },
            {
                text: 'Оцените, пожалуйста, от 1 до 10 доброжелательность и корректность нашего специалиста',
                width: 15,
                style: questionStyle
            },
            {
                text: 'Оцените, пожалуйста, от 1 до 10 внимательность нашего специалиста к пожеланиям',
                width: 15,
                style: questionStyle
            },
            {
                text: 'Коментарий от клиента',
                width: 25,
                style: style
            },
            {
                text: 'Вид работ',
                width: 13,
                style: style
            },
            {
                text: 'Дата выезда',
                width: 12,
                style: style
            },
            {
                text: 'Адрес абонента',
                width: 50,
                style: style
            },
            {
                text: 'ФИО абонента',
                width: 40,
                style: style
            },
            {
                text: 'Телефон абонента',
                width: 30,
                style: style
            },
            {
                text: 'Лицевой счет',
                width: 15,
                style: style
            },
            {
                text: 'Номер ТТ',
                width: 15,
                style: style
            },
            {
                text: 'Тема ТТ',
                width: 40,
                style: style
            }
        ];

        ws.row(1).setHeight(75);
        ws.row(1).freeze();
        ws.column(1).freeze();

        titles.forEach( (item, i) => {
            ws.cell(1, i+1).string(item.text).style(item.style);
            ws.column(i+1).setWidth(item.width);
        });
        var row = 2;

        orders.forEach( item => {

            ws.cell(row, 1).number(item.id);
            if (item.tip)
                ws.cell(row, 2).string(item.tip);
            else ws.cell(row, 2).string('-');
            
            if(item.nameExec[0]) {
                ws.cell(row, 3).string(item.nameExec[0].name);
            } else ws.cell(row, 3).string('-');

            if(item.nameExec[1]) {
                ws.cell(row, 4).string(item.nameExec[1].name);
            } else ws.cell(row, 4).string('-');

            var tp = (item.type === 0)?'Инсталляция':'Ремонт';

            if(item.answers.values[0])
                if(item.answers.values[0] === -1)
                    ws.cell(row, 5).string('Нет ответа').style(align);
                else
                    ws.cell(row, 5).number(item.answers.values[0]).style(align);
            else ws.cell(row, 5).string('-').style(align);
            if(item.answers.values[1])
                if(item.answers.values[1] === -1)
                    ws.cell(row, 6).string('Нет ответа').style(align);
                else
                    ws.cell(row, 6).number(item.answers.values[1]).style(align);
            else ws.cell(row, 6).string('-').style(align);
            if(item.answers.values[2])
                if(item.answers.values[2] === -1)
                    ws.cell(row, 7).string('Нет ответа').style(align);
                else
                    ws.cell(row, 7).number(item.answers.values[2]).style(align);
            else ws.cell(row, 7).string('-').style(align);
            if(item.answers.values[3])
                if(item.answers.values[3] === -1)
                    ws.cell(row, 8).string('Нет ответа').style(align);
                else
                    ws.cell(row, 8).number(item.answers.values[3]).style(align);
            else ws.cell(row, 8).string('-').style(align);

            ws.cell(row, 9).string(item.answers.comment || '');

            ws.cell(row, 10).string(tp).style(align);
            ws.cell(row, 11).date(item.info.dateEvent).style(align);

            ws.cell(row, 12).string(item.info.adress);
            ws.cell(row, 13).string(item.info.nameAbon);
            ws.cell(row, 14).string(item.info.phone);


            if(item.info.personalAcc) {
                ws.cell(row, 15).string(item.info.personalAcc);
            }

            if(item.info.numberTT) {
                ws.cell(row, 16).string(item.info.numberTT);
            }

            if(item.info.themeTT) {
                ws.cell(row, 17).string(item.info.themeTT);
            }
            row++;
        });

        wb.write('Export-SMOK.xlsx', res);
    },

    search: async (req, res) => {
        var query = req.query;
        res.locals.queries = query;
        res.locals.url = req.url;

        var st = query.start,
            end = query.end;

        var filter = { inBlackList: false };

        if (query.id !== '' && !isNaN(query.id)) {
            filter.id = query.id
        }

        if (query.type && query.type !== 'none') {
            if (query.type === 'install') {
                filter.type = 0;
            }
            if (query.type === 'remonts') {
                filter.type = 1;
            }
        }

        if (query.gus && query.gus !== 'none') {
            if(query.gus === 'unknown') {
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

        if (query.exec && query.exec !== 'none') {
            if(query.exec === 'unknown') {
                filter.nameExec = [];
            } else {
                filter.nameExec = query.exec;
            }
        }

        if (query.stage && query.stage !== 'none') {
            filter.stage = query.stage;
        }

        if (query.start) {
            let dateParts = query.start.split(".");
            query.start = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
        }

        if (query.end) {
            let dateParts = query.end.split(".");
            query.end = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
        }

        if(query.end === 'Invalid Date' || query.start === 'Invalid Date') {
            query.end = end;
            query.start = st;
        } else {

            if(query.start && query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start), $lte: new Date(query.end) };

            if(query.start && !query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start) };

            if(!query.start && query.end)
                filter['info.dateEvent'] = { $gte: new Date(query.start) }

        }

        var orders = await Order.find(filter).populate(populateQuery.authorCity).lean().sort({_id:-1});

        var dlina = orders.length,
            perPage = 100,
            pages = Math.ceil(dlina/perPage),
            nowPage = query.page || 1;

        res.locals.dlina = dlina;
        res.locals.pages = pages;
        res.locals.nowPage = nowPage;
        if(nowPage > pages) nowPage = pages;
        orders = orders.slice((nowPage-1)*perPage, nowPage*perPage);

        var execs = await Exec.find().lean().sort({'name': 1});
        var cities = await City.find().lean();

        res.render('search', {orders: orders, execs: execs, cities: cities});
    },

    getOrder: async (req, res) => {
        var order = await Order.findOne({'id' : req.params.id, inBlackList: false }).deepPopulate('author author.city nameExec answers.collector');

        if (order) {
            var execs = await Exec.find().sort({ name: 1 }).populate('manager');

            var d = common.dateToStr(order.info.dateEvent);

            res.render('orders/order', {order: order, date: d, execs: execs, user: res.locals.__user});

        } else res.render('404');

    },

    delete: function (req, res) {
        Order.findOne({'id' : req.params.id}).populate('author').then( o => {
            if(o.stage === 0 && (res.locals.__user.role === 2 || res.locals.__user.role === 0)) {
                logger.log(`Delete order ${o.id}`);
                return o.remove();
            }
        }).then(() => res.status(200).send('Ok'))

    }
};
