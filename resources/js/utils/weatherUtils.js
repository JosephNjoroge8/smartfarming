export const getWeatherIcon = (iconCode) => {
    const icons = {
        '01d': '☀️', // clear sky day
        '01n': '🌙', // clear sky night
        '02d': '⛅', // few clouds day
        '02n': '☁️', // few clouds night
        '03d': '☁️', // scattered clouds day
        '03n': '☁️', // scattered clouds night
        '04d': '☁️', // broken clouds day
        '04n': '☁️', // broken clouds night
        '09d': '🌧️', // shower rain day
        '09n': '🌧️', // shower rain night
        '10d': '🌦️', // rain day
        '10n': '🌧️', // rain night
        '11d': '⛈️', // thunderstorm day
        '11n': '⛈️', // thunderstorm night
        '13d': '❄️', // snow day
        '13n': '❄️', // snow night
        '50d': '🌫️', // mist day
        '50n': '🌫️', // mist night
    };
    return icons[iconCode] || '🌤️';
};

export const getAgricultureAdvice = (weather) => {
    const temp = weather?.main?.temp;
    const humidity = weather?.main?.humidity;
    const precipitation = weather?.forecast?.list?.[0]?.pop || 0;
    
    let advice = 'Normal farming conditions.';
    
    if (temp > 30) {
        advice = 'High temperatures. Ensure adequate irrigation.';
    } else if (temp < 10) {
        advice = 'Cool temperatures. Protect sensitive crops.';
    }
    
    if (humidity > 80) {
        advice += ' High humidity may increase disease risk.';
    }
    
    if (precipitation > 0.5) {
        advice += ' Heavy rainfall expected - protect soil from erosion.';
    }
    
    return advice;
};