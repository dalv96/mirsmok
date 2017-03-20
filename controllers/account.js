'use strict'

var models = require('../models');
var Account = models.Account;
var password = require('./password');

module.exports = {

    getPageCreate: function (req, res) {
        res.render('admin/createUser');
    },

    getAll: function (req, res) {
        Account.find({status: { $gt: -1 }}).then(a => {
            res.render('admin/users', {users: a});
        }).catch(error => {
            console.error(error);
        });
    },

    getOne: function (req, res) {
        if (!req.errorFlag) {
            Account.findOne({ login: req.params.login, status: { $gt: -1 }}).then(a => {
                if(a)
                    res.render('admin/editUser', {user: a});
                else
                    res.render('404');
            })
        } else {
            res.render('404');
        }
    },

    add: function (req, res) {
        if(!req.errorFlag) {
            Account.findOne({login: req.body.login}).then(a => {
                if(!a) {
                    var acc = new Account({
                        login:  req.body.login,
                        password: password.createHash(req.body.password),
                        number: req.body.phone,
                        email: req.body.email,
                        role: req.body.role,
                        fullName: req.body.fullName
                    });
                    return acc.save();
                } else {
                    return 'true';
                }
            }).then( r => {
                if(r != 'true') res.redirect('/admin/users')
                else res.send('Логин занят');
            })
        } else {
            res.render('404');
        }
    },

    edit: function (req, res) {
        if(!req.errorFlag) {
            Account.findOne({login: req.params.login, status: { $gt: -1 }}).then(a => {
                a.fullName = req.body.fullName;
                a.role = req.body.role;
                a.email = req.body.email;
                a.number = req.body.number
                return a.save();
            }).then( () => res.redirect('/admin/users') )
        } else {
            res.render('404');
        }
    },

    editPass: function (req, res) {
        console.log(req.body.data);
    },

    delete: function (req, res) {
        if(!req.errorFlag && (req.params.login != 'admin'))
            Account.findOne({login: req.params.login, status: { $gt: -1 } }).then( a => {
                if(a) {
                    a.login = Date.now() + a.login;
                    a.status = -1;
                    a.password = '!deleted!'
                    return a.save();
                } else console.log('Несущевствующий пользователь!');
            }).then(() => res.redirect('/admin/users/'));
    },

    block: function (req, res) {
        if(!req.errorFlag && (req.params.login != 'admin'))
            Account.findOne({login: req.params.login, status: { $gt: -1 } }).then( a => {
                if(a) {
                    switch (a.status) {
                        case 0:
                            a.status = 1;
                            break;
                        case 1:
                            a.status = 0;
                            break;
                    }
                    return a.save();
                } else console.log('Несущевствующий пользователь!');
            }).then(() => res.redirect('/admin/users/' + req.params.login));
    }

};
