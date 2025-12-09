import axios from 'axios';
import { WeatherData, ForecastData, AirQualityData } from '../types';
import { OPENWEATHER_BASE_URL, WEATHER_API_KEY } from '../constants';

const api = axios.create({
  baseURL: OPENWEATHER_BASE_URL,
  params: {
    appid: WEATHER_API_KEY,
    units: 'metric',
  },
});

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!WEATHER_API_KEY) throw new Error("API Key missing");
  try {
    const response = await api.get<WeatherData>('/weather', {
      params: { q: city },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching weather data:', error.response?.data || error.message);
    throw new Error(`Failed to fetch weather data: ${error.response?.data?.message || error.message}`);
  }
};

export const getWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  if (!WEATHER_API_KEY) throw new Error("API Key missing");
  try {
    const response = await api.get<WeatherData>('/weather', {
      params: { lat, lon },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching weather data:', error.response?.data || error.message);
    throw new Error(`Failed to fetch weather data: ${error.response?.data?.message || error.message}`);
  }
};

export const getForecastByCity = async (city: string): Promise<ForecastData> => {
  if (!WEATHER_API_KEY) throw new Error("API Key missing");
  try {
    const response = await api.get<ForecastData>('/forecast', {
      params: { q: city },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching forecast data:', error.response?.data || error.message);
    throw new Error(`Failed to fetch forecast data: ${error.response?.data?.message || error.message}`);
  }
};

export const getAirQuality = async (lat: number, lon: number): Promise<AirQualityData> => {
  if (!WEATHER_API_KEY) throw new Error("API Key missing");
  try {
    const response = await api.get<AirQualityData>('/air_pollution', {
      params: { lat, lon },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching air quality data:', error.response?.data || error.message);
    throw new Error(`Failed to fetch air quality data: ${error.response?.data?.message || error.message}`);
  }
};

export const getIconUrl = (iconCode: string) => 
  `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

export const formatTime = (timestamp: number, timezone: number) => {
  // Create date object from UTC timestamp
  const date = new Date((timestamp + timezone) * 1000); 
  // Adjust for local system time offset to display correctly in target timezone logic manually if needed, 
  // but standard JS toLocaleString with timeZone option is safer if we had the IANA zone.
  // Since we only have offset in seconds, we construct UTC and add offset.
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const targetDate = new Date(utc + (1000 * timezone));
  
  return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const isNightTime = (weather: WeatherData): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now < weather.sys.sunrise || now > weather.sys.sunset;
};