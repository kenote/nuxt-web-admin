<template>
  <div v-if="content" 
    class="auto-container" 
    v-bind:class="layout" 
    :style="styles" 
    v-html="content"
    />
  <div v-else class="auto-container" v-bind:class="layout" :style="styles">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { isString, merge, assign, isPlainObject, keys, values, camelCase, zipObject } from 'lodash'

@Component<WebContainer>({
  name: 'web-container',
  created () {
    let styles = this.styles
    if (this.width) {
      styles = assign(styles, { width: this.width  })
    }
    if (this.minWidth) {
      styles = assign(styles, { minWidth: this.minWidth })
    }
    if (this.maxWidth) {
      styles = assign(styles, { maxWidth: this.maxWidth })
    }
    if (this.height) {
      styles = assign(styles, { height: this.height })
    }
    if (this.minHeight) {
      styles = assign(styles, { minHeight: this.minHeight })
    }
    if (this.maxHeight) {
      styles = assign(styles, { maxHeight: this.maxHeight })
    }
    if (this.margin) {
      styles = assign(styles, { margin: this.margin })
    }
    if (this.padding) {
      styles = assign(styles, { padding: this.padding })
    }
    if (this.justifyContent) {
      styles = assign(styles, { justifyContent: this.justifyContent })
    }
    if (this.alignItems) {
      styles = assign(styles, { alignItems: this.alignItems })
    }
    if (this.background) {
      let background = {}
      if (isString(this.background)) {
        background = { background: this.background }
      }
      if (isPlainObject(this.background)) {
        background = zipObject(keys(this.background).map( v => camelCase(`background ${v}`) ), values(this.background))
      }
      styles = assign(styles, background)
    }
    if (this.border) {
      let border = {}
      if (isString(this.border)) {
        border = { border: this.border }
      }
      if (isPlainObject(this.border)) {
        border = zipObject(keys(this.border).map( v => camelCase(`border ${v}`) ), values(this.border))
      }
      styles = assign(styles, border)
    }
    if (this.flex) {
      let flex = {}
      if (isString(this.flex)) {
        flex = { flex: this.flex }
      }
      if (isPlainObject(this.flex)) {
        flex = zipObject(keys(this.flex).map( v => camelCase(`flex ${v}`) ), values(this.flex))
      }
      styles = assign(styles, flex)
    }
    this.styles = styles
  }
})
export default class WebContainer extends Vue {
  
  @Prop({ default: 'vertical' })
  layout!: string

  @Prop({ default: undefined })
  width!: string

  @Prop({ default: undefined })
  minWidth!: string

  @Prop({ default: undefined })
  maxWidth!: string

  @Prop({ default: undefined })
  height!: string

  @Prop({ default: undefined })
  minHeight!: string

  @Prop({ default: undefined })
  maxHeight!: string

  @Prop({ default: undefined })
  margin!: string

  @Prop({ default: undefined })
  padding!: string

  @Prop({ default: undefined })
  background!: string | Record<'color' | 'image' | 'repeat' | 'attachment' | 'position' | 'size' | 'clip' | 'origin', string>

  @Prop({ default: undefined })
  border!: string | Record<string, string>

  @Prop({ default: undefined })
  justifyContent!: string

  @Prop({ default: undefined })
  alignItems!: string

  @Prop({ default: undefined })
  flex!: string | Record<string, string>

  @Prop({ default: undefined })
  content!: string

  @Provide()
  styles: Record<string, any> = {}
}
</script>