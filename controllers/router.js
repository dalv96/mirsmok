'use strict'
const auth = require('./authorization');
module.exports = function(app) {


    app.post('/login', auth.checkAuthorisation);

    app.all('*', auth.isLoggedIn);

    app.get('/logout', auth.logout);

    app.get('/', function (req, res) {
        res.render('main');
    });

};
