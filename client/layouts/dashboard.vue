<template>
  <client-only placeholder="Page Loading...">
    <div class="warpper">
      <header>
        <div class="header-start">
          <div class="header-link-box">
            <a class="header-link header-link-icon" @click="handleCollapse">
              <i class="iconfont" v-bind:class="collapse ? 'icon-menu-fold' : 'icon-menu-unfold'"></i>
            </a>
          </div>
          <div class="header-link-box">
            <nuxt-link class="header-link logo" to="/dashboard">
              <img src="/images/logo.png" />
            </nuxt-link>
          </div>
        </div>
        <div class="header-end">
          <navmenu
            classname="header-link"
            :data="dashboard.navmenu"
            @command="handleCommand" >
            <div class="header-link-box" slot="prefix">
              <search-bar v-model="search" placeholder="搜索控制台" />
            </div>
            <authpanel slot="suffix" :options="dashboard.authpanel" @command="handleCommand" />
          </navmenu>
        </div>
      </header>

      <div class="bodyer">
        <div class="sidebar-nav">
          
        </div>
        <div class="page-main">

        </div>
      </div>
    </div>
  </client-only>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import BaseMixin from '~/mixins/base'
import '~/assets/scss/dashboard/warpper.scss'
import { parseProps } from '@/utils'
import { Store } from '~/store'
import { NavMenu } from '@/types/client'

@Component<DashboardLayout>({
  name: 'dashboard-layout',
  mounted () {
    document.body.className = 'dashboard-body'

    
  }
})
export default class DashboardLayout extends mixins(BaseMixin) {

  @Store.Setting.State 
  dashboard!: NavMenu.Configure

  @Provide()
  collapse: boolean = false

  @Provide()
  visible: boolean = false

  @Provide()
  search: string = ''

  handleVisible (visible: boolean) {
    this.visible = visible
  }

  handleCollapse () {
    this.collapse = !this.collapse
  }
  
}
</script>