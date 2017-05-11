'use strict';

const Exec = require('../models').Exec;
const Order = require('../models').Order;


Order.find().then( o => {
    for (var i = 0; i < o.length; i++) {
        if(o[i].nameExec[0] != null)
            Exec.findOne({_id: o[i].nameExec[0]}).then( e => {
                if(e.usage == false) {
                    e.usage = true;
                    e.save();
                }
            })
        if(o[i].nameExec[1] != null)
            Exec.findOne({_id: o[i].nameExec[1]}).then( e => {
                if(e.usage != true) {
                    e.usage = true;
                    e.save();
                }
            })
    }

})
