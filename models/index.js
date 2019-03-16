'use strict';

var models = ['Account', 'Order', 'Exec', 'Manager', 'City', 'BlackList'];

models.forEach(model => {
    module.exports[model] = require('./' + model);
});
