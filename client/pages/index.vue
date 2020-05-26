<template>
  <page>
    <h1>Home page 🚀</h1>
    <div>
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </div>
    <div>
      <p>
        <client-only>
          <el-radio-group v-model="value" @change="selectChannel">
            <el-radio-button v-for="(item, key) in channels" :key="key" :label="item.id">{{ item.name }}</el-radio-button>
          </el-radio-group>
        </client-only>
      </p>
      <p>name: {{ name }}</p>
      <p>channelId: {{ channelId }}</p>
      <p>{{ JSON.stringify(selectedChannel, null, 2) }}</p>
      <p>
        <client-only>
          <el-input
            type="textarea"
            :rows="12"
            placeholder="请输入内容"
            v-model="channelsJSON">
          </el-input>
        </client-only>
      </p>
    </div>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { Channel } from '@/types/channel'
import { Stote } from '~/store'

const { Setting } = Stote

@Component<R>({
  layout: 'homepage',
  created () {
    this.value = this.channelId
    this.channelsJSON = JSON.stringify(this.channels, null, 2)
  }
})
export default class R extends Vue {

  @Stote.Setting.State 

  @Setting.State name!: string
  @Setting.State channelId!: number
  @Setting.State channels!: Channel.element[]
  @Setting.Getter selectedChannel!: Channel.element
  @Setting.Action selectChannel!: (id: number) => void

  @Provide() value: number = 1
  @Provide() channelsJSON: string = ''

}
</script>