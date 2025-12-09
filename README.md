<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Thai-Japan Weather Comparison App

This application compares weather conditions between cities in Thailand and Japan using AI-powered insights.

## Prerequisites

- Node.js (version 14 or higher)
- API keys for OpenWeatherMap and Google Gemini

## Environment Setup

1. Copy the `.env` file to `.env.local`:
   ```bash
   cp .env .env.local
   ```

2. Obtain your API keys:
   - OpenWeatherMap API key: [Get API key](https://openweathermap.org/api)
   - Google Gemini API key: [Get API key](https://ai.google.dev/)

3. Edit `.env.local` and add your API keys:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

The app will start on `http://localhost:3000`.
