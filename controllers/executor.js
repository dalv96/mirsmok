'use strict'

var models = require('../models');
var Exec = models.Exec;

module.exports = {
    getAll : function (req, res) {
        res.render('admin/exec');
    }
};
