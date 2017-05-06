'use strict';

var models = ['Account', 'Order', 'Exec', 'Manager'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
