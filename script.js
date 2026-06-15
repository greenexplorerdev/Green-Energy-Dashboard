//plants
const plants = [
  {
    id: 1,
    name: "Bolzano Solar",
    capacity: 5000,
    active: true,
    city: "Bolzano",
  },
  { id: 2, name: "Trento Wind", capacity: 3000, active: false, city: "Trento" },
  { id: 3, name: "Merano Hydro", capacity: 8000, active: true, city: "Merano" },
];

//fetch data for dashboard
async function getWeather(lat, lon, city) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`,
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);

    return {
      city,
      temp: data.current.temperature_2m,
      wind: data.current.wind_speed_10m,
    };
  } catch (error) {
    console.error(`errore gestito: ${error.message}`);
  }
}

//solar production
function estimateSolarProduction(temp, capacity) {
  let produzione = 0;
  if (temp > 20) {
    produzione = capacity * (temp / 30);
  } else {
    produzione = capacity * 0.2;
  }
  return produzione;
}

//create initial dashboard, first cards
function renderWeather(data) {
  for (const cities of data) {
    const grid = document.getElementById("weather");
    const card = document.createElement("div");
    card.classList.add(
      "max-w-4xl",
      "mx-auto",
      "bg-white",
      "rounded-2xl",
      "shadow-2xl",
      "p-8",
    );
    grid.appendChild(card);
    const titleCard = document.createElement("h2");
    titleCard.classList.add(
      "text-xl",
      "font-bold",
      "text-center",
      "text-indigo-800",
      "mb-8",
    );
    titleCard.textContent = cities.city;
    card.appendChild(titleCard);
    //temperature
    const tempCard = document.createElement("p");
    tempCard.classList.add("mt-2", "text-lime-600", "font-medium");
    tempCard.textContent = `
    Temperatura percepita: ${cities.temp} °C`;
    card.appendChild(tempCard);
    //wind
    const windCard = document.createElement("p");
    windCard.classList.add("mt-2", "text-lime-600", "font-medium");
    windCard.textContent = `
    Velocità del vento: ${cities.wind} Km/h`;
    card.appendChild(windCard);
    //solar production
    const production = estimateSolarProduction(cities.temp, 5000);
    const prodCard = document.createElement("p");
    prodCard.classList.add("mt-1", "text-emerald-600", "font-bold", "text-sm");
    prodCard.textContent = `⚡ Produzione stimata: ${Math.round(production)} kW`;
    card.appendChild(prodCard);
  }
}

//Plant's card
function renderPlants(plants) {
  const container = document.getElementById("plants");
  if (!container) return;

  container.innerHTML = "";

  const activePlants = plants.filter((p) => p.active);

  if (activePlants.length === 0) {
    container.innerHTML = `<p>Non ci sono impianti attivi al momento</p>`;
  }
  plants.forEach((element) => {
    const card = document.createElement("div");
    card.innerHTML = `
            <h3 class="font-bold text-center">Impianto di: ${element.name}</h3>
            <p class="mt-2 text-green-600 font-bold">Capacità: ${element.capacity}mwh</p>
            <p class="mt-2 text-blue-500 font-bold">Status: ${element.active ? "✅" : "⛔"}</p>
            `;
    container.appendChild(card);
  });
}

//generate report
async function generateReport(weatherData, plants) {
  const report = document.getElementById("report");
  if (!report) return;

  const cities = `${weatherData.map((w) => w.city)}`; //weatherData è un array, non un oggetto. Non puoi fare weatherData.city — devi iterarlo.
  const temperature = `${weatherData.map((w) => `${w.city} ${w.temp}°C`).join(" | ")}`; //doppio template literals per i w.city e w.temperature
  const activePlants = plants.filter((p) => p.active);
  const totalCapacity = plants.reduce((sum, p) => sum + p.capacity, 0);

  //total report
  report.innerHTML = `
  <h3 class= "text-center font-bold">- 🔋 ENERGY REPORT 🔋 -</h3>
  <p>Città: ${cities}</p>
  <p>Temperature monitorate: ${temperature}</p>
  <p>Impianti attivi: ${activePlants.length}/${plants.length} | ${activePlants.map((p) => p.name).join(", ")}</p>
  <p>Capacità totale: ${totalCapacity} kW</p>
`;
}

//primary function
async function init() {
  try {

    const weatherData = await Promise.all([
      getWeather(46.49, 11.35, "Bolzano"),
      getWeather(46.07, 11.12, "Trento"),
      getWeather(46.67, 11.16, "Merano"),
    ]);

    renderWeather(weatherData);
    renderPlants(plants);
    generateReport(weatherData, plants);
  } catch (error) {
    console.error("Errore:", error.message);
  }
}

init();
