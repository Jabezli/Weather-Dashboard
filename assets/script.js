const cityEl = document.querySelector(".search");
const search = document.querySelector(".searchForm");
const currentWeather = document.querySelector("#current-weather");
const forcastDiv = document.querySelector("#forecast");

const apiKey = "f2e26748fb648875d4055b62c1e10d37";

let cities = [];
//fetch current weather of the city, this can be the input or can be any selected city in the search history
const fetchCurrent = async (city) => {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
    );
    const data = await response.json();
    return data;
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
  const icon = data.weather[0].icon;

  currentWeather.innerHTML = `
    <h5 class="card-title">${city}</h5>
    <p class="card-text">${date}</p>
    <p class="card-text">${icon}</p>
    <p class="card-text">${temp}</p>
    <p class="card-text">${feelLike}</p>
    <p class="card-text">${windSpeed}</p>
    <p class="card-text">${humidity}</p>
  `;
};

const fetchForcast = async (event) => {
  try {
    event.preventDefault();
    let city = cityEl.value;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`
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
      const icon = item.weather[0].icon;
      const temp = item.main.temp;
      const feelLike = item.main.feels_like;
      const humidity = item.main.humidity;
      const windSpeed = item.wind.speed;

      return `
    <div class="col-md-2">
      <div class="card">
        <div class="card-body">
            <h5 class="card-title">${city}</h5>
            <p class="card-text">${date}</p>
            <p class="card-text">${icon}</p>
            <p class="card-text">${temp}</p>
            <p class="card-text">${feelLike}</p>
            <p class="card-text">${windSpeed}</p>
            <p class="card-text">${humidity}</p>
        </div>
      </div>
    </div>
  `;
    })
    .join("");

  forecast.innerHTML = `
  <div class="row">${forecastHTML}</div>
`;
};

search.addEventListener("submit", fetchForcast);
