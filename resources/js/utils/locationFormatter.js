export const formatLocation = (weatherData, fallbackName = 'Unknown Location') => {
    if (weatherData?.name && weatherData?.sys?.country) {
        return `${weatherData.name}, ${weatherData.sys.country}`;
    } else if (weatherData?.location_name && weatherData?.location_country) {
        return `${weatherData.location_name}, ${weatherData.location_country}`;
    }
    return fallbackName;
};