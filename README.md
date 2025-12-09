<div align="center">

# Thai-Japan Weather Comparison App

A modern weather comparison application that allows users to compare weather conditions between cities in Thailand and Japan with AI-powered insights and 5-day forecasts.

## Features

- 🌤️ Real-time weather data for cities in Thailand and Japan
- 📊 5-day temperature forecast comparison with interactive charts
- 🤖 AI-powered weather analysis using Google Gemini
- 🌍 Air quality index (AQI) monitoring
- 🎨 Dynamic day/night theme based on local time
- 📱 Responsive design for mobile and desktop

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- API keys for OpenWeatherMap and Google Gemini

## Getting API Keys

### OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/)
2. Click **Sign In** (or **Sign Up** if you don't have an account)
3. After logging in, navigate to **API keys** section in your account dashboard
4. Click **Generate** to create a new API key or copy an existing one
5. **Important:** New API keys may take 10-15 minutes to activate
6. The free tier includes:
   - Current weather data
   - 5-day / 3-hour forecast
   - Air pollution data
   - 60 calls/minute limit

### Google Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click **Get API key** or **Sign in with Google**
3. Once logged in, click **Get API key** button
4. Click **Create API key** in a new or existing project
5. Copy the generated API key
6. The free tier includes:
   - 60 requests per minute
   - Gemini 1.5 Flash model access

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API keys:
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

   **Note:** The `VITE_` prefix is required for Vite to expose these variables to the client-side application.

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` folder.

## Project Structure

```
├── components/          # React components
│   ├── AIAgent.tsx     # AI chat interface
│   └── Layout.tsx      # Main layout wrapper
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Search.tsx      # City weather search
│   └── Compare.tsx     # Weather comparison
├── services/           # API services
│   ├── weatherService.ts   # OpenWeatherMap API
│   └── geminiService.ts    # Google Gemini AI API
├── types.ts            # TypeScript type definitions
└── constants.ts        # App constants and config

```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Google Generative AI** - AI-powered insights

## API Limitations

- **OpenWeatherMap Free Tier:** 5-day forecast only (not monthly)
- **Google Gemini Free Tier:** Rate limited to 60 requests/minute

## Troubleshooting

### 401 Error - Invalid API Key

- Ensure your API keys are correctly copied to `.env.local`
- Verify the `VITE_` prefix is present in variable names
- Wait 10-15 minutes after generating new OpenWeatherMap API keys
- Restart the development server after changing `.env.local`

### API Key Not Loading

- Make sure `.env.local` file exists in the project root
- Check that variable names match exactly: `VITE_OPENWEATHER_API_KEY` and `VITE_GEMINI_API_KEY`
- Restart the dev server with `npm run dev`

## License

MIT License
