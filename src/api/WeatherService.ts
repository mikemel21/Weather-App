import axios from "axios";

interface Location {
    id: number;
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    url: string;
}

// returns a list of locations based on user input
export async function returnLocation(
    query: string
): Promise<Location[] | null> {
    try {
        const response = await axios.get<Location[]>(
            "https://api.weatherapi.com/v1/search.json",
            {
                params: {
                    key: import.meta.env.VITE_WEATHER_API_KEY,
                    q: query,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching location data:", error);
        return null;
    }
}

// returns weather data for a given location
export async function getWeather(
    query: string,
    numdays: number
): Promise<any | null> {
    try {
        const response = await axios.get(
            "https://api.weatherapi.com/v1/forecast.json",
            {
                params: {
                    key: import.meta.env.VITE_WEATHER_API_KEY,
                    q: query,
                    days: numdays,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}
