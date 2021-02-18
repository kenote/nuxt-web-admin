import Vue, { VNode } from 'vue'

declare global {

  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    
    interface ElementAttributesProperty {
      $props: any; // 定义要使用的属性名称
    }
    interface IntrinsicElements extends Record<string, any> {}
  }
}