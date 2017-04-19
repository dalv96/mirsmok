'use strict';

var models = ['Account', 'Order', 'Exec'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
