//plants
 const plants = [
          { id: 1, name: "Bolzano Solar", capacity: 5000, active: true, city: "Bolzano" },
          { id: 2, name: "Trento Wind", capacity: 3000, active: false, city: "Trento" },
          { id: 3, name: "Merano Hydro", capacity: 8000, active: true, city: "Merano" },
        ];

        // Fetch weather data
        async function getWeather(lat, lon, city) {
          try {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`,
            );
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return {
              city,
              temp: data.current.temperature_2m,
              wind: data.current.wind_speed_10m,
            };
          } catch (error) {
            console.error(`Errore gestito: ${error.message}`);
            return { city, temp: 0, wind: 0 }; // Fallback per non rompere il layout
          }
        }

        // Solar production
        function estimateSolarProduction(temp, capacity) {
          let produzione = 0;
          if (temp > 20) {
            produzione = capacity * (temp / 30);
          } else {
            produzione = capacity * 0.2;
          }
          return produzione;
        }

        // Render Card Weather
        function renderWeather(data) {
          const grid = document.getElementById("weather");
          if (!grid) return;
          
          grid.innerHTML = ""; // Pulizia iniziale

          data.forEach((cityData) => {
            const card = document.createElement("div");
            // Classi responsive rimosse le larghezze fisse
            card.classList.add(
              "bg-white", "rounded-2xl", "shadow-lg", "p-6", "flex", "flex-col", "justify-between"
            );
            
            const titleCard = document.createElement("h2");
            titleCard.classList.add("text-xl", "font-bold", "text-center", "text-indigo-800", "mb-4");
            titleCard.textContent = cityData.city;
            card.appendChild(titleCard);

            const tempCard = document.createElement("p");
            tempCard.classList.add("text-lime-600", "font-medium");
            tempCard.textContent = `Temp: ${cityData.temp} °C`;
            card.appendChild(tempCard);

            const windCard = document.createElement("p");
            windCard.classList.add("text-lime-600", "font-medium");
            windCard.textContent = `Vento: ${cityData.wind} Km/h`;
            card.appendChild(windCard);

            const production = estimateSolarProduction(cityData.temp, 5000);
            const prodCard = document.createElement("p");
            prodCard.classList.add("mt-2", "text-emerald-600", "font-bold", "text-sm", "pt-2", "border-t", "border-gray-100");
            prodCard.textContent = `⚡ Stima: ${Math.round(production)} kW`;
            card.appendChild(prodCard);

            grid.appendChild(card);
          });
        }

        // Render Card Plants
        function renderPlants(plants) {
          const container = document.getElementById("plants");
          if (!container) return;

          container.innerHTML = "";

          if (plants.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500">Nessun impianto presente</p>`;
            return;
          }

          plants.forEach((element) => {
            const card = document.createElement("div");
            // Aggiunte classi per stile coerente e responsive
            card.classList.add("border", "border-gray-100", "rounded-lg", "p-4", "text-center", "hover:shadow-md", "transition-shadow");
            
            const statusColor = element.active ? "text-green-600" : "text-red-500";
            const statusIcon = element.active ? "✅" : "⛔";

            card.innerHTML = `
                <h3 class="font-bold text-lg text-gray-800">${element.name}</h3>
                <p class="mt-2 text-blue-600 font-semibold">Capacità: ${element.capacity} kW</p>
                <p class="mt-2 ${statusColor} font-bold">Status: ${statusIcon} ${element.active ? 'Attivo' : 'Off'}</p>
            `;
            container.appendChild(card);
          });
        }

        // Report
        async function generateReport(weatherData, plants) {
          const report = document.getElementById("report");
          if (!report) return;

          const cities = weatherData.map((w) => w.city).join(", ");
          const temperature = weatherData.map((w) => `${w.city}: ${w.temp}°C`).join(" | ");
          const activePlants = plants.filter((p) => p.active);
          const totalCapacity = plants.reduce((sum, p) => sum + p.capacity, 0);

          report.innerHTML = `
            <h3 class="text-center font-bold mb-2 text-green-300">- 🔋 ENERGY REPORT 🔋 -</h3>
            <p class="mb-1"><strong class="text-green-500">Città:</strong> ${cities}</p>
            <p class="mb-1"><strong class="text-green-500">Temperature:</strong> ${temperature}</p>
            <p class="mb-1"><strong class="text-green-500">Impianti:</strong> ${activePlants.length}/${plants.length} attivi (${activePlants.map((p) => p.name).join(", ") || "Nessuno"})</p>
            <p><strong class="text-green-500">Capacità Totale:</strong> ${totalCapacity} kW</p>
          `;
        }

        // Initialization
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
            console.error("Errore critico:", error.message);
            document.getElementById('report').innerHTML = `<p class="text-red-400">Errore nel caricamento dati: ${error.message}</p>`;
          }
        }

        init();
