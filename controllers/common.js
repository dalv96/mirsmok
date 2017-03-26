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
        return day + '.' + month + '.' + year;
    },

    calculateAverages: function (value) {
        var averages = {
            common: {
                first: 0,
                sec: 0,
                third: 0,
                i: 0
            },
            department: {
                '0': {
                    first: 0,
                    sec: 0,
                    third: 0,
                    i: 0
                },
                '1': {
                    first: 0,
                    sec: 0,
                    third: 0,
                    i: 0
                },
                '2': {
                    first: 0,
                    sec: 0,
                    third: 0,
                    i: 0
                },
                '3': {
                    first: 0,
                    sec: 0,
                    third: 0,
                    i: 0
                }
            }
        };
        value.forEach(item => {
            averages.common.first += item.answers.firstQ;
            averages.common.sec += item.answers.secQ;
            if(item.answers.thirdQ)
                averages.common.third += 1;
            averages.common.i++;

            averages.department[item.initiator].first = (averages.department[item.initiator].first || 0) + item.answers.firstQ ;
            averages.department[item.initiator].sec = (averages.department[item.initiator].sec || 0) + item.answers.secQ;
            if(item.answers.thirdQ)
                averages.department[item.initiator].third = (averages.department[item.initiator].third || 0) +  1;
            averages.department[item.initiator].i = (averages.department[item.initiator].i || 0) + 1;

        });

        Object.keys(averages.department).forEach(item => {
            if(averages.department[item].i != 0)
                Object.keys(averages.department[item]).forEach(some => {
                    if(some != 'i') {
                        averages.department[item][some] = averages.department[item][some]/averages.department[item].i;
                        averages.department[item][some] = Math.round(averages.department[item][some] * 100) / 100;
                    }
                })
        });

        Object.keys(averages.common).forEach(item => {
            if(item != 'i') {
                averages.common[item] = averages.common[item]/averages.common.i;
                averages.common[item] = Math.round(averages.common[item] * 100) / 100;

            }

        });
        return averages;
    }
};
