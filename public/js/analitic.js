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
    initAnalitic(window.orders.all);

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
    window.chart.bar.labels = [
        'Средний по компании',
        'ГУС Симферополь',
        'ГУС Евпатория',
        'ГУС Севастополь',
        'ГУС Феодосия'
    ];

    window.chart.pie = {};
    window.chart.pie.labels = [
        'Проработанные заявки',
        'Не проработанные заявки'
    ];
    window.chart.pie.option = {
        responsive: false
    };

    drawMainGraph();
    drawPieGraph();
}


function parseOrders(orders) {
    var list = {
        all: [],
        install : [],
        repair : [],
        department : {
            '0' : [],
            '1' : [],
            '2' : [],
            '3' : []
        },
        execs: {},
        pre: 0,
        end: 0
    };
    // // TODO: Если список пустой
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].stage == 1) {

            window.completed++;
            list.all.push(orders[i]);
            if(orders[i].type == 0) {
                if(!window.orders.install) window.orders.install = [];
                window.orders.install.push(orders[i]);
            }
            else {
                if(!window.orders.repair) window.orders.repair = [];
                window.orders.repair.push(orders[i]);
            }
            list.department[orders[i].department].push(orders[i]);
            if(list.execs[orders[i].exec[0]] == null) list.execs[orders[i].exec[0]] = [];
            list.execs[orders[i].exec[0]].push(orders[i]);
            if(list.execs[orders[i].exec[1]] == null) list.execs[orders[i].exec[1]] = [];
            if(orders[i].exec[1] != null) list.execs[orders[i].exec[1]].push(orders[i]);
        } else window.uncompleted++;
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
            window.avrgs.department =  {};
            for (var i = 0; i < 4; i++) {
                window.avrgs.department[i] = calculateAverages(window.orders.tmp.department[i]);
            }
            break;
        case '1':
            window.orders.tmp = dateParse(window.orders.repair, downTime, upTime);
            window.orders.tmp = parseOrders(window.orders.tmp);
            window.avrgs = {};
            window.avrgs.common = calculateAverages(window.orders.tmp.all);
            window.avrgs.department =  {};
            for (var i = 0; i < 4; i++) {
                window.avrgs.department[i] = calculateAverages(window.orders.tmp.department[i]);
            }
            break;
        default:
            window.orders.tmp = dateParse(window.orders.all, downTime, upTime);
            window.orders.tmp = parseOrders(window.orders.tmp);
            window.avrgs = {};
            window.avrgs.common = calculateAverages(window.orders.tmp.all);
            window.avrgs.department =  {};
            for (var i = 0; i < 4; i++) {
                window.avrgs.department[i] = calculateAverages(window.orders.tmp.department[i]);
            }
            break;
    }
    drawMainGraph();
}

function changeMainType(type) {
    console.log();
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
    window.completed = 0;
    window.uncompleted = 0;
    if(dep >= 0) {
        for (var i = 0; i < window.orders.all.length; i++) {
            if(window.orders.all[i].department == dep) {
                if(window.orders.all[i].stage == 0) window.uncompleted++;
                else window.completed++;
            }
        }
    } else for (var i = 0; i < window.orders.all.length; i++) {
        if(window.orders.all[i].stage == 0) window.uncompleted++;
        else window.completed++;
    }

    drawPieGraph();
}

function initAnalitic(orders, downTime, upTime) {
    window.orders.tmp = dateParse(orders, downTime, upTime);
    window.orders.tmp = parseOrders(window.orders.tmp);
    window.avrgs = {};
    window.avrgs.common = calculateAverages(window.orders.tmp.all);
    window.avrgs.department =  {};
    for (var i = 0; i < 4; i++) {
        window.avrgs.department[i] = calculateAverages(window.orders.tmp.department[i]);
    }
}


function drawPieGraph() {
    window.chart.pie.datasets = [
        {
            data: [window.completed, window.uncompleted],
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
    window.chart.bar.datasets = [
        {
            label: 'Качество услуги',
            data: [window.avrgs.common[0].value, window.avrgs.department[0][0].value, window.avrgs.department[1][0].value, window.avrgs.department[2][0].value, window.avrgs.department[3][0].value],
            backgroundColor: 'rgba(255, 51, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Демонстрация ЛК',
            data: [window.avrgs.common[1].value, window.avrgs.department[0][1].value, window.avrgs.department[1][1].value, window.avrgs.department[2][1].value, window.avrgs.department[3][1].value],
            backgroundColor: 'rgba(255, 153, 51, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Доброжелательность мастера',
            data: [window.avrgs.common[2].value, window.avrgs.department[0][2].value, window.avrgs.department[1][2].value, window.avrgs.department[2][2].value, window.avrgs.department[3][2].value],
            backgroundColor: 'rgba(102, 153, 102, 0.7)',
            borderWidth: 1
        },
        {
            label: 'Внимательность к пожеланиям',
            backgroundColor: 'rgba(26, 122, 190, 0.7)',
            data: [window.avrgs.common[3].value, window.avrgs.department[0][3].value, window.avrgs.department[1][3].value, window.avrgs.department[2][3].value, window.avrgs.department[3][3].value],
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
