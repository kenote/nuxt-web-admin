<template>
  <div>
    <div @click="handleOpenDialog">
      <el-avatar icon="el-icon-user-solid" :src="getUrl(value || defaultAvatar)"></el-avatar>
    </div>
    <el-dialog
      title="上传头像"
      :visible="visible"
      @close="handleCloseDialog"
      >
      <div v-if="imgsrc" class="cropper-wrapper">
        <div class="cropper-box">
          <div class="cropper-box-view">
            <dashboard-cropper ref="cropper"
              :src="imgsrc"
              :container-style="{ height: '200px' }"
              :cropper-options="{
                viewMode: 1,
                minCropBoxWidth: 120,
                minCropBoxHeight: 120,
                autoCropArea: .8,
                /* preview: '.preview' */
              }"
              />
          </div>
          <!-- <div class="cropper-box-preview">
            <div class="preview" />
          </div> -->
        </div>
        <div class="upload-loading-progress">
          <el-progress :show-text="false" :percentage="percentage" status="success"></el-progress>
        </div>
      </div>
      <el-upload v-else
        class="upload-files"
        action="/upload"
        accept=".png,.jpg,.jpeg"
        :http-request="handleHttpRequest"
        :show-file-list="false"
        drag >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          <p>将文件拖到此处，或<em>点击上传</em></p>
        </div>
        <!-- <div class="el-upload__text" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
      </el-upload>
      <span slot="footer" class="dialog-footer" >
        <dashboard-file-picker v-if="imgsrc"
          button-style="float:left;"
          accept=".png,.jpg,.jpeg"
          @change="handleFileChange"
          />
        <el-button @click="visible = false">取消</el-button>
        <el-button v-if="imgsrc" type="primary" style="width:auto;" @click="handleUploadFile">上传</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Model, mixins, Watch } from 'nuxt-property-decorator'
import { HttpRequestOptions } from 'element-ui/types/upload'
import { VueCropperMethods } from 'vue-cropperjs'
import ComponentMixin from '~/mixins/component'
import { HeaderOptions } from '@/utils/http'
import { ProxyResult } from 'kenote-store-helper'
import { Channel } from '@/types/channel'
import { oc } from 'ts-optchain'
import * as auth from '~/store/modules/auth'
import { getUrl } from '@/utils/format'

@Component<DashboardAvatarPicker>({
  name: 'dashboard-avatar-picker',
})
export default class DashboardAvatarPicker extends mixins(ComponentMixin) {

  @Prop({ default: undefined }) options!: Channel.avatarOptions
  
  @Provide() visible: boolean = false
  @Provide() imgsrc: string = ''
  @Provide() percentage: number = 0
  @Provide() avatarSrc: string = ''

  @Model('update') readonly value!: string

  getUrl = getUrl

  handleOpenDialog (): void {
    this.visible = true
  }

  async handleHttpRequest (httpRequest: HttpRequestOptions | { file: File }): Promise<void> {
    let { file } = httpRequest
    try {
      this.imgsrc = await readImageFile(file)
    } catch (error) {
      this.$message.error(error)
    }
  }

  async handleFileChange (filelist: File[]): Promise<void> {
    let [ file ] = filelist
    try {
      let imgsrc = await readImageFile(file)
      this.imgsrc = imgsrc
      let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
      if (cropper) {
        cropper.replace(imgsrc)
      }
    } catch (error) {
      this.$message.error(error)
    }
  }

  async handleUploadFile (): Promise<void> {
    let cropper = this.$refs['cropper'] as unknown as VueCropperMethods
    let { url, type, quality, width, height, filename } = oc(this.options)({
      url: '/upload/avatar',
      type: 'image/webp',
      quality: .75,
      width: 200,
      height: 200,
      filename: 'avatar.webp'
    })
    try {
      if (cropper) {
        let canvas = cropper.getCroppedCanvas({ width, height })
        let blob = await new Promise((resolve) => canvas.toBlob( blob => resolve(blob as Blob), type || 'image/webp', quality || .75 ) ) as Blob
        let file = new File([blob], filename || 'avatar.webp', { type: blob.type })
        let formData = new FormData()
        formData.append('files[]', file)
        let httpOptions:  HeaderOptions = {
          ...this.httpOptions,
          upload: (percentage: number) => {
            console.log(percentage)
            this.percentage = percentage
          }
        }
        let result = await this.api.uploadFile(url, formData, httpOptions)
        if (this.percentage < 100) {
          this.percentage = 100
        }
        if (result.error === 0) {
          let [ avatar ] = result.data as ProxyResult[]
          this.$emit('update', avatar.url)
          this.visible = false
          this.$store.commit(`${auth.name}/${auth.types.TIMESTAMP}`)
        }
        else {
          this.$message.warning(result.message)
        }
      }
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  handleCloseDialog (): void {
    this.imgsrc = ''
    this.visible = false
    this.percentage = 0
  }
}

function readImageFile (file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = (err: any) => {
      reject(err)
    }
    reader.readAsDataURL(file)
  })
}
</script>

<style lang="scss" scoped>
.el-avatar {
  width: 120px;
  height: 120px;
  font-size: 80px;
  line-height: 120px;
}

.cropper-wrapper {
  display: flex;
  flex-direction: column;

  .cropper-box {
    display: flex;

    .cropper-box-view {
      flex: 1,
    }

    .cropper-box-preview {
      width: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      .preview {
        width: 120px;
        height: 120px;
        overflow: hidden;
        border-radius: 50%;
        // border: 4px solid #27656c69;
      }
    }
  }

  .upload-loading-progress {
    margin: 8px 0 0;
  }
}

</style>