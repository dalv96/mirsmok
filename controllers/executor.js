'use strict'

var models = require('../models');
var Exec = models.Exec;

module.exports = {
    getAll : function (req, res) {
        Exec.find().then( es => {
            res.render('admin/exec', {execs: es});
        });
    },
    add: function (req, res) {
        Exec.findOne({name: req.body.name}).then( e => {
            if(!e) {
                var exec = new Exec({
                    name: req.body.name,
                    usage: false
                });
                return exec.save();
            }
        }).then(() => res.redirect('/admin/exec'));
    },
    edit: function (req, res) {
        Exec.findOne({name: req.body.name}).then( e => {
            if(e) {
                return Exec.findOne({name: req.body.newName}).then(exec => {
                    if(!exec) {
                        e.name = req.body.newName;
                        return e.save();
                    }
                });
            }
        }).then(() => res.status(200).send('Ok'));
    },
    delete: function (req, res) {
        Exec.findOne({name: req.body.name}).then( e => {
            if(e) {
                if(e.usage == false) return e.remove();
            }
        }).then(() => res.status(200).send('Ok'))
    }
};
