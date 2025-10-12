document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('mockExamChart').getContext('2d');
    var mockExamChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['英語', '数学', '物理', '化学', '歴史'],
            datasets: [{
                label: '自分の点数',
                data: [75, 80, 85, 70, 90],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: '合格者平均',
                data: [85, 88, 92, 80, 95],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
