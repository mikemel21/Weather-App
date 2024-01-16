<template>
    <div class="search-container">
        <input
            placeholder="Enter Location..."
            type="text"
            class="search-input"
            v-model="locationInput"
            @keyup.enter="handleLocationEnter()"
            @input="fetchLocations"
        />
        <ul v-if="locationSuggestions.length" class="location-dropdown">
            <li
                v-for="location in locationSuggestions"
                @click="handleLocationClick(location)"
            >
                {{ location.name }}, {{ location.region }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { returnLocation } from "../api/WeatherService";

interface Location {
    name: string;
    region: string;
}

const locationInput = ref<string>("");
const locationSuggestions = ref<Location[]>([]);
const emit = defineEmits(["update-location"]);

const fetchLocations = async () => {
    if (locationInput.value) {
        const locations = await returnLocation(locationInput.value);
        if (locations) {
            locationSuggestions.value = locations;
        } else {
            locationSuggestions.value = [];
        }
    }
};

const handleLocationClick = (locationSelection: Location) => {
    const location = locationSelection.name + ", " + locationSelection.region;
    locationInput.value = "";
    locationSuggestions.value = [];

    emit("update-location", location);
};

const handleLocationEnter = () => {
    const location = locationSuggestions.value[0].name;
    locationInput.value = "";
    locationSuggestions.value = [];

    emit("update-location", location);
};
</script>
<style scoped>
.search-container {
    position: relative;
    width: 443.6px;
    align-self: center;
    display: flex;
    flex-direction: column;
}

.search-input {
    box-sizing: border-box;
    padding: 1rem;
    width: 100%;
    height: 56.8px;
    border-radius: 1rem;
    border: none;
    font-size: 2rem;
    font-weight: 300;
    font-family: inherit;
    background-color: #465b68;
    color: white;
}

.location-dropdown {
    width: 100%;
    border-radius: 1rem;
    top: 100%;
    margin-top: 1rem;
    position: absolute;
    background-color: #1a1a1a;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
}

.location-dropdown li {
    padding: 1rem;
    font-size: 2rem;
    font-weight: 300;
    font-family: inherit;
    cursor: pointer;
    color: white;
}
</style>
