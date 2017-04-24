'use strict'

const models = require('../models');
const Account = models.Account;
const password = require('./password');

module.exports = {

    isLoggedIn: function (req, res, next) {
        if (req.session.__user) {
            Account.findOne({login: req.session.__user}).then( acc => {
                res.locals.__user = {
                    _id: acc._id,
                    login: acc.login,
                    fullName: acc.fullName,
                    role: acc.role
                };
                if(acc.role == 2) {
                    res.locals.__user.dep = acc.department;
                }
                next();
            })
        } else {
            if(req.path != '/login') {
                console.log('Not auth user to:', req.path );
                var rstr = '/login' + ( (req.originalUrl.length>1) ? '?trg='+encodeURIComponent(req.originalUrl) : '' );
				res.redirect(rstr);
            } else res.render('login');
        }
    },

    logout: function(req, res) {
        req.session.destroy();
        res.redirect('/');
    },

    checkAuthorisation: function (req, res) {
        Account.findOne({
            login: req.body.login,
            password: password.createHash(req.body.password),
            status: 0
        }).then( acc => {
            if (acc) {
                req.session.__user = acc.login;
                console.log('Success authorization by :', acc.login);
                var url = req.query.trg || '/';
                res.redirect(url);
            } else {
                console.log('Fail authorization');
                res.status(401).redirect(req.originalUrl);
            }
        })

    },

    isAdmin: function (req, res, next) {
        if(res.locals.__user.role == 0) next();
        else res.render('403');
    },

    isManager: function (req, res, next) {
        if(res.locals.__user.role == 1) next();
        else res.render('403');
    },

    isInit: function (req, res, next) {
        if(res.locals.__user.role == 2) next();
        else res.render('403');
    },

    isCollector: function (req, res, next) {
        if(res.locals.__user.role == 3) next();
        else res.render('403');
    }

}
