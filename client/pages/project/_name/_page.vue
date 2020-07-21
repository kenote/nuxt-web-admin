<template>
  <dashboard-page v-loading="initinal">

    <!-- 查询器 -->
    <dashboard-queryer 
      :default-values="{}"
      :rules="{
        
      }"
      :columns="oc(pageSetting).queryer([])"
      @get-data="handleGetData"
      @get-plans="handleGetPlans"
      @create-plan="handleCreatePlan"
      @update-plan="handleUpdatePlan"
      @remove-plan="handleRemovePlan"
      :loading="loading" />
  </dashboard-page>
</template>

<script lang="ts">
import { Component, Vue, mixins, Provide, Watch } from 'nuxt-property-decorator'
import PageMixin from '~/mixins/page'
import * as api from '~/api'
import { Channel } from '@/types/channel'
import { Maps } from 'kenote-config-helper'
import { parseProps } from '@/utils'
import { ResponsePlanDocument, CreatePlanDocument, PlanType, EditPlanDocument } from '@/types/proxys/plan'
import * as yaml from 'js-yaml'
import { UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'

@Component<ProjectPage>({
  name: 'project-page',
  layout: 'dashboard',
  middleware: ['authenticated'],
})
export default class ProjectPage extends mixins(PageMixin) {
  



  handleGetData (fetch: Channel.api, next: (data: Maps<any>[]) => void): void {
    fetch.options = this.httpOptions
    setTimeout(async () => {
      try {
        let result = await api.getData(fetch)
        if (result.error === 0) {
          let data = result.data.map( o => parseProps(o, fetch.props))
          next(data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGetPlans (type: string, next: (data: ResponsePlanDocument[]) => void): void {
    setTimeout(async () => {
      try {
        let result = await api.planList(type, this.selectedChannel.label, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleCreatePlan (type: PlanType, name: string, value: any, next: (data: ResponsePlanDocument[]) => void): void {
    let data: CreatePlanDocument = {
      type,
      name,
      content: yaml.dump(value),
      channel: this.selectedChannel.label
    }
    setTimeout(async () => {
      try {
        let result = await api.createPlan(data, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleUpdatePlan (_id: string, name: string, value: any, next: (data: UpdateWriteResult) => void): void {
    let data: EditPlanDocument = {
      name,
      content: yaml.dump(value)
    }
    setTimeout(async () => {
      try {
        let result = await api.editPlan(_id, data, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
          next({ n: 0, nModified: 0, ok: 0 })
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleRemovePlan (_id: string, next: (data: DeleteWriteResult) => void): void {
    setTimeout(async () => {
      try {
        let result = await api.removePlan(_id, this.httpOptions)
        if (result.error === 0) {
          next(result.data)
        }
        else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
}
</script>