<template>
  <div>
      <DiveChooser
        :dives="dives"
      />
  </div>
</template>

<script>
import DiveChooser from '../components/DiveChooser.vue';
import {db} from '../firebase';

export default {
    components: {
        DiveChooser
    },
    data () {
        return {
            dives: []
        };
    },
    mounted () {
        this.getDives();
    },
    methods: {
        getDives () {
            db.collection('Dive').get().then(querySnapshot => {
                const dives = [];
                querySnapshot.forEach(doc => {
                    dives.push({
                        value: doc.id,
                        label: doc.id,
                        data: doc.data()
                    });
                });
                this.dives = dives;
            });
        }
    }
}

</script>
