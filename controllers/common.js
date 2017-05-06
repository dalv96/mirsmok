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
        return year + '-' + month + '-' + day;
    },

    calculateAverages: function (value) {
        var averages = {
            common: {
                values: [0,0,0,0],
                i: 0
            },
            department: {
                '0': {
                    values: [0,0,0,0],
                    i: 0
                },
                '1': {
                    values: [0,0,0,0],
                    i: 0
                },
                '2': {
                    values: [0,0,0,0],
                    i: 0
                },
                '3': {
                    values: [0,0,0,0],
                    i: 0
                }
            }
        };
        value.forEach(item => {
            for (var i = 0; i < 4; i++) {
                averages.common.values[i] += item.answers.values[i];
                averages.department[item.author.department].values[i] = (averages.department[item.author.department].values[i] || 0) + item.answers.values[i];
            }
            averages.common.i++;
            averages.department[item.author.department].i++;
        });

        Object.keys(averages.department).forEach(item => {
            if(averages.department[item].i != 0)
                for (var i = 0; i < 4; i++) {
                    averages.department[item].values[i] = averages.department[item].values[i]/averages.department[item].i;
                }
        });

        for (var i = 0; i < 4; i++) {
            averages.common.values[i] = averages.common.values[i]/averages.common.i;
        }

        return averages;
    }
};
