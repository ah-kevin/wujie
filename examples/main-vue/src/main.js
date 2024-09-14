import "whatwg-fetch"; // fetch polyfill
import "custom-event-polyfill";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import WujieVue from "wujie-vue2";
import hostMap from "./hostMap";
import credentialsFetch from "./fetch";
import Switch from "ant-design-vue/es/switch";
import Tooltip from "ant-design-vue/es/tooltip";
import button from "ant-design-vue/es/button/index";
import Icon from "ant-design-vue/es/icon/index";
import "ant-design-vue/es/button/style/index.css";
import "ant-design-vue/es/style/index.css";
import "ant-design-vue/es/switch/style/index.css";
import "ant-design-vue/es/tooltip/style/index.css";
import "ant-design-vue/es/icon/style/index.css";
import lifecycles from "./lifecycle";

const isProduction = process.env.NODE_ENV === "production";
const { setupApp, preloadApp, bus } = WujieVue;
Vue.use(WujieVue).use(Switch).use(Tooltip).use(button).use(Icon);

Vue.config.productionTip = false;

bus.$on("click", (msg) => window.alert(msg));

// 在 xxx-sub 路由下子应用将激活路由同步给主应用，主应用跳转对应路由高亮菜单栏
bus.$on("sub-route-change", (name, path) => {
  const mainName = `${name}-sub`;
  const mainPath = `/${name}-sub${path}`;
  const currentName = router.currentRoute.name;
  const currentPath = router.currentRoute.path;
  // console.table({ mainName, mainPath, currentName, currentPath });
  if (mainName === currentName && mainPath !== currentPath) {
    router.push({ path: mainPath });
  }
});

const degrade = window.localStorage.getItem("degrade") === "true" || !window.Proxy || !window.CustomElementRegistry;
const props = {
  jump: (name) => {
    router.push({ name });
  },
};
/**
 * 大部分业务无需设置 attrs
 * 此处修正 iframe 的 src，是防止github pages csp报错
 * 因为默认是只有 host+port，没有携带路径
 */
const attrs = isProduction ? { src: hostMap("//localhost:8000/") } : {};
/**
 * 配置应用，主要是设置默认配置
 * preloadApp、startApp的配置会基于这个配置做覆盖
 */

setupApp({
  name: "vite",
  url: hostMap("//localhost:7500/"),
  attrs,
  exec: true,
  plugins: [
    {
      patchElementHook(element, iframeWindow) {
        if (element.nodeName === "STYLE") {
          element.insertAdjacentElement = function (_position, ele) {
            iframeWindow.document.head.appendChild(ele);
          };
        }
      },
    },
  ],
  props,
  fetch: credentialsFetch,
  degrade,
  ...lifecycles,
});

setupApp({
  name: "ai-thor",
  url: hostMap("//llm-center-admin.ceshiservice.cn/"),
  // url: hostMap("//localhost:5173/"),
  attrs,
  exec: true,
  props,
  plugins: [
    {
      patchElementHook(element, iframeWindow) {
        if (element.nodeName === "STYLE") {
          element.insertAdjacentElement = function (_position, ele) {
            iframeWindow.document.head.appendChild(ele);
          };
        }
      },
    },
  ],
  fetch: credentialsFetch,
  degrade,
  ...lifecycles,
});
if (window.localStorage.getItem("preload") !== "false") {
  if (window.Proxy) {
    preloadApp({
      name: "ai-thor",
    });
    preloadApp({
      name: "vite",
    });
  }
}

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
