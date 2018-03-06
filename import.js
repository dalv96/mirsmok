var { convertToImport } = require('./controllers/common');
var yesterday = convertToImport(new Date());

var installs = [],
    remonts = [];

try {
    installs = require(`./import/log_installs_${yesterday}`);
} catch(err) {
    console.log('Cant find installs file');
}
try {
    remonts = require(`./import/log_remonts_${yesterday}`);
} catch(err) {
    console.log('Cant find remonts file');
}

var Order = require('./models/Order');
var Account = require('./models/Account');

var imprt = async () => {

    var robots = {
        'г. Симферополь': await Account.findOne({login: 'robot_1'}),
        'г. Евпатория': await Account.findOne({login: 'robot_2'}),
        'г. Феодосия': await Account.findOne({login: 'robot_3'}),
        'Феодосия': await Account.findOne({login: 'robot_3'}),
        'г. Севастополь': await Account.findOne({login: 'robot_4'}),
        'г. Ялта': await Account.findOne({login: 'robot_5'})
    };

    var id = await Order.getNext();
    console.log(`Found installs #${installs.length}`);
    console.log(`Found remonts #${remonts.length}`);

    var popo = [];
    installs.forEach( it => {
        it.type = 'install';
        popo.push(it);
    })
    remonts.forEach( it => {
        it.type = 'remonts';
        popo.push(it);
    })


    popo.forEach( async (item) => {
        var auth = robots[item['Ф.И.О. автора']];
        var test = await Order.findOne({
            type: (item.type == 'installs')?0:1,
            'info.nameAbon': item['Ф.И.О. абонента'],
            'info.phone': item['Номер телефона абонента'],
            'info.adress': item['Адрес']
        });

        if(!test) {
            if(item.type == 'install')
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
            if(item.type == 'remonts')
                var order = new Order({
                    id: id,
                    type: 1,
                    stage: 0,
                    author: auth,
                    info: {
                        dateInit: new Date(),
                        dateEvent: item['Дата выезда'],
                        nameAbon: item['Ф.И.О. абонента'],
                        phone: item['Номер телефона абонента'],
                        adress: item['Адрес'],
                        numberTT: item['Номер ТТ'],
                        themeTT: item['Тема ТТ']
                    }
                })
            id++;
            console.log(`Import order #${id}`);
            return order.save();
        }
    })
}

imprt();
