<template>
    <div class="container-fluid min-vh-75 bg-white d-flex flex-column p-3">
        <div class="row p-3">
            <!-- Left Menu -->
            <div class="shadow bg-secondary rounded d-flex justify-content-center flex-grow-1 col">
                <p>test</p>
            </div>

            <!-- Main Screen -->
            <div class="rounded container-fluid ms-3 me-3 d-flex flex-column col-8">
                <!-- Search bar and button container -->
                <div class="d-flex flex-grow-1 justify-content-between pb-3">
                    <div style="width: 75%;">
                        <Search @update-location="fetchWeather" class="shadow rounded" />
                    </div>
                    <div>
                        <button @click="logout" class="btn btn-danger">Log Out</button>
                    </div>
                </div>
                <!-- Weather Info Container -->
                <div class="container-fluid flex-grow-1 d-flex flex-column">
                    <p class="fs-1 font-monospace fw-bold mb-0 pe-3">{{ locationString }}</p>
                    
                    <div class="d-flex flex-row align-items-center">
                        <img class="img-fluid p-2" style="width: 125px; height: 125px;"
                            v-bind:src="locationWeatherCondition?.condition.icon ?? '/not-available-circle.png'"/>
                        <div class="p-2">
                            <p class="fs-2 fw-bold mb-0">{{ locationWeatherCondition?.temp_f ?? 'n/a'}}&deg</p>
                            <p class="fs-4"> {{ locationWeatherCondition?.condition.text ?? 'n/a' }}</p>
                        </div>    
                    </div>

                    <div class="row flex-grow-1 ">
                        <!-- Today's Forecast -->
                        <div class="shadow col-12 bg-secondary rounded mt-5 p-3">
                            <p class="fs-6 text-info fw-bold">Today's Forecast</p>
                            <div class="d-flex justify-content-between">
                                <div class="col text-center border-info position-relative"
                                    v-for="(hour, index) in nextSixHours"
                                    :key="index" :class="{'border-start': index > 0}">
                                    <div class="icon-bar d-flex justify-content-center">
                                        <img style="width:100px; height:100px;" v-bind:src="hour.condition.icon"/>
                                    </div>
                                    <p class="fs-3 mb-1">{{ Math.round(hour.temp_f) }}&deg;</p>
                                    <p class="mt-2 fs-5">{{ new Date(hour.time).getHours() }}:00</p>
                                    <div class="mx-auto" :style="{ height: hour.temp_f + '%' }"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="shadow col-12 bg-secondary rounded mt-3 p-3">
                            <p class="fs-6 text-info fw-bold">Weather Conditions</p>
                            
                            <div class="row p-2">
                                <div class="col text-center bg-primary me-5 rounded">
                                    <p class="fs-5 text-info"><i class="fs-4 text-info bi bi-thermometer-high"></i> Feels Like</p>
                                    <p class="fs-3">{{locationWeatherCondition?.feelslike_f ?? 0}}&deg;</p>
                                </div>
                                <div class="col text-center bg-primary ms-5 rounded">
                                    <p class="fs-5 text-info"><i class="fs-4 text-info bi bi-sun-fill"></i> UV Index</p>
                                    <p class="fs-3">{{ locationWeatherCondition?.uv ?? 0}}</p>
                                </div>
                            </div>

                            <div class="row p-2 mt-3">
                                <div class="col text-center bg-primary me-5 rounded">
                                    <p class="fs-5 text-info"><i class="fs-4 text-info bi bi-droplet"></i> Chance of Rain</p>
                                    <p class="fs-3">{{ locationWeatherCondition?.precip_in ?? 0 }} in.</p>
                                </div>
                                <div class="col text-center bg-primary ms-5 rounded">
                                    <p class="fs-5 text-info"><i class="fs-4 text-info bi bi-water"></i> Humidity</p>
                                    <p class="fs-3">{{ locationWeatherCondition?.humidity ?? 0 }}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2-Day Forecast -->
            <div class="shadow bg-secondary rounded container-fluid d-flex flex-column justify-content-center m-0 col">
                <div class="rounded p-3 flex-grow-1">
                    <p class="fs-6 fw-bold text-info">2-Day Forecast</p>
                        <div class="col justify-content-center">
                            <div
                                class="row d-flex flex-column text-center align-items-center"
                                v-for="(day, index) in locationWeatherDaily"
                                :key="index"
                            >
                                <p class="fs-6">{{ getDayLabel(index) }}</p>
                                <img :src="day.condition.icon" style="width: 125px; height: 100px;" />
                                <p>{{ day.condition.text }}</p>
                                <p>{{ day.maxtemp_f }}&deg; | {{ day.mintemp_f }}&deg;</p>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import myRouter from "../routing";
//import getRouter from "../routing";
import Search from "./Search.vue";
import { getWeather } from "../api/WeatherService";
//import NewsEntry from "./NewsEntry.vue";
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
    limit,
    query,
} from "firebase/firestore";
import { db } from "../main";

//import { selectAllNews } from "../main";

const locationString = ref<string>("Loading...");
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
    //console.log("Location:", location);
    const weather = await getWeather(location, 3);

    if (weather) {
        // console.log("Weather:", weather);
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
    // console.log(locationWeatherDaily.value);
};

const getDayLabel = (offset: number): string => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);

    return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
};

const fetchFavoriteLocation = async (userId: string) => {
    if (!userId) {
        console.error("UserID is undefined or null.");
        return null;
    }

    const favoritesRef = collection(db, 'Users', userId, 'Favorites');

    const q = query(favoritesRef, limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log ("No favorites found for this user.");
        return null;
    }

    const firstFavorite = querySnapshot.docs[0];
    return firstFavorite.data().name;
};


const auth = getAuth();
const user = ref<string>("");
const Coll = ref();

onMounted(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (userAuth: User | null) => {
        if (userAuth) {
            // User is signed in.
            user.value = userAuth.email || "";
            Coll.value = collection(db, "Users", user.value, "Favorites");
            
            readFavorites();
            console.log("Auth changed", userAuth.email);
        
            const favLocation = await fetchFavoriteLocation(user.value);
            if (favLocation) {
                fetchWeather(favLocation);
            } else {
                locationString.value = "No location selected";
                console.log("No favorite location found.")
            }
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

const logout = () => {
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

const nextSixHours = computed(() => {
  // Get current date and time
  const now = new Date();
  const currentHour = now.getHours();
  
  // Find the index for the current hour or next hour
  let startIndex = locationWeatherHourly.value.findIndex((hour) => {
    const hourTime = new Date(hour.time);
    return hourTime.getHours() >= currentHour;
  });
  
  // If not found (might happen at the end of the day), start from the beginning
  if (startIndex === -1) {
    startIndex = 0;
  }

  console.log(startIndex)
  console.log(startIndex+6)
  
  // Return only the next 6 hours
  return locationWeatherHourly.value.slice(startIndex, startIndex + 6);
});

</script>
