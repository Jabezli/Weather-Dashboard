const cityEl = document.querySelector(".search");
const search = document.querySelector(".searchForm");
const currentWeather = document.querySelector("#current-weather");
const forcastDiv = document.querySelector("#forecast");
const searchList = document.querySelector("#search-history");

const apiKey = "f2e26748fb648875d4055b62c1e10d37";

let cities = [];

//fetch current weather of the city, this can be the input or can be any selected city in the search history
const fetchCurrent = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
    );
    const data = await response.json();
    console.log(data);
    //need lat and lon for forecast part
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    return { lat, lon, data };
  } catch (err) {
    console.error(err);
  }
};

const renderCurrent = (data) => {
  //declare variables to store values in data
  const city = data.name;
  //data.dt is a number which means second and can be convert to date. JS using millionsecond to determine date
  //so here using data.dt * 1000 to conver the second to millionsecond and pass into Date class to determine the date
  const date = new Date(data.dt * 1000).toLocaleDateString();
  const temp = data.main.temp;
  const feelLike = data.main.feels_like;
  const windSpeed = data.wind.speed;
  const humidity = data.main.humidity;
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  currentWeather.innerHTML = `
    <h3 class="card-title">${city}</h3>
    <p class="card-text">Date: ${date}</p>
    <img src="${icon}" alt="${data.weather[0].description}">
    <h4 class="card-text">${data.weather[0].description}</h4>
    <p class="card-text">Temperature: ${temp}</p>
    <p class="card-text">Feels like: ${feelLike}</p>
    <p class="card-text">WindSpeed: ${windSpeed}</p>
    <p class="card-text">Humidity: ${humidity}</p>
  `;
};

const fetchForcast = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
};

const renderForcast = (data) => {
  const forecastData = data.list.filter((item) =>
    item.dt_txt.includes("09:00:00")
  );

  const forecastHTML = forecastData
    .map((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
      const city = data.city.name;
      const temp = item.main.temp;
      const feelLike = item.main.feels_like;
      const humidity = item.main.humidity;
      const windSpeed = item.wind.speed;

      return `
    <div class="card col-md-2 col-lg-2 mb-3 px-0">
        <div class="card-body text-center">
            <h3 class="card-title">${city}</h3>
            <p class="card-text">Date: ${date}</p>
            <img src="${icon}" alt="${item.weather[0].description}">
            <h4 class="card-text">${item.weather[0].description}</h4>
            <p class="card-text">Temperature: ${temp}</p>
            <p class="card-text">Feels like: ${feelLike}</p>
            <p class="card-text">WindSpeed: ${windSpeed}</p>
            <p class="card-text">Humidity: ${humidity}</p>
        </div>
    </div>
  `;
    })
    .join("");

  forecast.innerHTML = `
  <div class="row w-100 justify-content-evenly align-items-center">${forecastHTML}</div>
`;
};

const searchHistory = () => {
  const uniqueCities = [...new Set(cities)];
  // loop all the cities from the cities array, then return a button for each city. at the end, join them into one HTML block.
  console.log(uniqueCities);
  const cityList = uniqueCities
    .map((city) => {
      //for "/\b\w/g", / => start point of regex. \b => to find the begining boundary of each word. \w => matches any word caracter (upper, lower, digits, underscores)
      //  "/"" before g => end the regular expression literal. g => check for everything globally.
      // replace(regex first argu, arrow function that applies toUpperCase to all firstLetters)
      return `<button class="btn btn-outline-secondary mt-1 w-100 bg-dark text-white">${city.replace(
        /\b\w/g,
        (firstLetter) => firstLetter.toUpperCase()
      )}</button>`;
    })
    .join("");
  searchList.innerHTML = cityList;

  //It would be nice to have a clear button which only appear when there is any value in the cities array.
  if (cities.length > 0) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    clearBtn.classList.add("btn", "btn-danger", "mt-3", "w-100", "clearBtn");
    searchList.appendChild(clearBtn);
    clearBtn.addEventListener("click", clearHistory);
  }
};

const clearHistory = () => {
  cities = [];
  localStorage.setItem("cities", JSON.stringify(cities));
  //after clearing out the local storage. invoke searchHistory again to refresh the list.
  searchHistory();
};

//when user searches a new city, push the new searched city to cities array. then store the array to localstorage.
const saveCity = (city) => {
  const trimmedCity = city.trim().toLowerCase();
  if (cities.includes(trimmedCity)) {
    return;
  }
  cities.push(trimmedCity);
  localStorage.setItem("cities", JSON.stringify(cities));
  searchHistory();
};

search.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityEl.value;
  if (!city) {
    alert("Please put a city in the search bar");
    return;
  }
  //now we have got the city, search it using fetchCurrent function.
  try {
    const { lat, lon, data } = await fetchCurrent(city);
    console.log("current" + data);
    renderCurrent(data);
    saveCity(city);

    //now, search forecast data
    try {
      const forecastData = await fetchForcast(lat, lon);
      console.log("forecast" + forecastData);
      renderForcast(forecastData);
    } catch (err) {
      console.error(err);
    }
    cityEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Unable to gather weather data. Please try again!");
  }
});

//event listener for the searched cities

searchList.addEventListener("click", async (event) => {
  //instead of using foreach that adds an eventlistener to each button then iterate to determine which one was clicked. This is a better method.
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  //if the button is the clear button, dont do any new fetch.
  if (button.classList.contains("clearBtn")) {
    return;
  }
  //obtain the content in the button element.
  const city = button.textContent;

  //now we have the city, time to get current and forecast data for the city.
  try {
    const { lat, lon, data } = await fetchCurrent(city);
    console.log("current" + data);
    renderCurrent(data);
    saveCity(city);

    try {
      const forecastData = await fetchForcast(lat, lon);
      renderForcast(forecastData);
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    console.error(err);
  }
});

//get stored cities from local storage when the app is opened.
const storedCities = localStorage.getItem("cities");
if (storedCities) {
  cities = JSON.parse(storedCities);
  searchHistory();
}
