module.exports = {
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
    dateToExtStr: function (value) {
        var hour = value.getHours();
        var min = value.getMinutes();
        var sec = value.getSeconds();

        return `${this.dateToStr(value)} ${hour}:${min}:${sec}`;
    }
};
