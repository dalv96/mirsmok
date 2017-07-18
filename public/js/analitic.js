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
    window.manager = {};
    window.managers.forEach( item => {
        window.manager[item._id] = item.name;
    })
    window.exec = {};
    window.execs.forEach( item => {
        window.exec[item._id] = item.name;
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


    window.selected = {};

    initAnalitic(window.orders.all);

    drawMainGraph();
    drawPieGraph();
    drawManagerGraph();
    drawExecGraph();
}


function parseOrders(orders) {
    var list = {
        all: [],
        completed: [],
        uncompleted: [],
        city: {},
        exec: {},
        manager: {}
    };

    for (var i = 0; i < orders.length; i++) {
        list.all.push(orders[i]);

        (orders[i].stage == 0)?list.uncompleted.push(orders[i]):list.completed.push(orders[i]);

        if(list.city[orders[i].city] == null) list.city[orders[i].city] = [];
        list.city[orders[i].city].push(orders[i]);

        if(orders[i].exec[0] && orders[i].stage == 1) {
            if(list.exec[orders[i].exec[0]._id] == null) list.exec[orders[i].exec[0]._id] = [];

            if(!list.exec[orders[i].exec[0]._id].includes(orders[i]))
                list.exec[orders[i].exec[0]._id].push(orders[i]);
        }

        if(orders[i].exec[1] && orders[i].stage == 1) {
            if(list.exec[orders[i].exec[1]._id] == null) list.exec[orders[i].exec[1]._id] = [];

            if(!list.exec[orders[i].exec[1]._id].includes(orders[i]))
                list.exec[orders[i].exec[1]._id].push(orders[i]);
        }

        if(orders[i].manager[0] && orders[i].stage == 1) {
            if(list.manager[orders[i].manager[0]] == null) list.manager[orders[i].manager[0]] = [];
            if(!list.manager[orders[i].manager[0]].includes(orders[i]))
                list.manager[orders[i].manager[0]].push(orders[i]);
        }

        if(orders[i].manager[1] && orders[i].stage == 1) {
            if(list.manager[orders[i].manager[1]] == null) list.manager[orders[i].manager[1]] = [];
            if(!list.manager[orders[i].manager[1]].includes(orders[i]))
            list.manager[orders[i].manager[1]].push(orders[i]);
        }

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
            window.avrgs.exec = {};
            for (var i in window.orders.tmp.exec) {
                window.avrgs.exec[i] = calculateAverages(window.orders.tmp.exec[i])
            }
            window.avrgs.manager = {};
            for (var i in window.orders.tmp.manager) {
                window.avrgs.manager[i] = calculateAverages(window.orders.tmp.manager[i])
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
            window.avrgs.exec = {};
            for (var i in window.orders.tmp.exec) {
                window.avrgs.exec[i] = calculateAverages(window.orders.tmp.exec[i])
            }
            window.avrgs.manager = {};
            for (var i in window.orders.tmp.manager) {
                window.avrgs.manager[i] = calculateAverages(window.orders.tmp.manager[i])
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
            window.avrgs.exec = {};
            for (var i in window.orders.tmp.exec) {
                window.avrgs.exec[i] = calculateAverages(window.orders.tmp.exec[i])
            }
            window.avrgs.manager = {};
            for (var i in window.orders.tmp.manager) {
                window.avrgs.manager[i] = calculateAverages(window.orders.tmp.manager[i])
            }
            break;
    }
    window.orders.tmp.completed = [];
    window.orders.tmp.uncompleted = [];
    if(window.orders.tmp.city[window.selected.department])
        for (var i = 0; i < window.orders.tmp.city[window.selected.department].length; i++) {
            if( window.orders.tmp.city[window.selected.department][i].stage == 1)
                window.orders.tmp.completed.push(window.orders.tmp.city[window.selected.department][i]);
            else window.orders.tmp.uncompleted.push(window.orders.tmp.city[window.selected.department][i]);
        }
    else
        for (var i = 0; i < window.orders.tmp.all.length; i++) {
            if( window.orders.tmp.all[i].stage == 1)
                window.orders.tmp.completed.push(window.orders.tmp.all[i]);
            else window.orders.tmp.uncompleted.push(window.orders.tmp.all[i]);
        }
    drawMainGraph();
    drawPieGraph();
    drawManagerGraph();
    changeManager(window.selected.manager);
}

function changeManager(idx) {
    if(idx) {
        var os = window.orders.tmp.exec;
        var ts = [];
        window.selected.manager = idx;
        window.execs.forEach( item => {
            if(item.manager == idx) {
                ts[item._id] = os[item._id];
            }
        });
        window.avrgs.exec = {};
        for (var i in ts) {
            if(ts[i] != null)
                window.avrgs.exec[i] = calculateAverages(ts[i])
        }
    } else {
            var os = window.orders.tmp.exec;
            var ts = [];
            window.selected.manager = null;
            window.execs.forEach( item => {
                ts[item._id] = os[item._id];
            });
            window.avrgs.exec = {};
            for (var i in ts) {
                if(ts[i] != null)
                    window.avrgs.exec[i] = calculateAverages(ts[i])
            }
    }
    drawExecGraph();
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
    window.selected.department = dep;
    window.orders.tmp.completed = [];
    window.orders.tmp.uncompleted = [];
    if(window.orders.tmp.city[dep])
        for (var i = 0; i < window.orders.tmp.city[dep].length; i++) {
            if( window.orders.tmp.city[dep][i].stage == 1)
                window.orders.tmp.completed.push(window.orders.tmp.city[dep][i]);
            else window.orders.tmp.uncompleted.push(window.orders.tmp.city[dep][i]);
        }
    else
        for (var i = 0; i < window.orders.tmp.all.length; i++) {
            if( window.orders.tmp.all[i].stage == 1)
                window.orders.tmp.completed.push(window.orders.tmp.all[i]);
            else window.orders.tmp.uncompleted.push(window.orders.tmp.all[i]);
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
    window.avrgs.exec = {};
    for (var i in window.orders.tmp.exec) {
        window.avrgs.exec[i] = calculateAverages(window.orders.tmp.exec[i])
    }
    window.avrgs.manager = {};
    for (var i in window.orders.tmp.manager) {
        window.avrgs.manager[i] = calculateAverages(window.orders.tmp.manager[i])
    }
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
    $(".mainChart").append('<canvas id="mainChart" width=1050 height=400>');
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

function drawManagerGraph() {
    var avgrs = {
        '0': [],
        '1': [],
        '2': [],
        '3': []
    };
    window.chart.bar.man_labels = [ ];
    for( var j in window.avrgs.manager)
        window.chart.bar.man_labels.push(window.manager[j]);

    for (var d in avgrs) {
        for (var i in window.avrgs.manager) {
            avgrs[d].push(window.avrgs.manager[i][d].value)
        }
    }

    window.chart.bar.man_datasets = [
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

    $('#managerChart').remove();
    $(".managerChart").append('<canvas id="managerChart" width=1050 height=400>');
    var ctx = document.getElementById("managerChart");

    var mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.chart.bar.man_labels,
            datasets: window.chart.bar.man_datasets
        },
        options: window.chart.bar.option
    });
}

function drawExecGraph() {
    var avgrs = {
        '0': [],
        '1': [],
        '2': [],
        '3': []
    };
    window.chart.bar.ex_labels = [ ];
    for( var j in window.avrgs.exec)
        window.chart.bar.ex_labels.push(window.exec[j]);

    for (var d in avgrs) {
        for (var i in window.avrgs.exec) {
            avgrs[d].push(window.avrgs.exec[i][d].value)
        }
    }

    window.chart.bar.ex_datasets = [
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

    $('#execChart').remove();
    $(".execChart").append('<canvas id="execChart" width=1050 height=400>');
    var ctx = document.getElementById("execChart");

    var mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.chart.bar.ex_labels,
            datasets: window.chart.bar.ex_datasets
        },
        options: window.chart.bar.option
    });
}
