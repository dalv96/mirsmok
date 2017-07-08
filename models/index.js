'use strict';

var models = ['Account', 'Order', 'Exec', 'Manager', 'City'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
