<template>
    <div class="d-flex align-content-center input-group input-group position-relative w-25">
        <input class="bg-secondary p-1 w-100 border-0 rounded" aria-describedby="inputGroup-sizing-default"
            placeholder="Enter Location..."
            type="text"
            v-model="locationInput"
            @keyup.enter="handleLocationEnter()"
            @input="fetchLocations"
        />
        <ul v-if="locationSuggestions.length" class="list-group border m-1 rounded">
            <button v-for="location in locationSuggestions" @click="handleLocationClick(location)" 
                class="list-group-item list-group-item-action">
                {{ location.name }}, {{ location.region }}
            </button>
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
