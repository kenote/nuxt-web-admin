<template>
  <page>
    
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'

@Component<HomePage>({
  middleware: ['homepage']
})
export default class HomePage extends Vue {

}
</script>