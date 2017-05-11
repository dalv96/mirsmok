'use strict';

const Order = require('../models').Order;

Order.find({stage: 1}).then( o => {
    for (var i = 0; i < o.length; i++) {
        if(o[i].answers.comment != null) {
            if(o[i].answers.comment.trim().length < 1) {
                console.log('delete comment from', i);
                o[i].answers.comment = null;
                o[i].save();
            }
        }
    }
})
