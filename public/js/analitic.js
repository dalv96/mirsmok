'use strict';

window.onload = function () {
    var test = document.createElement("input");
    test.setAttribute("type", "date");
    if(test.type != 'date') {
        $('#downDate').datepicker();
        $('#upDate').datepicker()
    }

    window.completed = 0;
    window.uncompleted = 0;

    window.chart = {};
    window.chart.bar = {};
    window.chart.bar.option = {
            scales: {
                yAxes: [{
                    ticks: {
                        max: 10,
                        min: 0
                    }
                }]
            },
            responsive: false
    };

    window.city = {};
    window.cities.forEach( item => {
        window.city[item._id] = item.name;
    })
    window.orders.install = [];
    window.orders.repair = [];

    for (var i=0; i < window.orders.all.length; i++) {
        if (window.orders.all[i].type == 0) {
            window.orders.install.push(window.orders.all[i]);
        } else window.orders.repair.push(window.orders.all[i]);
    }

    window.chart.pie = {};
    window.chart.pie.labels = [
        'Проработанные заявки',
        'Не проработанные заявки'
    ];
    window.chart.pie.option = {
        responsive: false
    };

    initAnalitic(window.orders.all);

    drawMainGraph();
    drawPieGraph();
    // drawManGraph();
}


function parseOrders(orders) {
    var list = {
        all: [],
        completed: [],
        uncompleted: [],
        install: [],
        repair: [],
        city: {},
        exec: {},
        manager: {}
    };

    for (var i = 0; i < orders.length; i++) {
        list.all.push(orders[i]);
        if( window.orders.install == null) {


        }

        (orders[i].stage == 0)?list.uncompleted.push(orders[i]):list.completed.push(orders[i]);

        if(list.city[orders[i].city] == null) list.city[orders[i].city] = [];
        list.city[orders[i].city].push(orders[i]);

        if(orders[i].exec[0]) {
            if(list.exec[orders[i].exec[0]] == null) list.exec[orders[i].exec[0]] = [];
            list.exec[orders[i].exec[0]].push(orders[i]);
        }

        if(orders[i].exec[1]) {
            if(list.exec[orders[i].exec[1]] == null) list.exec[orders[i].exec[1]] = [];
            list.exec[orders[i].exec[1]].push(orders[i]);
        }

        if(list.manager[orders[i].manager] == null) list.manager[orders[i].manager] = [];
        list.manager[orders[i].manager].push(orders[i]);

    }

    return list;
}

function calculateAverages(list) {
    var averages = {};
    if(list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < 4; j++) {
                if(!averages.hasOwnProperty(j)) {
                    averages[j] = {
                        value: 0,
                        i: 0
                    }
                }
                if(list[i].answers[j] >= 0) {
                    averages[j].value += list[i].answers[j];
                    averages[j].i++;
                }
            }
        }
        if(list.length > 0)
            for (var i = 0; i < 4; i++) {
                if(averages[i].i != 0) {
                    averages[i].value = averages[i].value / averages[i].i;
                    averages[i].value = Math.round((averages[i].value)*100)/100;
                }
            }
    } else averages = {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        i: 0
    }
    return averages;
}

function dateParse(orders, downTime = new Date(2016, 0, 1), upTime = new Date(2030, 0, 1)) {
    var ret = [];
    if(orders) {
        for (var i = 0; i < orders.length; i++) {
            orders[i].date = new Date(orders[i].date);
            if(orders[i].date > downTime && orders[i].date < upTime) {
                ret.push(orders[i]);
            }
        }
    }
    return ret;
}

function getAnalitic(orders, type, downTime, upTime) {
    switch (type) {
        case '0':
            window.orders.tmp = dateParse(window.orders.install, downTime, upTime);
            window.orders.tmp = parseOrders(window.orders.tmp);
            window.avrgs = {};
            window.avrgs.common = calculateAverages(window.orders.tmp.all);
            window.avrgs
            window.avrgs.city =  {};
            for (var i in window.orders.tmp.city) {
                window.avrgs.city[i] = calculateAverages(window.orders.tmp.city[i])
            }
            break;
        case '1':
            window.orders.tmp = dateParse(window.orders.repair, downTime, upTime);
            window.orders.tmp = parseOrders(window.orders.tmp);
            window.avrgs = {};
            window.avrgs.common = calculateAverages(window.orders.tmp.all);
            window.avrgs.city =  {};
            for (var i in window.orders.tmp.city) {
                window.avrgs.city[i] = calculateAverages(window.orders.tmp.city[i])
            }
            break;
        default:
            window.orders.tmp = dateParse(window.orders.all, downTime, upTime);
            window.orders.tmp = parseOrders(window.orders.tmp);
            window.avrgs = {};
            window.avrgs.common = calculateAverages(window.orders.tmp.all);
            window.avrgs.city =  {};
            for (var i in window.orders.tmp.city) {
                window.avrgs.city[i] = calculateAverages(window.orders.tmp.city[i])
            }
            break;
    }
    drawMainGraph();
    drawPieGraph();
}

function changeExec(idx) {
    if (window.orders.tmp.execs[idx]) {
        var avr = calculateAverages(window.orders.tmp.execs[idx]);
        $('#q1').text(avr[0].value);
        $('#q2').text(avr[1].value);
        $('#q3').text(avr[2].value);
        $('#q4').text(avr[3].value);
    } else {
        $('#q1').text('-');
        $('#q2').text('-');
        $('#q3').text('-');
        $('#q4').text('-');
    }
}

function changeMainType(type) {
    window.type = type;
    getAnalitic(orders, type, window.downDateInit, window.upDateInit);
}

function changeMainDownDate(date) {
    window.downDateInit = new Date(date);
    getAnalitic(orders, window.type, new Date(date), window.upDateInit);
}

function changeMainUpDate(date) {
    window.upDateInit = new Date(date);
    getAnalitic(orders, window.type, window.downDateInit, new Date(date));
}

function changePieDep(dep) {
    window.orders.tmp.completed = [];
    window.orders.tmp.uncompleted = [];
    if(window.orders.tmp.city[dep])
        for (var i = 0; i < window.orders.tmp.city[dep].length; i++) {
            if( window.orders.tmp.city[dep][i].stage == 1)
                window.orders.tmp.completed.push(window.orders.tmp.city[dep][i]);
            else window.orders.tmp.uncompleted.push(window.orders.tmp.city[dep][i]);
        }

    drawPieGraph();
}

function initAnalitic(orders, downTime, upTime) {
    window.orders.tmp = dateParse(orders, downTime, upTime);
    window.orders.tmp = parseOrders(window.orders.tmp);
    window.avrgs = {};
    window.avrgs.common = calculateAverages(window.orders.tmp.all);
    window.avrgs.city =  {};
    for (var i in window.orders.tmp.city) {
        window.avrgs.city[i] = calculateAverages(window.orders.tmp.city[i])
    }
    window.avrgs.execs = {};
}


function drawPieGraph() {
    window.chart.pie.datasets = [
        {
            data: [window.orders.tmp.completed.length, window.orders.tmp.uncompleted.length],
            backgroundColor: [
                "#36A2EB",
                "#FF6384"
            ],
            hoverBackgroundColor: [
                "#36A2EB",
                "#FF6384"
            ]
        }
    ];

    $('#pieChart').remove();
    $(".pieChart").append('<canvas id="pieChart" width=350 height=350>');
    var ctx = document.getElementById("pieChart");
    var sameChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: window.chart.pie.labels,
            datasets: window.chart.pie.datasets
        },
        options: window.chart.pie.option
    });
}

function drawMainGraph() {
    var avgrs = {
        '0' : [window.avrgs.common[0].value],
        '1' : [window.avrgs.common[1].value],
        '2' : [window.avrgs.common[2].value],
        '3' : [window.avrgs.common[3].value]
    };
    window.chart.bar.labels = [
        'Средний по компании'
    ];
    for( var j in window.avrgs.city)
        window.chart.bar.labels.push(window.city[j]);
    for (var d in avgrs) {
        for (var i in window.avrgs.city) {
            avgrs[d].push(window.avrgs.city[i][d].value)
        }
    }

    window.chart.bar.datasets = [
        {
            label: 'Качество услуги',
            data: avgrs[0],
            backgroundColor: 'rgba(255, 51, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Демонстрация ЛК',
            data: avgrs[1],
            backgroundColor: 'rgba(255, 153, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Доброжелательность мастера',
            data: avgrs[2],
            backgroundColor: 'rgba(102, 153, 102, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Внимательность к пожеланиям',
            backgroundColor: 'rgba(26, 122, 190, 0.7)',
            data: avgrs[3],
            borderWidth: 1
        }
    ];

    $('#mainChart').remove();
    $(".mainChart").append('<canvas id="mainChart" width=900 height=400>');
    var ctx = document.getElementById("mainChart");

    var mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.chart.bar.labels,
            datasets: window.chart.bar.datasets
        },
        options: window.chart.bar.option
    });
}

function drawManGraph() {
    var avgrs = {
        '0' : [window.avrgs.common[0].value],
        '1' : [window.avrgs.common[1].value],
        '2' : [window.avrgs.common[2].value],
        '3' : [window.avrgs.common[3].value]
    };
    window.chart.bar.labels = [
        'Средний по компании'
    ];
    for( var j in window.avrgs.city)
        window.chart.bar.labels.push(window.city[j]);
    for (var d in avgrs) {
        for (var i in window.avrgs.city) {
            avgrs[d].push(window.avrgs.city[i][d].value)
        }
    }

    window.chart.bar.datasets = [
        {
            label: 'Качество услуги',
            data: avgrs[0],
            backgroundColor: 'rgba(255, 51, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Демонстрация ЛК',
            data: avgrs[1],
            backgroundColor: 'rgba(255, 153, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Доброжелательность мастера',
            data: avgrs[2],
            backgroundColor: 'rgba(102, 153, 102, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Внимательность к пожеланиям',
            backgroundColor: 'rgba(26, 122, 190, 0.7)',
            data: avgrs[3],
            borderWidth: 1
        }
    ];

    $('#manChart').remove();
    $(".manChart").append('<canvas id="manChart" width=900 height=400>');
    var ctx = document.getElementById("manChart");

    var mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.chart.bar.man_labels,
            datasets: window.chart.bar.man_datasets
        },
        options: window.chart.bar.option
    });
}
