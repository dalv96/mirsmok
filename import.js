const installs = require('./import/log_installs_01-03-2018');
const remonts = require('./import/log_remonts_01-03-2018');

var Order = require('./models/Order');
var Account = require('./models/Account');

var imprt = async () => {

    var robots = {
        'г. Симферополь': await Account.findOne({login: 'robot_1'}),
        'г. Евпатория': await Account.findOne({login: 'robot_2'}),
        'г. Феодосия': await Account.findOne({login: 'robot_3'}),
        'г. Севастополь': await Account.findOne({login: 'robot_4'}),
        'г. Ялта': await Account.findOne({login: 'robot_5'})
    };

    var id = await Order.getNext();
    console.log(`Found installs #${installs.length}`);

    installs.forEach( async (item) => {
        var auth = robots[item['Ф.И.О. автора']];

        var test = await Order.findOne({
            type: 0,
            'info.nameAbon': item['Ф.И.О. абонента'],
            'info.phone': item['Номер телефона абонента'],
            'info.adress': item['Адрес']
        });

        if(!test) {
            var order = new Order({
                id: id,
                type: 0,
                stage: 0,
                author: auth,
                info: {
                    dateInit: new Date(),
                    dateEvent: item['Дата выезда'],
                    nameAbon: item['Ф.И.О. абонента'],
                    phone: item['Номер телефона абонента'],
                    adress: item['Адрес'],
                    personalAcc: item['Лицевой счет']
                }
            })
            id++;
            console.log(`Import order #${id}`);
            return order.save();
        }
    })
}

imprt();
