'use strict'

const models = require('../models');
const Account = models.Account;
const password = require('./password');

module.exports = {

    isLoggedIn: function (req, res, next) {
        if (req.session.user) {
            Account.findOne({login: req.session.user}).then( acc => {
                res.locals.user = {
                    login: acc.login,
                    fullName: acc.fullName,
                    role: acc.role
                };
                next();
            })
        } else {
            if(req.path != '/login') {
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
                req.session.user = acc.login;
                console.log('Success authorization by :', acc.login);
                var url = req.query.trg || '/';
                res.redirect(url);
            } else {
                console.log('Fail authorization');
                res.status(401).redirect(req.originalUrl);
            }
        })

    }
}
