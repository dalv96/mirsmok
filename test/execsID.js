'use strict';

const Exec = require('../models').Exec;

Exec.find().then( execs => {
    for (var i = 0; i < execs.length; i++) {
        execs[i].id = i;
        execs[i].save();
    }
})
