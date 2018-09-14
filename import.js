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

var imprt = async () => {

    var robots = {
        'г. Симферополь': await Account.findOne({login: 'robot_1'}),
        'пгт. Аграрное': await Account.findOne({login: 'robot_1'}),
        'пгт. Комсомольское (Симферополь)': await Account.findOne({login: 'robot_1'}),
        'пгт. Грэсовский': await Account.findOne({login: 'robot_1'}),
        'с. Мирное': await Account.findOne({login: 'robot_1'}),
        'с. Маленькое': await Account.findOne({login: 'robot_1'}),
        'с. Мирное (Симферопольский район)': await Account.findOne({login: 'robot_1'}),
        'с. Перово (Симферопольский район)': await Account.findOne({login: 'robot_1'}),
        'с. Перово': await Account.findOne({login: 'robot_1'}),
        'г. Евпатория': await Account.findOne({login: 'robot_2'}),
        'с.Прибрежное (Сакский район)': await Account.findOne({login: 'robot_2'}),
        'Армянск': await Account.findOne({login: 'robot_2'}),
        'г. Армянск': await Account.findOne({login: 'robot_2'}),
        'г.Армянск': await Account.findOne({login: 'robot_2'}),
        'Евпатория': await Account.findOne({login: 'robot_2'}),
        'пгт. Черноморское': await Account.findOne({login: 'robot_2'}),
        'г. Феодосия': await Account.findOne({login: 'robot_3'}),
        'Советский': await Account.findOne({login: 'robot_3'}),
        'Глухов Максим Александрович': await Account.findOne({login: 'robot_3'}),
        'Феодосия': await Account.findOne({login: 'robot_3'}),
        'г. Севастополь': await Account.findOne({login: 'robot_4'}),
        'пгт. Форос': await Account.findOne({login: 'robot_4'}),
        'г. Ялта': await Account.findOne({login: 'robot_5'}),
        'г. Алупка': await Account.findOne({login: 'robot_5'}),
        'Вотинцев Михаил Сергеевич': await Account.findOne({login: 'robot_1'}),
        'Стрельникова Яна Юрьевна': await Account.findOne({login: 'robot_2'}),
        'Таразевич Юлия Александровна': await Account.findOne({login: 'robot_1'}),
        'Котолупова Татьяна Игоревна': await Account.findOne({login: 'robot_1'}),
        'Посох Ольга Анатольевна': await Account.findOne({login: 'robot_3'}),
        'Лисицына Анастасия Сергеевна': await Account.findOne({login: 'robot_4'}),
        'Черникова София Михайловна': await Account.findOne({login: 'robot_5'})
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

    popo.forEach( async (item) => {
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
            if(item.type == 'install')
                var order = new Order({
                    id: id,
                    type: 0,
                    stage: 0,
                    author: auth,
                    tip: item['Монтажник'],
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
                    tip: item['Монтажник'],
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
            // console.log(`Import order ${item.type} #${id}`);
            return order.save();
        }
    })
}

imprt();
