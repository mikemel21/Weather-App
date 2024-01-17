<template>
    <div class="home-view">
        <header class="head">
            <img class="logo" src="./weatherbroslogo.png" />

            <Search @update-location="fetchWeather" />

            <button class="button" @click="outtaHere">Logout</button>
        </header>
        <main class="main">
            <div class="favorited-locations">
                <p>Favorite Locations</p>
                <ul>
                    <li
                        v-for="loc in favoriteLocations"
                        class="fav-locations"
                        @click="fetchWeather(loc.id)"
                    >
                        {{ loc.id }}
                    </li>
                </ul>
            </div>

            <div class="information">
                <div class="info-head">
                    <img v-if="checkStar" src="./star-fill.svg" @click="updateFavorites" />
                    <img v-else src="./star-hollow.svg" @click="updateFavorites" />
                    <!-- <img :src="starImage" @click="updateFavorites" /> -->

                    <p class="loc-text">{{ locationString }}</p>
                </div>
                <img
                    class="weather-icon"
                    v-bind:src="
                        locationWeatherCondition?.condition.icon ??
                        'src/components/not-available-circle.png'
                    "
                />
                <p class="condition-text">
                    {{ locationWeatherCondition?.condition.text }}
                </p>
                <p class="temp">{{ locationWeatherCondition?.temp_f }}&deg</p>

                <div class="details">
                    <div class="section">
                        <p class="info-header">Current Forecast</p>
                        <div class="data">
                            <p>
                                Feels Like<br />{{
                                    locationWeatherCondition?.feelslike_f
                                }}&deg;
                            </p>
                            <p>
                                Humidity<br />
                                {{ locationWeatherCondition?.humidity }}%
                            </p>
                            <p>
                                Precipitation<br />
                                {{ locationWeatherCondition?.precip_in }} in
                            </p>
                            <p>
                                Wind<br />
                                {{ locationWeatherCondition?.gust_mph }} mph
                            </p>
                            <p>
                                Wind Direction<br />
                                {{ locationWeatherCondition?.wind_dir }}
                            </p>
                            <p>
                                UV<br />
                                {{ locationWeatherCondition?.uv }}
                            </p>
                        </div>
                    </div>
                    <div class="section">
                        <p class="info-header">Today's Forecast</p>

                        <div class="hourly-rows">
                            <div
                                v-for="(hour, index) in locationWeatherHourly"
                                :key="index"
                            >
                                <p>{{ Math.round(hour.temp_f) }}&deg</p>
                                <div class="icon-bar">
                                    <img
                                        class="weather-icon"
                                        v-bind:src="hour.condition.icon"
                                    />
                                </div>
                                <div
                                    class="temp-bar"
                                    :style="{ height: hour.temp_f + '%' }"
                                ></div>
                            </div>
                        </div>

                        <table class="hourly-table">
                            <tr>
                                <th>Time</th>
                                <th>Temp</th>
                                <th>Feels Like</th>
                                <th>Condition</th>
                                <th>Wind Speed</th>
                                <th>Wind Gusts</th>
                                <th>Humidity</th>
                                <th>UV</th>
                            </tr>
                            <tr
                                v-for="(hour, index) in locationWeatherHourly"
                                :key="index"
                            >
                                <td>
                                    {{ (index % 12) + 1
                                    }}{{ index < 12 ? " am" : " pm" }}
                                </td>
                                <td>{{ hour.temp_f }}&deg</td>
                                <td>{{ hour.feelslike_f }}&deg</td>
                                <td>
                                    {{ hour.condition.text }}
                                </td>
                                <td>{{ hour.wind_mph }} mph</td>
                                <td>{{ hour.gust_mph }} mph</td>
                                <td>{{ hour.humidity }}%</td>
                                <td>{{ hour.uv }}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="section">
                        <p class="info-header">Upcoming Forecast</p>

                        <div class="day-rows">
                            <div
                                v-for="(day, index) in locationWeatherDaily"
                                :key="index"
                            >
                                <div class="day-rows-container">
                                    <p>{{ Math.round(day.mintemp_f) }}&deg</p>

                                    <div
                                        class="temp-bar"
                                        :style="{ height: day.mintemp_f + '%' }"
                                    ></div>
                                </div>
                                <div class="day-rows-container">
                                    <p>{{ Math.round(day.maxtemp_f) }}&deg</p>

                                    <div
                                        class="temp-bar"
                                        :style="{ height: day.maxtemp_f + '%' }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <table class="day-table">
                            <tr>
                                <th>Day</th>
                                <th>Max Temp</th>
                                <th>Min Temp</th>
                                <th>Condition</th>
                                <th>Wind Speed</th>
                                <th>Max Wind</th>
                            </tr>
                            <tr
                                v-for="(day, index) in locationWeatherDaily"
                                :key="index"
                            >
                                <td>
                                    {{ getDate(index) }}
                                </td>
                                <td>{{ day.maxtemp_f }}&deg</td>
                                <td>{{ day.mintemp_f }}&deg</td>
                                <td>
                                    {{ day.condition.text }}
                                </td>
                                <td>{{ day.maxwind_mph }} mph</td>
                                <td>{{ day.maxwind_mph }} mph</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <div class="events">
                <p>Events</p>
                <div class="News-tabs" v-for="n in news">
                    <NewsEntry
                        :image="n.image"
                        :title="n.title"
                        :url="n.url"
                    />

                </div>
            </div>
        </main>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { myRouter } from "../routing";
import Search from "./Search.vue";
import { getWeather } from "../api/WeatherService";
import NewsEntry from "./NewsEntry.vue";
import {
    getAuth,
    onAuthStateChanged,
    User,
    signOut,
} from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
    getDocs,
    DocumentData,
    QuerySnapshot,
CollectionReference,
QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../main";
//import { selectAllNews } from "../main";

const locationString = ref<string>("No location selected");
const locationWeatherCondition = ref<weatherCondition>();
const locationWeatherHourly = ref<weatherHourlyForecast[]>([]);
const locationWeatherDaily = ref<weatherDailyForcast[]>([]);
const starImage = ref<string>("src/assets/star-hollow.svg");

type newsType = {
    image: string;
    title: string;
    url: string;
}

const news = ref<newsType[]>([]);

const getAllNews = () => {
    const newsColl:CollectionReference = collection(db, "News");
    getDocs(newsColl).then((qs: QuerySnapshot) => {
        qs.forEach((qd: QueryDocumentSnapshot) => {
            news.value.push(qd.data() as newsType);
        });
    });
}

interface Location {
    id: string
};
const favoriteLocations = ref<Location[]>([]);
const checkStar = computed(() => {
    return favoriteLocations.value.some(location => location.id === locationString.value);
});

const fetchWeather = async (location: string) => {
    console.log("Location:", location);
    const weather = await getWeather(location, 3);

    if (weather) {
        console.log("Weather:", weather);
    } else {
        console.log("No weather found");
    }

    locationString.value = location;
    locationWeatherCondition.value = { ...weather.current };

    let hourData = weather.forecast.forecastday[0].hour;
    let dayData = weather.forecast.forecastday;

    locationWeatherHourly.value = hourData.map(
        (hour: weatherHourlyForecast) => hour
    );
    locationWeatherDaily.value = dayData.map((day: any) => day.day);
    console.log(locationWeatherDaily.value);
};

const fetchRandomLocation = async () => {
    const popularLocationsRef = collection(db, "Popular");
    const querySnapshot = await getDocs(popularLocationsRef);
    const locations: any = [];

    querySnapshot.forEach((doc) => {
        locations.push(doc.data().name);
    });

    const randomIndex = Math.floor(Math.random() * locations.length);
    return locations[randomIndex];
};

onMounted(async () => {
    const randomLocation = await fetchRandomLocation();
    if (randomLocation) {
        fetchWeather(randomLocation);
        getAllNews();
    }
});

const auth = getAuth();
const user = ref<string>("");
const Coll = ref();

onMounted(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (userAuth: User | null) => {
    if (userAuth) {
      // User is signed in.
      user.value = userAuth.email || "";
      Coll.value = collection(db, "Users", user.value, "Favorites");
      readFavorites();
      console.log("Auth changed", userAuth.email);
    } else {
      // No user is signed in.
      console.log("User is signed out.");
    }
  });

  // Clean up the auth listener when the component is unmounted
  onBeforeUnmount(() => {
    unsubscribeAuth();
  });
});

const readFavorites = () => {
  const unsubscribeSnapshot = onSnapshot(Coll.value, (querySnapshot: QuerySnapshot<DocumentData>) => {
    favoriteLocations.value = [];
    querySnapshot.forEach((doc) => {
        favoriteLocations.value.push({ id: doc.id, ...doc.data() });
    });
  });

  // Clean up the snapshot listener when the component is unmounted
  onBeforeUnmount(() => {
    unsubscribeSnapshot();
  });
};

const outtaHere = () => {
    if (auth) signOut(auth);
    myRouter.push({ path: "./" });
};

const getDate = (index: number) => {
    const today = new Date();
    today.setDate(today.getDate() + index);

    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const dayOfWeek = daysOfWeek[today.getDay()];

    return dayOfWeek;
};

type weatherCondition = {
    cloud: number;
    condition: { text: string; icon: string; code: number };
    feelslike_c: number;
    feelslike_f: number;
    gust_kph: number;
    gust_mph: number;
    humidity: number;
    is_day: number;
    last_updated: string;
    last_updated_epoch: number;
    precip_in: number;
    precip_mm: number;
    pressure_in: number;
    pressure_mb: number;
    temp_c: number;
    temp_f: number;
    uv: number;
    vis_km: number;
    vis_miles: number;
    wind_degree: number;
    wind_dir: string;
    wind_kph: number;
    wind_mph: number;
};

type weatherHourlyForecast = {
    chance_of_rain: number;
    chance_of_snow: number;
    cloud: number;
    condition: {
        code: number;
        icon: string;
        text: string;
    };
    dewpoint_c: number;
    dewpoint_f: number;
    feelslike_c: number;
    feelslike_f: number;
    gust_kph: number;
    gust_mph: number;
    heatindex_c: number;
    heatindex_f: number;
    humidity: number;
    is_day: number;
    precip_in: number;
    precip_mm: number;
    pressure_in: number;
    pressure_mb: number;
    temp_c: number;
    temp_f: number;
    time: string;
    time_epoch: number;
    uv: number;
    vis_km: number;
    vis_miles: number;
    will_it_rain: number;
    will_it_snow: number;
    wind_degree: number;
    wind_dir: string;
    wind_kph: number;
    wind_mph: number;
    windchill_c: number;
    windchill_f: number;
};

type weatherDailyForcast = {
    avghumidity: number;
    avgtemp_c: number;
    avgtemp_f: number;
    avgvis_km: number;
    avgvis_miles: number;
    condition: {
        code: number;
        icon: string;
        text: string;
    };
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
    daily_will_it_rain: number;
    daily_will_it_snow: number;
    maxtemp_c: number;
    maxtemp_f: number;
    maxwind_kph: number;
    maxwind_mph: number;
    mintemp_c: number;
    mintemp_f: number;
    totalprecip_in: number;
    totalprecip_mm: number;
    totalsnow_cm: number;
    uv: number;
};

const updateFavorites = () => {
    const user: string = getAuth().currentUser?.email || "";
    const favDoc = doc(db, "Users", user, "Favorites", locationString.value);
    if (starImage.value == "src/assets/star-fill.svg") {
        if (locationString.value != "No location selected") {
            const delDoc = doc(
                db,
                "Users",
                user,
                "Favorites",
                locationString.value
            );
            starImage.value = "src/assets/star-hollow.svg";
            deleteDoc(delDoc);
        } else {
            console.log("You must choose a location before favoriting.");
        }
    } else {
        setDoc(favDoc, { name: locationString.value });
        starImage.value = "src/assets/star-fill.svg";
    }
};
    
</script>
<style scoped>
.news-tabs {
    display: flex;
    flex-direction: column;
}
.home-view {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 50px;
    padding: 10px;
    background-image: linear-gradient(#b8dbd9, #586f7c);
    min-height: 100vh;
}
.head {
    position: sticky;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    padding-bottom: 30px;
    z-index: 1000000;
}

.logo {
    text-align: left;
    width: 125px;
    height: 125px;
    padding: 5px 5px;
}

.acct-pic {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 10px;
    align-self: center;
    cursor: pointer;
}

.button {
    background-color: #e5e8e9;
    font-size: large;
    width: 70px;
    height: 50px;
    cursor: pointer;
    margin-right: 80px;
}

.main {
    display: grid;
    width: 100%;
    gap: 1em;
    padding-left: 2px;
    padding-right: 2px;
    grid-template-columns: 1fr 4fr 1fr;
}

.information,
.events,
.favorited-locations {
    color: white;
    position: sticky;
    border-radius: 1rem;
    border: 3px solid transparent;
    padding: 0.6em 1.2em;
    background-color: #586f7c;
    display: block;
    height: auto;
    padding: 5px;
    margin-top: 0px;
    text-align: center;
}

.events ul {
    color: white;
    justify-content: start;
    font-size: 20px;
}

.favorited-locations p,
.events p {
    font-size: 30px;
    text-decoration: underline;
}

.fav-locations {
    font-family: inherit;
    font-size: 20px;
    background-color: #465b68;
    border-radius: 4px;
    margin: 10px;
    cursor: pointer;
}

.fav-locations:hover {
    box-shadow: 5px 5px 10px rgb(50, 50, 50);
    /* box-shadow: 0 0 20px rgb(64, 64, 64); */
}
.info-head {
    display: flex;
    justify-content: center;
}
.info-head img {
    cursor: pointer;
}
.loc-text {
    font-size: 50px;
}

.temp {
    font-size: 80px;
}

.weather-icon {
    width: 100px;
    height: 100px;
}

.details {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: 95%;
}
.section {
    border-radius: 4px;
    background-color: #586f7c;
    width: 100%;
    height: auto;
    padding: 5px;
    margin: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.section:first-child {
    margin-top: 2rem;
}
.info-header {
    grid-area: "header";
    font-size: 20px;
    font-weight: bolder;
    margin-bottom: 5px;
    grid-column-start: 1;
}
.data p {
    margin: 10px;
}
.data {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    justify-content: center;
}

.hourly-rows {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200px;
    padding: 10px;
    border-radius: 5px;
    margin-top: 1.5rem;
    width: 95%;
}

.hourly-rows > div {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
}

.temp-bar {
    width: 70%;
    background-color: #3498db;
}

.hourly-rows p {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.33rem;
}

.hourly-table {
    width: 95%;
    border-collapse: collapse;
    text-align: left;
}

.hourly-table tr {
    text-align: center;
    vertical-align: middle;
}

.hourly-table th,
.hourly-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
}

.hourly-table th {
    font-weight: bold;
}

.hourly-table tr:nth-child(even) {
    background-color: rgba(131, 60, 60, 0.15);
}

.hourly-table img {
    height: 1.5rem;
}

.day-rows {
    display: flex;
    align-items: flex-end;
    height: 200px;
    padding: 10px;
    border-radius: 5px;
    margin-top: 1.5rem;
    width: 95%;
}

.day-rows > div {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
}

.day-rows-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
}

.day-rows-container:last-child .temp-bar {
    background-color: #e5b666;
}

.temp-bar {
    width: 70%;
    background-color: #3498db;
}

.day-rows p {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.33rem;
}

.day-table {
    width: 95%;
    border-collapse: collapse;
    text-align: left;
}

.day-table tr {
    text-align: center;
    vertical-align: middle;
}

.day-table th,
.day-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
}

.day-table th {
    font-weight: bold;
}

.day-table tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.15);
}

.day-table img {
    height: 1.5rem;
}

.icon-bar > img {
    width: 70%;
    height: auto;
}
</style>
