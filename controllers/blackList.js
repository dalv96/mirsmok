'use strict';

var models = require('../models');
var BlackList = models.BlackList;
var Order = models.Order;

module.exports = {
    getAll : function (req, res) {
        BlackList
            .find()
            .sort('phone')
            .then( blackList => {
                res.render('blackList', {blackList: blackList});
            });
    },

    deletePhone: async (req, res) => {
        await BlackList.remove({phone: req.body.phone});

        await Order.updateMany({'info.phone': req.body.phone}, {$set: { inBlackList: false }});
        res.sendStatus(200);
    }
};
