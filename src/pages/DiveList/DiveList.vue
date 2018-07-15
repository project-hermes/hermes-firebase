<template>
  <div
    v-loading="isLoading"
    class="dive-list container">
    <div
      v-for="dive in diveItems"
      :key="dive.id"
      class="dive-list__item">
      <router-link :to="{name: 'diveDetails', params: {id: dive.id}}">
        <DiveInfoTable
          :dive="dive"
          :props="cardProps"
        />
      </router-link>
    </div>
  </div>
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
            },
            isLoading: true
        };
    },
    computed: {
        diveItems() {
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
        this.isLoading = this.diveItems.length === 0;
        this.fetchLocalDives({
            key: this.key,
            config: {
                limit: 50
            }
        }).then(() => {
            this.isLoading = false;
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
.dive-list {
    height: 100%;
}

.dive-list__item {
    margin: 1rem;

    /deep/ .card-content {
        padding: 0.75rem;
    }
}
</style>
