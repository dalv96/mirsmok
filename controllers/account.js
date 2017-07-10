'use strict'

var models = require('../models');
var Account = models.Account;
var City = models.City;

var password = require('./password');

module.exports = {

    getPageCreate: function (req, res) {
        City.find().then( cities => {
            res.render('admin/createUser', {
                cities: cities
            });
        })
    },

    getAll: function (req, res) {
        Account.find({status: { $gt: -1 }}).populate('city').sort('fullName').then(a => {
            res.render('admin/users', {users: a});
        }).catch(error => {
            console.error(error);
        });
    },

    getProfile: function (req, res) {
        Account.findOne({ login: req.session.__user, status: { $gt: -1 }}).populate('city').then(a => {
            if(a)
                res.render('profile', {user: a});
            else
                res.render('404');
        })
    },

    editProfile: function (req, res) {
        Account.findOne({ login: req.session.__user, status: { $gt: -1 }}).populate('city').then(a => {
            if(a) {
                a.fullName = req.body.fullName;
                a.email = req.body.email;
                a.number = req.body.number;
                console.log('Editing profile', a.login);
                return a.save();
            }
        }).then( () => res.redirect('/profile') );
    },

    editProfilePass: function (req, res) {
        Account.findOne({ login: req.session.__user, status: { $gt: -1 }}).then(a => {
            if(password.createHash(req.body.passOld) == a.password ) {
                if( req.body.pass == req.body.passRep ) {
                    a.password = password.createHash(req.body.pass);
                    console.log('Editing profile pass', a.login);
                    return a.save();
                }
            }
        }).then( () => res.redirect('/profile') );
    },

    getOne: function (req, res) {
        Account.findOne({ login: req.params.login, status: { $gt: -1 }}).populate('city').then(a => {
            City.find().then( cities => {
                if(a)
                    res.render('admin/editUser', {
                        user: a,
                        cities: cities
                    });
                else
                    res.render('404');
            })
        })
    },

    add: function (req, res) {
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
                if(req.body.role == 2) {
                    acc.city = req.body.city;
                    // acc.department = req.body.dep;
                }
                console.log('Create user', acc.login);
                return acc.save();
            } else {
                return 'true';
            }
        }).then( r => {
            if(r != 'true') res.redirect('/admin/users')
            else res.send('Логин занят');
        })
    },

    edit: function (req, res) {
        Account.findOne({login: req.params.login, status: { $gt: -1 }}).then(a => {
            a.fullName = req.body.fullName;
            a.role = req.body.role;
            a.email = req.body.email;
            a.number = req.body.number;
            if(a.role == 2) {
                a.city = req.body.city;
            } else {
                if(a.city) a.city = undefined;
            }
            // a.department = req.body.department;
            console.log('Editing user', a.login);
            return a.save();
        }).then( () => res.redirect('/admin/users') )
    },

    editPass: function (req, res) {
        Account.findOne({ login: req.params.login, status: { $gt: -1 }}).then(a => {
            console.log(a);
            if( req.body.pass == req.body.passRep ) {
                a.password = password.createHash(req.body.pass);
                console.log('Editing pass', a.login);
                return a.save();
            }
        }).then( () => res.redirect('/admin/users') );
    },

    delete: function (req, res) {
        if(req.params.login != 'admin')
            Account.findOne({login: req.params.login, status: { $gt: -1 } }).then( a => {
                if(a) {
                    console.log('Delete user', a.login);
                    a.login = Date.now() + a.login;
                    a.status = -1;
                    a.password = '!deleted!'
                    return a.save();
                } else console.log('Несущевствующий пользователь!');
            }).then(() => res.redirect('/admin/users/'));
    },

    block: function (req, res) {
        if(req.params.login != 'admin')
            Account.findOne({login: req.params.login, status: { $gt: -1 } }).then( a => {
                if(a) {
                    switch (a.status) {
                        case 0:
                            a.status = 1;
                            console.log('Unblock user', a.login);
                            break;
                        case 1:
                            a.status = 0;
                            console.log('Block user', a.login);
                            break;
                    }
                    return a.save();
                } else console.log('Несущевствующий пользователь!');
            }).then(() => res.redirect('/admin/users/' + req.params.login));
    }

};
