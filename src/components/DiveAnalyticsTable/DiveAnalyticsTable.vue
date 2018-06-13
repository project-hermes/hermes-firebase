<template>
  <div class="card">
    <table class="table">
      <thead>
        <th>Parameter</th>
        <th>Min</th>
        <th>Max</th>
        <th>Avg</th>
      </thead>
      <tbody>
        <tr 
          v-for="row in analytics" 
          :key="row.prop">
          <td>{{ row.prop }}</td>
          <td>{{ row.min }}</td>
          <td>{{ row.max }}</td>
          <td>{{ row.avg }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
    props: {
        analytics: {
            type: Array,
            default: () => []
        }
    }
};
</script>
<style scoped>
.dive-info-table .cell {
    font-size: 1.15em;
}

.table {
    width: 100%;
}
</style>
