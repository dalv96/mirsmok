var { convertToImport } = require('./controllers/common');
var { getRange } = require('./controllers/common');

var yesterday = convertToImport(new Date());
// yesterday = '01-03-2018';

console.log();
console.log();
console.log(`###################### ${yesterday} ######################`);
console.log();

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
var Exec = require('./models/Exec');


var imprt = async () => {
    var ar = {
        'ГУС Симферополь': await Account.findOne({login: 'robot_1'}),
        'ГУС Евпатория': await Account.findOne({login: 'robot_2'}),
        'ГУС Феодосия': await Account.findOne({login: 'robot_3'}),
        'ГУС Севастополь': await Account.findOne({login: 'robot_4'}),
        'ГУС Ялта': await Account.findOne({login: 'robot_5'}),
    }
    var robots = {
        'г. Симферополь': ar['ГУС Симферополь'],
        'пгт. Аграрное': ar['ГУС Симферополь'],
        'пгт. Комсомольское (Симферополь)': ar['ГУС Симферополь'],
        'пгт. Грэсовский': ar['ГУС Симферополь'],
        'с. Мирное': ar['ГУС Симферополь'],
        'с. Маленькое': ar['ГУС Симферополь'],
        'с. Мирное (Симферопольский район)': ar['ГУС Симферополь'],
        'с. Перово (Симферопольский район)': ar['ГУС Симферополь'],
        'с. Перово': ar['ГУС Симферополь'],
        'Вотинцев Михаил Сергеевич': ar['ГУС Симферополь'],
        'Таразевич Юлия Александровна': ar['ГУС Симферополь'],
        'Котолупова Татьяна Игоревна': ar['ГУС Симферополь'],

        'г. Евпатория': ar['ГУС Евпатория'],
        'с.Прибрежное (Сакский район)': ar['ГУС Евпатория'],
        'Армянск': ar['ГУС Евпатория'],
        'г. Армянск': ar['ГУС Евпатория'],
        'г.Армянск': ar['ГУС Евпатория'],
        'Евпатория': ar['ГУС Евпатория'],
        'Стрельникова Яна Юрьевна': ar['ГУС Евпатория'],
        'пгт. Черноморское': ar['ГУС Евпатория'],
        
        'г. Феодосия': ar['ГУС Феодосия'],
        'Советский': ar['ГУС Феодосия'],
        'Глухов Максим Александрович': ar['ГУС Феодосия'],
        'Феодосия': ar['ГУС Феодосия'],
        'Посох Ольга Анатольевна': ar['ГУС Феодосия'],
        'пгт. Приморский': ar['ГУС Феодосия'],

        'г. Севастополь': ar['ГУС Севастополь'],
        'пгт. Форос': ar['ГУС Севастополь'],
        'Лисицына Анастасия Сергеевна': ar['ГУС Севастополь'],

        'г. Ялта': ar['ГУС Ялта'],
        'г. Алупка': ar['ГУС Ялта'],
        'Черникова София Михайловна': ar['ГУС Ялта'],
        'пгт. Ливадия': ar['ГУС Ялта']
    };

    var id = await Order.getNext();
    console.log(`Found installs #${installs.length}`);
    console.log(`Found remonts #${remonts.length}`);
    var checkDub = [];
    var popo = [];

    installs.forEach( it => {
        it.type = 'install';
        if(checkDub.indexOf(`${it['Ф.И.О. абонента']} ${it['Адрес']}`) < 0 ) {
            popo.push(it);
            checkDub.push(`${it['Ф.И.О. абонента']} ${it['Адрес']}`);
        } else console.log('Found dublicate');
    })

    remonts.forEach( it => {
        it.type = 'remonts';
        if(checkDub.indexOf(`${it['Ф.И.О. абонента']} ${it['Адрес']}`) < 0 ) {
            popo.push(it);
            checkDub.push(`${it['Ф.И.О. абонента']} ${it['Адрес']}`);
        } else console.log('Found dublicate');
    })

    for (let i = 0; i < popo.length; i++) {
        var item = popo[i];

        var auth = robots[item['Ф.И.О. автора']];        
        if(!auth) console.log(item['Ф.И.О. автора']);

        var range = getRange(item['Дата выезда']);
        var test = await Order.find({
            'info.nameAbon': item['Ф.И.О. абонента'],
            $and: [
                { 'info.dateEvent': { $gte: range[0] } },
                { 'info.dateEvent': { $lte: range[1] } }
            ]
        });
       
        if(test.length == 0) {
            var order = new Order({
                id: id,
                stage: 0,
                author: auth,
                info: {
                    dateInit: new Date(),
                    dateEvent: item['Дата выезда'],
                    nameAbon: item['Ф.И.О. абонента'],
                    phone: item['Номер телефона абонента'],
                    adress: item['Адрес']
                }
            })
            var exec;

            if(item.type == 'install') {
                exec = await Exec.findOne({name: item['Монтажник']});
                if (exec) {
                    order.nameExec = [exec];
                }
                order.info.personalAcc = item['Лицевой счет'];
                order.tip = item['Монтажник'];
                order.type = 0;
            }

            if(item.type == 'remonts') {
                exec = await Exec.findOne({name: item['Ф.И.О. исполнителя']});
                if (exec) {
                    order.nameExec = [exec];
                }
                order.type = 1;
                order.tip = item['Ф.И.О. исполнителя'];
                order.info.numberTT = item['Номер ТТ'];
                order.info.themeTT = item['Тема ТТ'];
            }

            id++;
            
            var done = await order.save();
        }
    }
}

imprt().then(() => {
    process.exit(0);
});
