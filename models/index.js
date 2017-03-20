'use strict';

var models = ['Account', 'Order'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
