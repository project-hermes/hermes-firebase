<template>
  <div>
    <header class="card-header">
      <p class="card-header-title">
        <span class="">Dive</span>&colon;&nbsp;
        <span class="">{{ dive.id }}</span>
      </p>
    </header>
    <div class="card-content">
      <div
        v-for="item in propList"
        :key="item.prop">
        <strong>{{ item.prop }}</strong>&colon;&nbsp;
        <span>{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    props: {
        dive: {
            type: Object,
            default: () => ({})
        },
        propList: {
            type: Array,
            default: () => []
        }
    }
};
</script>
