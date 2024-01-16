<template>
    <div class="news-box" @click="openArticle(newsEntry.url)">
        <img :src="newsEntry.image"/>
        <p>{{ newsEntry.title }}</p>
    </div>
</template>
<script setup lang="ts">
type newsProps = {
    image: string;
    title: string;
    url: string;
};
const newsEntry = defineProps<newsProps>();

function openArticle(url: string) {
    console.log(url);
    window.open(url, '_blank', 'noreferrer');
}
</script>
<style>
    .news-box {
        background-color: darkgray;
        border-radius: 4px;
        font-size: 20;
        margin: 10px;
        padding: 5px;
        width: 600;
        height: 600;
        cursor: pointer;
    }
    .news-box img {
        max-width: 300px;
        max-height: 300px;
        border-radius: 4px;
        width: auto;
        height: auto;
        cursor: pointer;
    }
    .news-box:hover {
        box-shadow: 5px 5px 10px rgb(50, 50, 50);   
    }
</style>