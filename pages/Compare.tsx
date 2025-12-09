import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getWeatherByCity, getForecastByCity, getAirQuality, getIconUrl, isNightTime } from '../services/weatherService';
import { compareWeatherWithGemini } from '../services/geminiService';
import { WeatherData, ForecastData } from '../types';
import Layout from '../components/Layout';
import { ArrowRight, Bot, Wind, Sparkles, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cityAName, setCityAName] = useState('Bangkok');
  const [cityBName, setCityBName] = useState('Tokyo');
  
  const [dataA, setDataA] = useState<WeatherData | null>(null);
  const [dataB, setDataB] = useState<WeatherData | null>(null);
  
  const [forecastA, setForecastA] = useState<ForecastData | null>(null);
  const [forecastB, setForecastB] = useState<ForecastData | null>(null);
  
  const [aqiA, setAqiA] = useState<number | null>(null);
  const [aqiB, setAqiB] = useState<number | null>(null);

  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  // Handle URL params for AI Agent
  useEffect(() => {
    const pCityA = searchParams.get('cityA');
    const pCityB = searchParams.get('cityB');

    if (pCityA && pCityB && !autoRan) {
      setCityAName(pCityA);
      setCityBName(pCityB);
      handleCompare(pCityA, pCityB);
      setAutoRan(true);
    }
  }, [searchParams]);

  const handleCompare = async (cA: string = cityAName, cB: string = cityBName) => {
    setLoading(true);
    setSummary('');
    try {
      const [resA, resB, fcA, fcB] = await Promise.all([
        getWeatherByCity(cA),
        getWeatherByCity(cB),
        getForecastByCity(cA),
        getForecastByCity(cB)
      ]);
      setDataA(resA);
      setDataB(resB);
      setForecastA(fcA);
      setForecastB(fcB);

      // Update URL
      setSearchParams({ cityA: cA, cityB: cB }, { replace: true });

      // Fetch Air Quality separately
      const [qA, qB] = await Promise.all([
        getAirQuality(resA.coord.lat, resA.coord.lon),
        getAirQuality(resB.coord.lat, resB.coord.lon)
      ]);
      setAqiA(qA.list[0].main.aqi);
      setAqiB(qB.list[0].main.aqi);

      // AI Summary
      const aiSummary = await compareWeatherWithGemini(resA, resB);
      setSummary(aiSummary);

    } catch (error) {
      console.error(error);
      setSummary("Error fetching comparison data. Please check city names.");
    } finally {
      setLoading(false);
    }
  };

  const getAqiLabel = (aqi: number) => {
    const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    return labels[aqi - 1] || "Unknown";
  };

  const getAqiColor = (aqi: number) => {
    if (aqi === 1) return 'text-green-500';
    if (aqi === 2) return 'text-yellow-500';
    if (aqi === 3) return 'text-orange-500';
    return 'text-red-500';
  };

  // Determine layout theme based on City A (primary selection)
  const isNight = dataA ? isNightTime(dataA) : false;

  // Prepare comparison chart data
  const comparisonChartData = forecastA && forecastB 
    ? forecastA.list
        .filter((_, index) => index % 8 === 0) // One per day
        .map((itemA, idx) => {
          const itemB = forecastB.list[idx * 8];
          return {
            name: new Date(itemA.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            [cityAName]: Math.round(itemA.main.temp),
            [cityBName]: itemB ? Math.round(itemB.main.temp) : null,
          };
        })
    : [];

  return (
    <Layout isNight={isNight}>
      <h1 className="text-2xl font-bold mb-6 text-center">Compare Weather</h1>
      
      {/* Input Section */}
      <div className={`p-4 rounded-3xl shadow-lg mb-6 ${isNight ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input 
            value={cityAName} 
            onChange={(e) => setCityAName(e.target.value)}
            className={`flex-1 p-3 rounded-xl text-center font-bold outline-none border ${isNight ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
          />
          <div className="bg-sky-500 text-white p-2 rounded-full shadow-lg">
            <span className="font-bold text-xs">VS</span>
          </div>
          <input 
            value={cityBName} 
            onChange={(e) => setCityBName(e.target.value)}
            className={`flex-1 p-3 rounded-xl text-center font-bold outline-none border ${isNight ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-slate-800'}`}
          />
        </div>
        <button 
          onClick={() => handleCompare(cityAName, cityBName)}
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? 'Analyzing...' : 'Compare Cities'}
        </button>
      </div>

      {/* Results */}
      {dataA && dataB && (
        <div className="space-y-6 animate-fade-in">
          
          {/* AI Summary Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-3xl shadow-xl">
             <div className={`rounded-[22px] p-5 h-full ${isNight ? 'bg-slate-900' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-3">
                   <Sparkles className="text-indigo-500" size={20} />
                   <h3 className={`font-bold ${isNight ? 'text-white' : 'text-slate-800'}`}>AI Analysis</h3>
                </div>
                <p className={`text-sm leading-relaxed ${isNight ? 'text-gray-300' : 'text-gray-600'}`}>
                   {summary}
                </p>
             </div>
          </div>

          {/* 5-Day Forecast Comparison Chart */}
          {comparisonChartData.length > 0 && (
            <div className={`p-6 rounded-3xl shadow-lg backdrop-blur-sm ${
              isNight ? 'bg-slate-800/60' : 'bg-white/60'
            }`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar size={18} /> 5-Day Temperature Comparison
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isNight ? "#ffffff20" : "#00000020"} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isNight ? '#ccc' : '#666', fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: isNight ? '#ccc' : '#666', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={['dataMin - 3', 'dataMax + 3']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isNight ? '#1e293b' : '#fff', 
                        borderRadius: '12px', 
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={cityAName} 
                      stroke="#0ea5e9" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#0ea5e9' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={cityBName} 
                      stroke="#f97316" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#f97316' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Comparison Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* City A Column */}
            <div className={`p-4 rounded-3xl flex flex-col items-center ${isNight ? 'bg-slate-800/80' : 'bg-white/80'}`}>
               <h3 className="font-bold text-lg mb-2 text-center">{dataA.name}</h3>
               <img src={getIconUrl(dataA.weather[0].icon)} className="w-20 h-20" alt="weather" />
               <span className="text-4xl font-light mb-4">{Math.round(dataA.main.temp)}°</span>
               
               <div className="w-full space-y-3 text-sm">
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Feels Like</span>
                   <span className="font-semibold">{Math.round(dataA.main.feels_like)}°</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Humidity</span>
                   <span className="font-semibold">{dataA.main.humidity}%</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Wind</span>
                   <span className="font-semibold">{dataA.wind.speed} m/s</span>
                 </div>
                 <div className="flex justify-between pt-1">
                   <span className="opacity-60">AQI</span>
                   <span className={`font-bold ${getAqiColor(aqiA || 0)}`}>{getAqiLabel(aqiA || 0)}</span>
                 </div>
               </div>
            </div>

            {/* City B Column */}
            <div className={`p-4 rounded-3xl flex flex-col items-center ${isNight ? 'bg-slate-800/80' : 'bg-white/80'}`}>
               <h3 className="font-bold text-lg mb-2 text-center">{dataB.name}</h3>
               <img src={getIconUrl(dataB.weather[0].icon)} className="w-20 h-20" alt="weather" />
               <span className="text-4xl font-light mb-4">{Math.round(dataB.main.temp)}°</span>
               
               <div className="w-full space-y-3 text-sm">
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Feels Like</span>
                   <span className="font-semibold">{Math.round(dataB.main.feels_like)}°</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Humidity</span>
                   <span className="font-semibold">{dataB.main.humidity}%</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-200/20 pb-2">
                   <span className="opacity-60">Wind</span>
                   <span className="font-semibold">{dataB.wind.speed} m/s</span>
                 </div>
                 <div className="flex justify-between pt-1">
                   <span className="opacity-60">AQI</span>
                   <span className={`font-bold ${getAqiColor(aqiB || 0)}`}>{getAqiLabel(aqiB || 0)}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ComparePage;
