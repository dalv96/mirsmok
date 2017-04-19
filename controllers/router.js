'use strict';

const auth = require('./authorization');
const account = require('./account');
const models = require('../models');
const order = require('./order');
const executor = require('./executor');


module.exports = function(app) {

    app.locals.roles = models.Account.roles;
    app.locals.deps = models.Account.deps;

    app.post('/login', auth.checkAuthorisation);

    app.all('*', auth.isLoggedIn);

    app.get('/logout', auth.logout);

    app.get('/', function (req, res) {
        switch (res.locals.__user.role) {
            case 0:
                res.redirect('/admin/users');
                break;
            case 1:
                res.redirect('/analitic');
                break;
            case 2:
                res.redirect('/init');
                break;
            case 3:
                res.redirect('/collector/orders')
                break;
        }
    });

    app.get('/profile', account.getProfile);
    app.post('/profile', account.editProfile);
    app.post('/profile/pass', account.editProfilePass);
    app.get('/orders', order.search);
    app.get('/orders/:id', order.getContent);
    app.post('/orders/:id', order.editOrder);

    app.get('/analitic', order.getAnaliticPage);
    // ****************** АДМИНИСТРАТОР ************************
    app.all('/admin/*', auth.isAdmin);

    app.get('/admin/addUser', account.getPageCreate);
    app.post('/admin/addUser', account.add);
    app.get('/admin/users', account.getAll);

    app.post('/admin/users/:login', account.edit);
    app.post('/admin/users/:login/pass', account.editPass);
    app.put('/admin/users/:login/block', account.block);
    app.delete('/admin/users/:login', account.delete);
    app.get('/admin/users/:login', account.getOne);

    app.get('/admin/exec', executor.getAll);
    // ****************** РУКОВОДИТЕЛЬ *************************

    app.all('/manager/*', auth.isManager);

    // ****************** ИНИЦИАТОР ****************************

    app.all('/init*', auth.isInit);
    app.get('/init', order.getInitPage);
    app.post('/init', order.init);

    // ****************** СБОРЩИК ОТЗЫВОВ **********************

    app.all('/collector/*', auth.isCollector);
    app.get('/collector/orders', order.getOrdersPage)
    app.get('/collector/orders/:id', order.collect);
    app.post('/collector/orders/:id', order.saveOrder);

    app.all('*', function (req, res) {
        res.render('404')
    });

};
