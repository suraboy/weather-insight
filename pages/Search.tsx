import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Sunrise, Sunset, Calendar, MapPin, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { QUICK_CITIES } from '../constants';
import { getWeatherByCity, getForecastByCity, getIconUrl, formatTime, isNightTime } from '../services/weatherService';
import { WeatherData, ForecastData } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle URL params for AI Agent control
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && queryParam !== weather?.name) {
      setQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [searchParams]);

  const handleSearch = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        getWeatherByCity(city),
        getForecastByCity(city)
      ]);
      setWeather(weatherRes);
      setForecast(forecastRes);
      // Update URL without reloading if it wasn't already there
      setSearchParams({ q: city }, { replace: true });
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to fetch data: ${err.message || 'City not found. Please try again.'}`);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Prepare chart data (take one reading per day, usually noon)
  const chartData = forecast?.list
    .filter((_, index) => index % 8 === 0) // Every 8th item (3hr intervals * 8 = 24hrs)
    .map(item => ({
      name: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      temp: Math.round(item.main.temp),
      min: Math.round(item.main.temp_min),
      max: Math.round(item.main.temp_max),
      icon: item.weather[0].icon
    }));

  const isNight = weather ? isNightTime(weather) : false;

  return (
    <Layout isNight={isNight}>
      <div className="flex flex-col space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search city in Thailand or Japan..."
            className={`w-full p-4 pl-12 rounded-2xl shadow-lg outline-none transition-all ${
              isNight ? 'bg-slate-800 text-white placeholder-slate-400' : 'bg-white text-slate-800 placeholder-slate-400'
            }`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-4 top-4 opacity-50" />
          {loading && <Loader2 className="absolute right-4 top-4 animate-spin opacity-50" />}
        </form>

        {/* Quick Select */}
        {!weather && !loading && (
          <div className="space-y-4 animate-fade-in-up">
            <h3 className="text-sm font-bold uppercase opacity-70 tracking-wider">Quick Select</h3>
            <div className="space-y-2">
              <p className="text-xs opacity-60 font-semibold">Thailand 🇹🇭</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CITIES.THAILAND.map(city => (
                  <button
                    key={city.name}
                    onClick={() => handleSearch(city.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                      isNight ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-sky-50'
                    } shadow-sm`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-xs opacity-60 font-semibold">Japan 🇯🇵</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CITIES.JAPAN.map(city => (
                  <button
                    key={city.name}
                    onClick={() => handleSearch(city.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                      isNight ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-sky-50'
                    } shadow-sm`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-600 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Weather Results */}
        {weather && (
          <div className="animate-fade-in space-y-6">
            {/* Current Weather Card */}
            <div className={`p-6 rounded-3xl shadow-xl backdrop-blur-sm ${
               isNight ? 'bg-slate-800/60 border border-slate-600' : 'bg-white/60 border border-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin size={20} /> {weather.name}, {weather.sys.country}
                  </h2>
                  <p className="text-4xl font-light mt-2">{Math.round(weather.main.temp)}°C</p>
                  <p className="opacity-80 capitalize">{weather.weather[0].description}</p>
                </div>
                <img 
                  src={getIconUrl(weather.weather[0].icon)} 
                  alt="weather icon" 
                  className="w-20 h-20 -mt-2" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="flex items-center gap-2">
                    <Sunrise size={18} className="text-orange-400" />
                    <div>
                      <p className="text-xs opacity-60">Sunrise</p>
                      <p className="text-sm font-semibold">{formatTime(weather.sys.sunrise, weather.timezone)}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Sunset size={18} className="text-purple-400" />
                    <div>
                      <p className="text-xs opacity-60">Sunset</p>
                      <p className="text-sm font-semibold">{formatTime(weather.sys.sunset, weather.timezone)}</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Forecast Chart */}
            {chartData && chartData.length > 0 && (
              <div className={`p-6 rounded-3xl shadow-lg backdrop-blur-sm ${
                 isNight ? 'bg-slate-800/60' : 'bg-white/60'
              }`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar size={18} /> 5-Day Forecast
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isNight ? "#ffffff20" : "#00000020"} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: isNight ? '#ccc' : '#666', fontSize: 12 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        hide 
                        domain={['dataMin - 2', 'dataMax + 2']} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isNight ? '#1e293b' : '#fff', 
                          borderRadius: '12px', 
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temp" 
                        stroke={isNight ? '#a78bfa' : '#0ea5e9'} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: isNight ? '#a78bfa' : '#0ea5e9' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Daily Cards Strip */}
                <div className="flex justify-between mt-4 overflow-x-auto pb-2 gap-4 no-scrollbar">
                  {chartData.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-[60px]">
                      <span className="text-xs opacity-70">{day.name}</span>
                      <img src={getIconUrl(day.icon)} alt="icon" className="w-8 h-8 my-1" />
                      <span className="text-sm font-bold">{day.temp}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
