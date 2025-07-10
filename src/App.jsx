import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null); // set weather
  const [forecast, setForecast] = useState([]); //set forecast
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [unit, setUnit] = useState("metric"); // change unit to "imperial" for Fahrenheit
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("weather-favorites");
    return saved ? JSON.parse(saved) : [];
  }); // initialize favorites from localStorage
  
  // Function to add a city to favorites
  const addToFavorites = () => {
    if (!weather?.name || favorites.includes(weather.name)) return;
    const updated = [...favorites, weather.name];
    setFavorites(updated);
    localStorage.setItem("weather-favorites", JSON.stringify(updated));
  };
  
  // Funcion to get weather
  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${
          import.meta.env.VITE_WEATHER_API_KEY
        }&units=${unit}`
      );
      setWeather(res.data);
      fetchForecast(city);
    } catch (err) {
      setError("⚠️ City not found or API error.");
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  //Function for 5 day forecast
  const fetchForecast = async (cityName) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${
          import.meta.env.VITE_WEATHER_API_KEY
        }&units=${unit}`
      );

      const daily = res.data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(daily);
    } catch (err) {
      console.error("Forecast error:", err);
    }
  };

  //Function to get GeoLocation
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${
              import.meta.env.VITE_WEATHER_API_KEY
            }&units=${unit}`
          );

          setWeather(res.data);
          setCity(res.data.name);
          fetchForecast(res.data.name);
        } catch (err) {
          setError("Error fetching weather for your location.");
          setForecast([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Permission denied for geolocation.");
      }
    );
  };

  return ( 
    <div 
      style={{
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(to right, #667eea, #764ba2)",
        minHeight: "100vh",
        color: "white",
        padding: "2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "2rem",
          borderRadius: "20px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ marginBottom: "1rem" }}>🌦️ Weather Dashboard</h1>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              padding: "0.8rem",
              borderRadius: "10px",
              border: "none",
              fontSize: "1rem",
              width: "100%",
              textAlign: "center",
            }}
          />
        </div>

        {/* Button to toggle units */}
        <button
          onClick={() => {
            const newUnit = unit === "metric" ? "imperial" : "metric";
            setUnit(newUnit);
            if (city) fetchWeather();
            else if (weather?.name) fetchForecast(weather.name);
          }}
          style={{
            backgroundColor: "#ffa500",
            color: "white",
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          Switch to {unit === "metric" ? "°F" : "°C"}
        </button>

        {/* Search + location + favorite buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            onClick={fetchWeather}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "0.8rem 1rem",
              fontSize: "1rem",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Search
          </button>

          <button
            onClick={getLocation}
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              padding: "0.8rem 1rem",
              fontSize: "1rem",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Use My Location
          </button> 
        </div>

        {weather && (
          <button
            onClick={addToFavorites}
            style={{
              backgroundColor: "#ff69b4",
              color: "white",
              padding: "0.6rem 1.2rem",
              fontSize: "1rem",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            ⭐ Add {weather.name} to Favorites
          </button>
        )}

        {/* Loading & error */}
        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "#ffdddd", fontWeight: "bold" }}>{error}</p>
        )}

        {/* Display current weather */}
        {weather && (
          <div style={{ marginTop: "1rem" }}>
            <h2>{weather.name}</h2>
            <p style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>
              🌡️ {weather.main.temp}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>☁️ {weather.weather[0].description}</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
          </div>
        )}

        {/* Forecast display */}
        {forecast.length > 0 && (
          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h3>5-Day Forecast</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              {forecast.map((day) => (
                <div
                  key={day.dt}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    padding: "1rem",
                    flex: "1",
                    minWidth: "100px",
                    textAlign: "center",
                  }}
                >
                  <p>
                    <strong>
                      {new Date(day.dt_txt).toLocaleDateString()}
                    </strong>
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />
                  <p>{day.main.temp}°{unit === "metric" ? "C" : "F"}</p>
                  <p style={{ fontSize: "0.85rem" }}>
                    {day.weather[0].main}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favourite cities section */}
        {favorites.length > 0 && (
          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h3>⭐ Favorite Cities</h3>
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {favorites.map((favCity) => (
                <li key={favCity}>
                  <button
                    onClick={() => {
                      setCity(favCity);
                      fetchWeather();
                    }}
                    style={{
                      backgroundColor: "#ffffff22",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      marginBottom: "0.5rem",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {favCity}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;

