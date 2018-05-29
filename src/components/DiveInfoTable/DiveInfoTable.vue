<template>
  <el-card class="dive-info-table">
    <el-table
      :data="analytics"
      style="width: 100%">
      <el-table-column
        prop="prop"
        label="Parameter"
      />
      <el-table-column
        prop="max"
        label="Max"
      />
      <el-table-column
        prop="min"
        label="Min"/>
      <el-table-column
        prop="avg"
        label="Avg"/>
    </el-table>
  </el-card>
</template>

<script>
export default {
    props: {
        analytics: {
            type: Array,
            default: () => []
        },
        info: {
            type: Array,
            default: () => []
        }
    }
};
</script>
<style>
.dive-info-table .cell {
    font-size: 1.15em;
}
</style>
