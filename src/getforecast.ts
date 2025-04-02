// Weather Forecast Component (assuming Vue with TypeScript)
import { defineComponent } from 'vue';

interface WeatherHour {
  temp_f: number;
  time: string;
  condition: {
    icon: string;
    text: string;
  };
  // Add other properties that might be in your weather data
}

export default defineComponent({
  name: 'WeatherForecast',
  
  // Your component props
  props: {
    // If your weather data is passed as a prop, include it here
    // Otherwise, you might fetch it directly in the component
  },
  
  // Component data
  data() {
    return {
      locationWeatherHourly: [] as WeatherHour[], // Your hourly weather data
      // Other data properties your component might need
    };
  },
  
  // Computed properties
  computed: {
    nextSixHours(): WeatherHour[] {
      // Find the index of the current hour
      const currentHourIndex = this.findCurrentHourIndex();
      
      // Return the next 6 hours from the current hour
      // If currentHourIndex is -1 (not found), start from the beginning
      const startIndex = currentHourIndex !== -1 ? currentHourIndex : 0;
      return this.locationWeatherHourly.slice(startIndex, startIndex + 6);
    }
  },
  
  // Component methods
  methods: {
    findCurrentHourIndex(): number {
      // Get current date and time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Find the first forecast hour that's in the future
      return this.locationWeatherHourly.findIndex(hour => {
        // Parse the time from your data
        const hourTime = new Date(hour.time);
        
        // Check if this forecast hour is in the future
        if (hourTime.getHours() > currentHour) {
          return true;
        } else if (hourTime.getHours() === currentHour && hourTime.getMinutes() > currentMinute) {
          return true;
        }
        return false;
      });
    },
    
    // Add your method to fetch weather data
    async fetchWeatherData() {
      try {
        // Your API call logic here
        // const response = await fetch('your-weather-api-endpoint');
        // const data = await response.json();
        // this.locationWeatherHourly = data.forecast.forecastday[0].hour;
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
  },
  
  // Lifecycle hooks
  mounted() {
    // Fetch weather data when component mounts
    this.fetchWeatherData();
  }
});