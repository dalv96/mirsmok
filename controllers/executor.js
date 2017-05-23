'use strict'

var models = require('../models');
var Exec = models.Exec;
var Manager = models.Manager;


module.exports = {
    getAll : function (req, res) {
        Exec.find().sort('name').populate('manager').then( es => {
            Manager.find().then( mns => {
                res.render('admin/exec', {execs: es, managers: mns});
            });
        });
    },
    add: function (req, res) {
        Exec.findOne({name: req.body.name}).then( e => {
            return Exec.getNext().then(ids => {
                if(!e) {
                    return Manager.findOne({id: req.body.manager}).then(m => {
                        if(m) {
                            var exec = new Exec({
                                id: ids,
                                name: req.body.name,
                                manager: m,
                                usage: false
                            });
                            m.usage = true;
                            m.save();
                            return exec.save();
                        }
                    })
                }
            });
        }).then(() => res.redirect('/admin/exec'));
    },
    edit: function (req, res) {
        Exec.findOne({id: req.body.id}).then( e => {
            if(e) {
                return Exec.findOne({name: req.body.newName}).then(exec => {
                    if(!exec || exec.id==e.id) {
                        Manager.findOne({id: req.body.newMan}).then(m => {
                            if(m) {
                                e.name = req.body.newName;
                                e.manager = m;
                                m.usage = true;
                                m.save();
                                return e.save();
                            }
                        })
                    }
                });
            }
        }).then(() => res.status(200).send('Ok'));
    },
    delete: function (req, res) {
        Exec.findOne({id: req.body.id}).then( e => {
            if(e) {
                if(e.usage == false) return e.remove();
            }
        }).then(() => res.status(200).send('Ok'))
    }
};
