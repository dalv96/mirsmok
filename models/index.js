'use strict';

var models = ['Account'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
