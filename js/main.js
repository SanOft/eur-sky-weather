// Global variables
let cities = [];
let currentWeatherData = null;
let currentUnit = 'C'; // Default to Celsius

// City data from CSV
const cityData = `latitude,longitude,city,country
52.367,4.904,Amsterdam,Netherlands
39.933,32.859,Ankara,Turkey
56.134,12.945,Astorp,Sweden
37.983,23.727,Athens,Greece
54.597,-5.930,Belfast,Northern Ireland
41.387,2.168,Barcelona,Spain
52.520,13.405,Berlin,Germany
46.948,7.447,Bern,Switzerland
43.263,-2.935,Bilbao,Spain
50.847,4.357,Brussels,Belgium
47.497,19.040,Bucharest,Romania
59.329,18.068,Budapest,Hungary
51.483,-3.168,Cardiff,Wales
50.937,6.96,Cologne,Germany
55.676,12.568,Copenhagen,Denmark
51.898,-8.475,Cork,Ireland
53.349,-6.260,Dublin,Ireland
55.953,-3.188,Edinburgh,Scotland
43.7696,11.255,Florence,Italy
50.110,8.682,Frankfurt,Germany
43.254,6.637,French Riviera,France
32.650,-16.908,Funchal,Portugual
36.140,-5.353,Gibraltar
57.708,11.974,Gothenburg,Sweden
53.548,9.987,Hamburg,Germany
60.169,24.938,Helsinki,Finland
39.020,1.482,Ibiza,Spain
50.450,30.523,Kyiv,Ukraine
61.115,10.466,Lillehammer,Norway
38.722,-9.139,Lisbon,Portugual
51.507,-0.127,London,England
40.416,-3.703,Madrid,Spain
39.695,3.017,Mallorca,Spain
53.480,-2.242,Manchester,England
43.296,5.369,Marseille,France
27.760,-15.586,Maspalomas,Spain
45.464,9.190,Milan,Italy
48.135,11.582,Munich,Germany
40.851,14.268,Naples,Italy
43.034,-2.417,Onati,Spain
59.913,10.752,Oslo,Norway
48.856,2.352,Paris,France
50.075,14.437,Prague,Czech Republic
64.146,-21.942,Reykjavik,Iceland
56.879,24.603,Riga,Latvia
41.902,12.496,Rome,Italy
39.453,-31.127,Santa Cruz das Flores,Portugual
28.463,-16.251,Santa Cruz de Tenerife,Spain
57.273,-6.215,Skye,Scotland
42.697,23.321,Sofia,Bulgaria
59.329,18.068,Stockholm,Sweden
59.437,24.753,Tallinn,Estonia
18.208,16.373,Vienna,Austria
52.229,21.012,Warsaw,Poland
53.961,-1.07,York,England
47.376,8.541,Zurich,Switzerland`;

// Parse CSV data
function parseCSV() {
    const lines = cityData.trim().split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        cities.push({
            latitude: parseFloat(values[0]),
            longitude: parseFloat(values[1]),
            city: values[2],
            country: values[3]
        });
    }
}

// Populate city dropdown
function populateCityDropdown() {
    const selector = document.getElementById('citySelector');

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = JSON.stringify(city);
        option.textContent = `${city.city}, ${city.country}`;
        selector.appendChild(option);
    });
}

// Get weather icon based on weather code
function getWeatherIcon(weatherCode) {
    // Convert to lowercase and remove 'night' or 'day' suffix
    const code = weatherCode.toLowerCase().replace(/(night|day)$/, '');

    const iconMap = {
        'clear': 'clear.png',
        'pcloudy': 'pcloudy.png',
        'mcloudy': 'mcloudy.png',
        'cloudy': 'cloudy.png',
        'humid': 'humid.png',
        'lightrain': 'lightrain.png',
        'oshower': 'oshower.png',
        'ishower': 'ishower.png',
        'lightsnow': 'lightsnow.png',
        'rain': 'rain.png',
        'snow': 'snow.png',
        'rainsnow': 'rainsnow.png',
        'ts': 'tstorm.png',
        'tsrain': 'tsrain.png',
        'fog': 'fog.png',
        'windy': 'windy.png'
    };

    return `images/${iconMap[code] || 'cloudy.png'}`;
}

// Get weather condition text
function getWeatherCondition(weatherCode) {
    // Convert to lowercase and remove 'night' or 'day' suffix for mapping
    const code = weatherCode.toLowerCase().replace(/(night|day)$/, '');

    const conditionMap = {
        'clear': 'CLEAR',
        'pcloudy': 'PARTLY CLOUDY',
        'mcloudy': 'MOSTLY CLOUDY',
        'cloudy': 'CLOUDY',
        'humid': 'HUMID',
        'lightrain': 'LIGHT RAIN',
        'oshower': 'SHOWER',
        'ishower': 'SHOWER',
        'lightsnow': 'LIGHT SNOW',
        'rain': 'RAIN',
        'snow': 'SNOW',
        'rainsnow': 'RAIN/SNOW',
        'ts': 'THUNDERSTORM',
        'tsrain': 'THUNDERSTORM',
        'fog': 'FOG',
        'windy': 'WINDY'
    };

    return conditionMap[code] || weatherCode.toUpperCase();
}

// Convert temperature from Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Format temperature based on current unit
function formatTemperature(celsius) {
    if (currentUnit === 'F') {
        return `${celsiusToFahrenheit(celsius)} °F`;
    }
    return `${celsius} °C`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
}

// Fetch weather data from 7Timer API
async function fetchWeatherData(latitude, longitude) {
    try {
        // Hide existing data and show loading spinner
        hideWeatherData();
        showLoading(true);
        hideError();
        showTemperatureToggle(false);

        // 7Timer API endpoint
        const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentWeatherData = data;

        // Hide loading and show data
        showLoading(false);
        displayWeatherForecast(data);
        showTemperatureToggle(true);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showLoading(false);
        showError('Failed to fetch weather data. Please try again later.');
    }
}

// Display weather forecast cards
function displayWeatherForecast(data) {
    const container = document.getElementById('weatherContainer');
    container.innerHTML = '';

    if (!data || !data.dataseries) {
        showError('No weather data available');
        return;
    }

    // Show 7 days of forecast
    const forecast = data.dataseries.slice(0, 7);
    const baseDate = new Date();

    forecast.forEach((day, index) => {
        const forecastDate = new Date(baseDate);
        forecastDate.setDate(baseDate.getDate() + index);

        const card = createWeatherCard(day, forecastDate);
        container.appendChild(card);
    });
}

// Create weather card element
function createWeatherCard(dayData, date) {
    const card = document.createElement('div');
    card.className = 'weather-card';

    const weatherIconPath = getWeatherIcon(dayData.weather);
    const weatherCondition = getWeatherCondition(dayData.weather);
    const highTemp = dayData.temp2m?.max || dayData.temp2m || 'N/A';
    const lowTemp = dayData.temp2m?.min || dayData.temp2m || 'N/A';

    card.innerHTML = `
        <div class="card-date">${formatDate(date)}</div>
        <div class="card-content">
            <img src="${weatherIconPath}" alt="${weatherCondition}" class="weather-icon">
            <div class="weather-condition">${weatherCondition}</div>
            <div class="temperature">
                <span class="temp-high">High: ${formatTemperature(highTemp)}</span>
                <span class="temp-low">Low: ${formatTemperature(lowTemp)}</span>
            </div>
        </div>
    `;

    return card;
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Show/hide error message
function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    const error = document.getElementById('error');
    error.classList.add('hidden');
}

// Show/hide temperature toggle
function showTemperatureToggle(show) {
    const toggle = document.getElementById('tempToggle');
    if (show) {
        toggle.classList.remove('hidden');
    } else {
        toggle.classList.add('hidden');
    }
}

// Hide weather data
function hideWeatherData() {
    const container = document.getElementById('weatherContainer');
    container.innerHTML = '';
}

// Toggle temperature unit
function toggleTemperatureUnit(event) {
    event.preventDefault();

    if (currentUnit === 'C') {
        currentUnit = 'F';
        document.getElementById('currentUnit').textContent = 'Using Fahrenheit.';
        document.getElementById('toggleLink').textContent = 'Switch to °C';
    } else {
        currentUnit = 'C';
        document.getElementById('currentUnit').textContent = 'Using Celsius.';
        document.getElementById('toggleLink').textContent = 'Switch to °F';
    }

    // Refresh display with new unit
    if (currentWeatherData) {
        displayWeatherForecast(currentWeatherData);
    }
}

// Handle city selection
function handleCitySelection(event) {
    const selectedValue = event.target.value;

    if (!selectedValue) {
        document.getElementById('weatherContainer').innerHTML = '';
        showTemperatureToggle(false);
        return;
    }

    const cityInfo = JSON.parse(selectedValue);
    fetchWeatherData(cityInfo.latitude, cityInfo.longitude);
}

// Initialize application
function init() {
    parseCSV();
    populateCityDropdown();

    // Event listeners
    document.getElementById('citySelector').addEventListener('change', handleCitySelection);
    document.getElementById('toggleLink').addEventListener('click', toggleTemperatureUnit);
}

// Start application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
