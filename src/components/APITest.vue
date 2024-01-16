<template>
    <div class="APITest">
        <p class="console-arrow">
            API results in <br />
            developer console >
        </p>
        <div class="search-container">
            <input
                placeholder="Enter Location..."
                type="text"
                v-model="locationInput"
                @keyup.enter="fetchLocations"
            />
            <button @click="fetchLocations">Get Locations</button>
        </div>
        <button @click="fetchWeather">Get GVSU Weather</button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { returnLocation, getWeather } from "../api/WeatherService";

const locationInput = ref("");

const fetchLocations = async () => {
    const locations = await returnLocation(locationInput.value);
    if (locations) {
        console.log("Locations:", locations);
    } else {
        console.log("No locations found");
    }
};

const fetchWeather = async () => {
    const weather = await getWeather("Allendale, Michigan", 3);
    if (weather) {
        console.log("Weather:", weather);
    } else {
        console.log("No weather found");
    }
};
</script>

<style scoped>
.APITest {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    gap: 3rem;

    background-color: rgb(64, 64, 64);
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
}

.console-arrow {
    position: absolute;
    right: 2rem;
    color: rgb(179, 179, 179);
    font-size: 1.5rem;
    font-weight: 500;
}

input {
    border-radius: 1rem;
    border: 3px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 2rem;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    color: white;
    transition: border-color 0.25s;

    margin-right: 3rem;
}

button {
    border-radius: 1rem;
    border: 3px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 2rem;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    color: white;
    cursor: pointer;
    transition: border-color 0.25s;
}

button:hover {
    border-color: #646cff;
}
</style>
