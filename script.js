"use strict";
let isCelsius = true; // Global toggle state

const cities = [
  "Athens",
  "Thessaloniki",
  "London",
  "New York",
  "Paris",
  "Tokyo",
  "Sydney",
  "Berlin",
  "Madrid",
  "Rome",
];

//  Toggle Dark Mode
document
  .getElementById("darkModeToggle")
  .addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
  });

//  Dark Mode Between Reloads
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
});

//  Autocomplete
const datalist = document.getElementById("citiesList");
cities.forEach((city) => {
  const option = document.createElement("option");
  option.value = city;
  datalist.appendChild(option);
});

// Geolocation Weather on Page Load
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch(`https://wttr.in/${lat},${lon}?format=j1`)
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data, `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
      displayForecast(data);
    })
    .catch((error) => {
      console.error("Error fetching geolocation weather:", error);
    });
});

//  Search Button
document.getElementById("searchBtn").addEventListener("click", function () {
  const city = document.getElementById("cityNameInput").value.trim();
  if (city === "") {
    alert("Error: No city entered.");
    return;
  }

  fetch(`https://wttr.in/${city}?format=j1`)
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data, city);
      displayForecast(data);

      document.getElementById("changeMetric").onclick = function () {
        isCelsius = !isCelsius;
        displayWeather(data, city);
        displayForecast(data);
      };

      document.getElementById("reset").onclick = function () {
        document.getElementById("weatherResult").innerHTML = ``;
        document.getElementById("cityNameInput").value = "";
      };
    })
    .catch((error) => {
      console.error("Error fetching weather:", error);
      document.getElementById("weatherResult").innerHTML =
        "🛑 Could not fetch weather data.";
    });
});

// Display icons according to weather
function getWeatherIconClass(condition) {
  const c = condition.toLowerCase();
  if (c.includes("sun")) return "wi-day-sunny";
  if (c.includes("cloud") && c.includes("part")) return "wi-day-cloudy";
  if (c.includes("cloud")) return "wi-cloudy";
  if (c.includes("rain") && c.includes("thunder")) return "wi-thunderstorm";
  if (c.includes("rain") || c.includes("shower")) return "wi-rain";
  if (c.includes("snow")) return "wi-snow";
  if (c.includes("fog") || c.includes("mist")) return "wi-fog";
  return "wi-na";
}

// Current Weather Display
function displayWeather(data, location) {
  const current = data.current_condition[0];
  const condition = current.weatherDesc[0].value;
  const iconClass = getWeatherIconClass(condition);

  const tempC = parseFloat(current.temp_C);
  const tempF = (tempC * 9) / 5 + 32;
  const feelsC = parseFloat(current.FeelsLikeC);
  const feelsF = (feelsC * 9) / 5 + 32;

  const weatherHTML = `
    <p><strong><i class="fas fa-map-marker-alt"></i> City:</strong> ${location}</p>
    <p><strong>Temperature:</strong> ${
      isCelsius ? `${tempC}°C` : `${tempF.toFixed(1)}°F`
    } <i class="wi ${iconClass}"></i></p>
    <p><strong>Condition:</strong> ${condition}</p>
    <p><strong>Feels Like:</strong> ${
      isCelsius ? `${feelsC}°C` : `${feelsF.toFixed(1)}°F`
    }</p>
    <p><strong>Humidity:</strong> ${current.humidity}%</p>
  `;

  document.getElementById("weatherResult").innerHTML = weatherHTML;
}

// 3-Days Forecast
function displayForecast(data) {
  const oldForecast = document.querySelector(".forecast");
  if (oldForecast) oldForecast.remove();

  const forecastContainer = document.createElement("div");
  forecastContainer.className = "forecast";

  data.weather.slice(0, 3).forEach((day) => {
    const date = day.date;
    const avgTemp = parseFloat(day.avgtempC);
    const avgTempF = (avgTemp * 9) / 5 + 32;
    const tempText = isCelsius ? `${avgTemp}°C` : `${avgTempF.toFixed(1)}°F`;
    const desc = day.hourly[4].weatherDesc[0].value;
    const iconClass = getWeatherIconClass(desc);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p><strong>${date}</strong></p>
      <i class="wi ${iconClass}" style="font-size:2rem;"></i>
      <p>${desc}</p>
      <p>Avg Temp: ${tempText}</p>
    `;
    forecastContainer.appendChild(card);
  });

  document.getElementById("weatherResult").appendChild(forecastContainer);
}
