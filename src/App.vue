<template>
  <div id="app">
    <Roster />
  </div>
</template>

<script>
import Roster from "./components/Roster.vue"

export default {
  name: "App",
  components: {
    Roster,
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
