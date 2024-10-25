const apiKey = 'bcab9fca5b20c1f4fb362495ab1573ad'; 

const cityNameElement = document.getElementById('city-name');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weather-description');

const tempChartCanvas = document.getElementById('temp-chart').getContext('2d');
const weatherChartCanvas = document.getElementById('weather-chart').getContext('2d');
const tempLineChartCanvas = document.getElementById('temp-line-chart').getContext('2d');

const userInput = document.getElementById('user-input');
const askBtn = document.getElementById('ask-btn'); 
const chatbotResponse = document.getElementById('chatbot-response');

let tempChart, weatherChart, tempLineChart, tempDoughnutChart;

async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        displayWeather(data);
        fetchForecast(city);  
    } catch (error) {
        console.error("Error fetching weather:", error);
        chatbotResponse.innerText = "Unable to fetch weather data.";
    }
}

function displayWeather(data) {
    cityNameElement.innerText = data.name;
    temperatureElement.innerText = data.main.temp;
    weatherDescriptionElement.innerText = data.weather[0].description;

    const weatherCondition = data.weather[0].main.toLowerCase();
    const weatherWidget = document.querySelector('.weather-widget');

    weatherWidget.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-smoke', 'weather-default');

    switch (weatherCondition) {
        case 'clear':
            weatherWidget.classList.add('weather-clear');
            break;
        case 'clouds':
            weatherWidget.classList.add('weather-clouds');
            break;
        case 'rain':
            weatherWidget.classList.add('weather-rain');
            break;
        case 'smoke':
            weatherWidget.classList.add('weather-smoke');
            break;
        default:
            weatherWidget.classList.add('weather-default');
            break;
    }
}


async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        const dailyForecast = filterDailyForecast(data.list);  
        renderForecastCharts(dailyForecast);
        displayForecast(dailyForecast);  
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

function filterDailyForecast(forecastList) {
    return forecastList.filter(item => item.dt_txt.includes("12:00:00"));  
}

function renderForecastCharts(data) {
    const labels = data.map(item => item.dt_txt.split(' ')[0]); 
    const temps = data.map(item => item.main.temp);

    if (tempChart) tempChart.destroy();
    if (weatherChart) weatherChart.destroy();
    if (tempLineChart) tempLineChart.destroy();
    if (tempDoughnutChart) tempDoughnutChart.destroy();

    tempChart = new Chart(tempChartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: '#3498db',
                borderColor: '#3498db',
                borderWidth: 1
            }]
        }
    });

    weatherChart = new Chart(weatherChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false
            }]
        }
    });

    tempDoughnutChart = new Chart(document.getElementById('temp-doughnut-chart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: [
                    '#3498db',
                    '#9b59b6',
                    '#e74c3c',
                    '#f1c40f',
                    '#2ecc71'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `Temp: ${tooltipItem.raw}°C`;
                        }
                    }
                }
            }
        }
    });

    tempLineChart = new Chart(tempLineChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Forecast Temp (°C)',
                data: temps,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        }
    });
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';  

    data.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; 
        const temp = item.main.temp;
        const description = item.weather[0].description;
        const weatherCondition = item.weather[0].main.toLowerCase();

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        switch (weatherCondition) {
            case 'clear':
                forecastItem.classList.add('forecast-clear');
                break;
            case 'clouds':
                forecastItem.classList.add('forecast-clouds');
                break;
            case 'rain':
                forecastItem.classList.add('forecast-rain');
                break;
            case 'smoke':
                forecastItem.classList.add('forecast-smoke');
                break;
            default:
                forecastItem.classList.add('forecast-default');
                break;
        }

        forecastItem.innerHTML = `
            <span class="forecast-date">${date}</span>
            <span class="forecast-temp">${temp}°C</span>
            <span class="forecast-description">${description}</span>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

askBtn.addEventListener('click', () => {
    const query = userInput.value.toLowerCase();
    fetchWeather(query);  
});
