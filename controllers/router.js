'use strict';

const auth = require('./authorization');
const account = require('./account');
const models = require('../models');
module.exports = function(app) {

    app.locals.roles = models.Account.roles;

    app.post('/login', auth.checkAuthorisation);

    app.all('*', auth.isLoggedIn);

    app.get('/logout', auth.logout);

    app.get('/', function (req, res) {
        res.render('main');
    });

    app.get('/profile', account.getProfile);
    app.post('/profile', account.editProfile);
    app.post('/profile/pass', account.editProfilePass);

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

    // ****************** РУКОВОДИТЕЛЬ *************************

    app.all('/manager/*', auth.isManager);

    // ****************** ИНИЦИАТОР ****************************

    app.all('/init/*', auth.isInit);

    // ****************** СБОРЩИК ОТЗЫВОВ **********************

    app.all('/collector/*', auth.isCollector);


    app.all('*', function (req, res) {
        res.render('404')
    });

};
