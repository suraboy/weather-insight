import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Droplets, Wind, Thermometer } from 'lucide-react';
import { getWeatherByCoords, getIconUrl, isNightTime } from '../services/weatherService';
import { WeatherData } from '../types';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            );
            setWeather(data);
            setLoading(false);
          } catch (err: any) {
            console.error('Weather fetch error:', err);
            setError(`Failed to fetch weather data: ${err.message || 'Unknown error'}`);
            setLoading(false);
          }
        },
        (err) => {
          setError('Location access denied. Please use Search.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported.');
      setLoading(false);
    }
  }, []);

  const getCountryFlag = (countryCode: string) => {
    if (countryCode === 'TH') return '🇹🇭';
    if (countryCode === 'JP') return '🇯🇵';
    return '';
  };

  const isNight = weather ? isNightTime(weather) : false;

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isNight={isNight}>
      <div className="flex flex-col items-center pt-8 animate-fade-in">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-center space-x-2 text-sm opacity-80 mb-8 uppercase tracking-widest font-semibold">
              <MapPin size={16} />
              <span>Current Location</span>
            </div>

            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold mb-2 text-center">
                {weather.name}
                <span className="ml-3 text-3xl align-top">
                  {getCountryFlag(weather.sys.country)}
                </span>
              </h1>
              <div className="text-xl opacity-90">{weather.weather[0].main}</div>
            </div>

            <div className="relative mb-8">
              <img 
                src={getIconUrl(weather.weather[0].icon)} 
                alt={weather.weather[0].description} 
                className="w-40 h-40 drop-shadow-2xl"
              />
            </div>

            <div className="text-8xl font-light mb-12 tracking-tighter">
              {Math.round(weather.main.temp)}°
            </div>

            {/* Stats Grid */}
            <div className={`w-full grid grid-cols-3 gap-4 p-6 rounded-3xl backdrop-blur-md ${
              isNight ? 'bg-white/10 border border-white/20' : 'bg-white/40 border border-white/40'
            }`}>
              <div className="flex flex-col items-center justify-center space-y-2">
                <Wind size={24} className="opacity-70" />
                <span className="text-sm font-medium">{Math.round(weather.wind.speed)} m/s</span>
                <span className="text-xs opacity-60">Wind</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 border-x border-current/10">
                <Droplets size={24} className="opacity-70" />
                <span className="text-sm font-medium">{weather.main.humidity}%</span>
                <span className="text-xs opacity-60">Humidity</span>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2">
                <Thermometer size={24} className="opacity-70" />
                <span className="text-sm font-medium">{Math.round(weather.main.feels_like)}°</span>
                <span className="text-xs opacity-60">Feels Like</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
};

export default Home;