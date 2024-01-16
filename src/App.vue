<script setup lang="ts">
// import APITest from './components/APITest.vue';
// import Home from './components/Home.vue';
</script>

<template>
    <div id="app-area">
        <main>
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </main>
    </div>
</template>

<style scoped>
#app-area {
    height: 100vh;
    background-color: rgb(64, 64, 64);
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
}
</style>
