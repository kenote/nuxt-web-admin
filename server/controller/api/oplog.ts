import { Controller, Get, Post, Put, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { loadConfig } from '@kenote/config'
import { Channel } from '@/types/client'
import { pick, orderBy, cloneDeep } from 'lodash'
import { AccountConfigure } from '@/types/config/account'
import ruleJudgment from 'rule-judgment'
import * as filter from '~/filters/api'
import path from 'path'
import mime from 'mime-types'
import fs from 'fs'
import { Oplog } from '@/types/services/db'
import { getDateTimes } from '~/services'
import { Readable } from 'stream'
import inspect from 'object-inspect'

@Controller('oplog')
export default class OplogController {

  /**
   * 获取运行日志列表
   */
  @Post('/system', { filters: [ ...authenticate, filter.oplog.system ] })
  async system (ctx: Context, next: NextHandler) {
    let { nextError, pickFiles, getDateTimes, httpError, ErrorCode, toValue, isDateString, logDir, parseToLogfile } = ctx.service
    let { day } = ctx.payload
    try {
      if (!isDateString(day)) {
        throw httpError(ErrorCode.ERROR_CUSTOMIZE_DATA, ['day 必须是个日期格式'])
      }
      day = toValue('date')(day)
      let date = getDateTimes(day)
      let filter = ruleJudgment({
        $and: [
          { start: { $gte: date?.start } },
          { end: { $lte: date?.end } }
        ]
      })
      let files = await pickFiles(['**/*'], { cwd: logDir, nodir: true, realpath: true, ignore: ['!**/*.log'] })
      let fileList = files.map( parseToLogfile(logDir, /^(bak\.)(\S+)\-([\d]{2})(\.log)$/, [ 2, 3 ]) ).filter(filter)
      return ctx.api(orderBy(fileList, ['start'], ['asc']))
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 下载运行日志
   */
  @Get('/system/:filename', { filters: [ ...authenticate ] })
  async downloadSystem (ctx: Context, next: NextHandler) {
    let { nextError, logDir } = ctx.service
    let { filename } = ctx.params
    try {
      ctx.filterUserLevel(0, 9998)
      let filePath = path.resolve(logDir, filename)
      return ctx.downloadFile(filePath, 'download')
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}