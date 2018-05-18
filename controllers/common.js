module.exports = {
    getRange: function (value) {
        var date = value.split(' ');
        date = date[0].split('-');

        return [
            new Date(date[0], date[1]-1, date[2]-1, 0, 0, 0, 0),
            new Date(date[0], date[1]-1, date[2]+1, 0, 0, 0, 0)
        ]

    },


    dateToStr: function (value) {
        var year = value.getFullYear();
        var month = value.getMonth() + 1;
        if(month < 10) {
            month = '0' + month;
        }
        var day = value.getDate();
        if(day < 10) {
            day = '0' + day;
        }
        return  year + '-' + month + '-' + day;
    },
    dateToExtStr: function (value = new Date()) {
        var hour = value.getHours();
        if(hour < 10) {
            hour = '0' + hour;
        }
        var min = value.getMinutes();
        if(min < 10) {
            min = '0' + min;
        }
        var sec = value.getSeconds();
        if(sec < 10) {
            sec = '0' + sec;
        }

        return `${this.dateToStr(value)} ${hour}:${min}:${sec}`;
    },
    convertToImport: function (value) {
        value.setDate(value.getDate() - 1);
        var year = value.getFullYear();
        var month = value.getMonth() + 1;
        if(month < 10) {
            month = '0' + month;
        }
        var day = value.getDate();
        if(day < 10) {
            day = '0' + day;
        }
        return day + '-' + month + '-' + year;
    },
};
