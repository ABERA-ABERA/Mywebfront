<script setup>

import MyIndex_body from './components/MyIndex/MyIndex_body.vue';
import MyIndex_head from './components/MyIndex/MyIndex_head.vue';


</script>

<template>
  <!-- <MyIndex_head/> -->
    <router-view :key="$route.fullPath"/>
   
  <!-- <div><MyIndex_body/> </div> -->
</template>


<style scoped>
/* 如果需要给 MyIndex_body 加特定类名样式，可以在这里写 */
</style>
