import axios from 'axios';

export interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

export const getWeatherData = async (
  latitude: number, 
  longitude: number
): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`
    );

    return {
      temperature: response.data.current.temp_c,
      rainfall: response.data.current.precip_mm,
      humidity: response.data.current.humidity
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};