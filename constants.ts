export const QUICK_CITIES = {
  THAILAND: [
    { name: 'Bangkok', country: 'TH' },
    { name: 'Chiang Mai', country: 'TH' },
    { name: 'Phuket', country: 'TH' },
    { name: 'Khon Kaen', country: 'TH' },
  ],
  JAPAN: [
    { name: 'Tokyo', country: 'JP' },
    { name: 'Osaka', country: 'JP' },
    { name: 'Sapporo', country: 'JP' },
    { name: 'Fukuoka', country: 'JP' },
  ]
};

// IMPORTANT: In a real deployment, these should be environment variables.
// Ensure VITE_OPENWEATHER_API_KEY is set in .env.local.
export const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''; 
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';