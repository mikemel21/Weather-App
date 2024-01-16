import { createRouter, createWebHashHistory } from 'vue-router';
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";
import APITest from "./components/APITest.vue";

// Define routes
const myComponentRoutes = [
  { path: "/", component: Login, props: true },
  { path: "/Home", component: Home, props: true },
  { path: "/APITest", component: APITest, props: true},
];

const myRouter = createRouter({
  history: createWebHashHistory(),
  routes: myComponentRoutes,
});
export { myRouter };