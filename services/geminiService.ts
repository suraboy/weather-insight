import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";
import { GEMINI_API_KEY } from "../constants";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const compareWeatherWithGemini = async (cityA: WeatherData, cityB: WeatherData): Promise<string> => {
  if (!GEMINI_API_KEY) return "AI comparison unavailable (Missing API Key).";

  const prompt = `
    Compare the current weather in ${cityA.name}, ${cityA.sys.country} and ${cityB.name}, ${cityB.sys.country}.
    
    Data for ${cityA.name}:
    - Temp: ${cityA.main.temp}°C (Feels like ${cityA.main.feels_like}°C)
    - Condition: ${cityA.weather[0].description}
    - Humidity: ${cityA.main.humidity}%
    - Wind: ${cityA.wind.speed} m/s

    Data for ${cityB.name}:
    - Temp: ${cityB.main.temp}°C (Feels like ${cityB.main.feels_like}°C)
    - Condition: ${cityB.weather[0].description}
    - Humidity: ${cityB.main.humidity}%
    - Wind: ${cityB.wind.speed} m/s

    Task: Briefly analyze which city has "better" weather for a general tourist today. Provide a 2-sentence summary. Be decisive but friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI comparison at this moment.";
  }
};