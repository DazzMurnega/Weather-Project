function WeatherCard({ weather }) {
    return (
      <div className="card">
        <h2>{weather.name}</h2>
        <p>🌡️ Temperature: {weather.main.temp}°{unit === "metric" ? "C" : "F"}</p>
        <p>🌫️ Description: {weather.weather[0].description}</p>
        <p>💧 Humidity: {weather.main.humidity}%</p>
      </div>
    );
  }
  
  export default WeatherCard;
  