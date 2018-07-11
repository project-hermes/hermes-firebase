<template>
  <main class="container">
    <div
      v-for="dive in diveItem"
      :key="dive.id"
      class="dive-list__item">
      <router-link :to="{name: 'diveDetails', params: {id: dive.id}}">
        <DiveInfoTable
          :dive="dive"
          :props="cardProps"
        />
      </router-link>
    </div>
  </main>
</template>
<script>
import sortBy from 'lodash/sortBy';
import {CardItem, DiveInfoTable} from '~/components';
import {mapActions} from 'vuex';

export default {
    components: {
        CardItem,
        DiveInfoTable
    },
    data() {
        return {
            key: 'DiveList',
            cardProps: {
                Time: 'timeStart',
                Location: 'coordinateStart',
                'Sample Count': 'sampleCount'
            }
        };
    },
    computed: {
        diveItem() {
            const dives = this.$store.getters['dives/localList'](this.key).map(
                dive => {
                    const date = dive.timeStart.toDate();
                    return {
                        ...dive,
                        dateValue: date.valueOf()
                    };
                }
            );

            return sortBy(dives, ({dateValue}) => -dateValue);
        }
    },
    mounted() {
        this.fetchLocalDives({
            key: this.key,
            config: {
                limit: 50
            }
        });
    },
    methods: {
        ...mapActions({
            fetchLocalDives: 'dives/fetchLocalDives'
        })
    }
};
</script>
<style lang="scss" scoped>
.dive-list__item {
    margin: 1rem;

    /deep/ .card-content {
        padding: 0.75rem;
    }
}
</style>
