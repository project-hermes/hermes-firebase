<template>
  <div class="card">
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
    <div class="card-footer">
      <slot name="footer" />
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
        props: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        propList() {
            if (Object.keys(this.props).length > 0) {
                return Object.entries(this.props).map(([renamedProp, prop]) => {
                    const value = this.dive[prop];
                    const propObject = this.buildProp(prop, value);
                    propObject.prop = renamedProp;
                    return propObject;
                });
            } else {
                return Object.entries(this.dive).map(([prop, value]) => {
                    return this.buildProp(prop, value);
                });
            }
        }
    },
    methods: {
        buildProp(prop, value) {
            switch (prop) {
                case 'coordinateEnd':
                case 'coordinateStart':
                    return {
                        prop,
                        value: `[${value.latitude}, ${value.longitude}]`
                    };
                case 'createdAt':
                case 'lastUpdatedAt':
                    return {
                        prop,
                        value: new Date(value).toLocaleString()
                    };
                case 'timeEnd':
                case 'timeStart':
                    return {
                        prop,
                        value: value.toDate().toLocaleString()
                    };
                default:
                    return {
                        prop,
                        value
                    };
            }
        }
    }
};
</script>
