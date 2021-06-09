<template>
  <div class="security-container">

    <!--  -->
    <div class="main-content">
      <slot></slot>
      <!-- <div class="footer">
        <slot name="footer"></slot>
      </div> -->
    </div>

    <div v-if="isClose" class="close_content">
      <i class="el-icon-close" @click="close" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'nuxt-property-decorator'

@Component<SecurityView>({
  name: 'security-view'
})
export default class SecurityView extends Vue {
  
  @Prop({ default: false })
  loading!: boolean

  @Prop({ default: false })
  isClose!: boolean

  @Emit('close')
  close () {}
}
</script>