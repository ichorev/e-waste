<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Environmental Survey Results</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #f0f2f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9em;
        }

        th, td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: #34495e;
            color: white;
            white-space: nowrap;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        tr:hover {
            background-color: #f5f5f5;
        }

        .nav-buttons {
            margin-bottom: 20px;
            text-align: center;
        }

        .nav-buttons a {
            display: inline-block;
            padding: 10px 20px;
            background-color: #2ecc71;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 0 10px;
        }

        .nav-buttons a:hover {
            background-color: #27ae60;
        }

        .no-data {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
        }

        .table-responsive {
            overflow-x: auto;
            margin-top: 20px;
        }

        @media screen and (max-width: 768px) {
            th, td {
                font-size: 0.8em;
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav-buttons">
            <a href="/">Back to Survey</a>
            <a href="#" onclick="refreshData()">Refresh Data</a>
        </div>
        
        <h1>Environmental Survey Results</h1>
        <div id="results"></div>
    </div>

    <script>
        async function fetchData() {
            try {
                const response = await fetch('/api/surveys');
                const data = await response.json();
                displayData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('results').innerHTML = '<p class="no-data">Error loading data. Please try again.</p>';
            }
        }

        function displayData(data) {
            if (!data || data.length === 0) {
                document.getElementById('results').innerHTML = '<p class="no-data">No survey responses yet.</p>';
                return;
            }

            const table = `
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Refuse Single-use<br>(per week)</th>
                                <th>Second Life Items<br>(per year)</th>
                                <th>Recycle Frequency<br>(per month)</th>
                                <th>Composting<br>Habit</th>
                                <th>Durable Products<br>Choice</th>
                                <th>Comments</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(entry => `
                                <tr>
                                    <td>${entry.name}</td>
                                    <td>${entry.refuseFrequency}</td>
                                    <td>${entry.repairFrequency}</td>
                                    <td>${entry.recycleFrequency}</td>
                                    <td>${entry.compostHabit}</td>
                                    <td>${entry.durableChoice}</td>
                                    <td>${entry.comments || '-'}</td>
                                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('results').innerHTML = table;
        }

        function refreshData() {
            fetchData();
        }

        // Load data when page loads
        fetchData();
    </script>
</body>
</html>
