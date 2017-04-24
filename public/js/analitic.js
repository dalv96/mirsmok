function drawGra(averages) {
    console.log(averages);
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Отдел', '1-й вопрос', '2-й вопрос', '3-й вопрос','4-й вопрос'],
            ['Общий', averages.common.values[0], averages.common.values[1], averages.common.values[2], averages.common.values[3]],
            ['ГУС Симферополь', averages.department['0'].values[0], averages.department['0'].values[1], averages.department['0'].values[2], averages.department['0'].values[3]],
            ['ГУС Евпатория',  averages.department['1'].values[0], averages.department['1'].values[1], averages.department['1'].values[2], averages.department['1'].values[3]],
            ['ГУС Севастополь',  averages.department['2'].values[0], averages.department['2'].values[1], averages.department['2'].values[2], averages.department['2'].values[3]],
            ['ГУС Феодосия', averages.department['3'].values[0], averages.department['3'].values[1], averages.department['3'].values[2], averages.department['3'].values[3]]
        ]);
        var options = {
            title: 'Оценки пользователей',
            hAxis: {title: 'Отдел'},
            vAxis: {
                title: 'Оценка',
                viewWindow: {
                    min: 0,
                    max: 10
                  }
            }
        };
        var chart = new google.visualization.ColumnChart(document.getElementById('oil'));
        chart.draw(data, options);
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Отдел');
        data.addColumn('number', 'Кол-во заявок');
        data.addRows([
            ['ГУС Симферополь', averages.department['0'].i],
            ['ГУС Евпатория', averages.department['1'].i],
            ['ГУС Севастополь', averages.department['2'].i],
            ['ГУС Феодосия', averages.department['3'].i]
        ]);

        // Set chart options
        var options = {
            'title':'Кол-во проработанных заявок',
            'width':700,
            'height':400
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
}

function changePeriod(val) {
    location = '/analitic?period=' + val;
}
