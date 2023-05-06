const cityEl = document.querySelector(".search");
const search = document.querySelector(".searchForm");

//api f2e26748fb648875d4055b62c1e10d37

const apiKey = "f2e26748fb648875d4055b62c1e10d37";

let city = [];

const searchHandler = async (event) => {
  event.preventDefault();
  city = cityEl.value;

  const response = await fetch(
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  );
  const data = await response.json();
  console.log(data);
};

search.addEventListener("submit", searchHandler);
