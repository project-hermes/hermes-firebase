<template>
  <div class="card">
    <table class="table">
      <thead>
        <th class="dat__label">Parameter</th>
        <th class="dat__label">Min</th>
        <th class="dat__label">Max</th>
        <th class="dat__label">Avg</th>
      </thead>
      <tbody>
        <tr
          v-for="row in analytics"
          :key="row.prop">
          <td class="dat__val">{{ row.prop }}</td>
          <td class="dat__val">{{ row.min }}</td>
          <td class="dat__val">{{ row.max }}</td>
          <td class="dat__val">{{ row.avg }}</td>
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
.table {
    width: 100%;
}
</style>
