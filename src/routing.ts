import { createRouter, createWebHashHistory } from 'vue-router';
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";
import APITest from "./components/APITest.vue";

// Define routes
const ComponentRoutes = [
  { path: "/", name: "Login", component: Login, props: true },
  { path: "/Home", name: "Home", component: Home, props: true },
  { path: "/APITest", name: "APITest", component: APITest, props: true},
];

// let router: Router | null = null;

// export function getRouter() {
//   if (!router) {
//     router = createRouter({
//       history: createWebHashHistory(),
//       routes:ComponentRoutes,
//     });
//   }
//   return router;
// }

// export default getRouter();

const myRouter = createRouter({
  history: createWebHashHistory(),
  routes: ComponentRoutes,
});

export default myRouter;
