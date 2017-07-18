const common = require('./common');
module.exports = {
    log: function (text, type = 'INFO') {
        var moment = new Date;
        console.log(`[${type}] ${common.dateToExtStr(moment)} - ${text}`);
    }
}
