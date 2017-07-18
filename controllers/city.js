'use strict'

var models = require('../models');
var City = models.City;
var logger = require('./log');

module.exports = {
    getAll : function (req, res) {
        City.find().sort('name').then( cities => {
            res.render('admin/city', {cities: cities});
        });
    },
    add: function (req, res) {
        City.findOne({name: req.body.name}).then( m => {
            City.getNext().then(ids => {
                if(!m) {
                    var city = new City({
                        id: ids,
                        name: req.body.name
                    });
                    logger.log(`Add city ${req.body.name}`);
                    return city.save();
                }
            })
        }).then(() => res.redirect('/admin/cities'));
    },
    edit: function (req, res) {
        City.findOne({id: req.body.id}).then( c => {
            if(c) {
                return City.findOne({name: req.body.newName}).then(city => {
                    if(!city || c.id == city.id) {
                        logger.log(`Edit city ${req.body.name} - ${req.body.newName}`);
                        c.name = req.body.newName;
                        return c.save();
                    }
                });
            }
        }).then(() => res.status(200).send('Ok'));
    }
    // delete: function (req, res) {
    //     City.findOne({id: req.body.id}).then( c => {
    //         if(c) {
    //             return c.remove();
    //         }
    //     }).then(() => res.status(200).send('Ok'))
    // }
};
