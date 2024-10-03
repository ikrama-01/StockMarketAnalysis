// API Key and base URL for Alpha Vantage
const API_KEY = '56WWCHQF1Z28CYK2';
const API_URL = 'https://www.alphavantage.co/query';

// Load Google Charts and initialize after page load
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawCharts);

// Draw all charts once loaded
function drawCharts() {
    fetchStockData().then(stockData => {
        drawCandlestickChart(stockData);
        drawAreaChart(stockData);
        drawScatterPlot(stockData);
        drawLineChart(stockData)
    });
}

// Fetch stock data from Alpha Vantage API
async function fetchStockData() {
    const response = await fetch(`${API_URL}?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=${API_KEY}`);
    const data = await response.json();
    return transformStockData(data['Time Series (Daily)']);
}

// Transform stock data to required format
function transformStockData(timeSeries) {
    const stockData = [];
    for (const [date, values] of Object.entries(timeSeries)) {
        stockData.push({
            date: new Date(date),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseFloat(values['5. volume'])
        });
    }
    return stockData;
}

// Draw Line Chart using Google Charts
function drawLineChart(stockData) {
    const data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Close');

    stockData.slice(0, 30).forEach(row => {
        data.addRow([row.date, row.close]);
    });

    const options = {
        title: 'Stock Closing Prices Over Time',
        hAxis: {
            title: 'Date',
            format: 'MMM dd'
        },
        vAxis: {
            title: 'Price (USD)'
        },
        legend: 'none',
    };

    const chart = new google.visualization.LineChart(document.getElementById('line_chart'));
    chart.draw(data, options);
}


// Draw Candlestick Chart using Google Charts
function drawCandlestickChart(stockData) {
    const data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Low');
    data.addColumn('number', 'Open');
    data.addColumn('number', 'Close');
    data.addColumn('number', 'High');

    stockData.slice(0, 30).forEach(row => {
        data.addRow([row.date, row.low, row.open, row.close, row.high]);
    });

    const options = {
        title: 'Stock Price Candlestick Chart',
        legend: 'none',
        candlestick: {
            fallingColor: { fill: '#a52714' },
            risingColor: { fill: '#0f9d58' }
        },
        hAxis: {
            title: 'Date',  // X-axis label
            format: 'MMM dd'
        },
        vAxis: {
            title: 'Price (USD)' // Y-axis label
        }
    };

    const chart = new google.visualization.CandlestickChart(document.getElementById('candlestick_chart'));
    chart.draw(data, options);
}

// Draw Area Chart using D3.js
function drawAreaChart(stockData) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#area_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(stockData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stockData, d => d.close)])
        .range([height, 0]);

    const area = d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.close));

    svg.append("path")
        .datum(stockData)
        .attr("fill", "steelblue")
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Date");

    // Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .text("Stock Price (USD)");
}

// Draw Scatter Plot using D3.js
function drawScatterPlot(stockData) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#scatter_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(stockData, d => d.volume)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stockData, d => d.close)])
        .range([height, 0]);

    svg.selectAll("circle")
        .data(stockData)
        .enter().append("circle")
        .attr("cx", d => x(d.volume))
        .attr("cy", d => y(d.close))
        .attr("r", 5)
        .attr("fill", "orange");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // X-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("Volume");

    // Y-axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .text("Stock Price (USD)");
}
