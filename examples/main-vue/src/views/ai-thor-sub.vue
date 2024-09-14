<template>
  <!--单例模式，name相同则复用一个无界实例，改变url则子应用重新渲染实例到对应路由 -->
  <WujieVue width="100%" height="100%" name="ai-thor" :url="viteUrl"></WujieVue>
</template>

<script>
import hostMap from "../hostMap";

export default {
  computed: {
    viteUrl() {
      // console.log(hostMap("//localhost:5173/") + this.$route.params.path);
      console.log(this.$route);
      // return hostMap("//llm-center-admin.ceshiservice.cn/") + this.$route.params.path;
      return hostMap("//localhost:5173/") + this.$route.params.path;
    },
  },
};
</script>

<style lang="scss" scoped></style>
