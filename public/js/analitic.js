function drawGra(averages) {
    console.log(averages);
    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Отдел', '1-й вопрос', '2-й вопрос', '3-й вопрос'],
            ['Общий', averages.common.first, averages.common.sec, averages.common.third],
            ['ГУС Симферополь', averages.department['0'].first, averages.department['0'].sec, averages.department['0'].third],
            ['ГУС Евпатория',  averages.department['1'].first, averages.department['1'].sec, averages.department['1'].third],
            ['ГУС Севастополь',  averages.department['2'].first, averages.department['2'].sec, averages.department['2'].third],
            ['ГУС Феодосия', averages.department['3'].first, averages.department['3'].sec, averages.department['3'].third]
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
