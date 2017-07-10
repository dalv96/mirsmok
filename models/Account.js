'use strict';

var mongoose = require('../controllers/connect');

var Account = mongoose.Schema({
    login: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
    password: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    },
    role: {
        type: Number,
        required: true
    },
    department: {
        type: Number
    },
    city : {
        type : mongoose.Schema.Types.ObjectId, ref: 'City',
	},
    fullName: {
        type: String,
        required: true
    },
    number: {
        type: String
    },
    email: {
        type: String
    }

});

var roles = [
    'Администратор',
    'Руководитель',
    'Сотрудник ГУС',
    'Сборщик отзывов'
].map( (item, i) => {
    return {
        name: item,
        id: i
    };
});

var deps = [
    'ГУС Симферополь',
    'ГУС Евпатория',
    'ГУС Севастополь',
    'ГУС Феодосия',
].map( (item, i) => {
    return {
        name: item,
        id: i
    };
});

Account.statics.roles = roles;
Account.statics.deps = deps;

var account = mongoose.model('Account', Account);

account.find().then(a => {
    if (a.length == 0) {
        var admin = new account({
            login: 'admin',
            password: 'feb14d6bae3d5ecf86cd42f56623895625120b870144ec3442221689fa09608c',
            status: 0,
            role: 0,
            fullName: 'Админ'
        });
        admin.save();
        console.log('Created default admin.');
    }
});

module.exports = account;
