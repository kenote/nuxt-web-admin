import { Controller, Get, Post, Delete, Context, NextHandler } from '@kenote/core'
import { authenticate } from '~/plugins/passport'
import { orderBy } from 'lodash'
import ruleJudgment from 'rule-judgment'
import * as filter from '~/filters/api'
import path from 'path'
import fs from 'fs'
import { OplogDocument } from '@/types/services/db'
import { FilterQuery } from 'mongoose'

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

  /**
   * 删除运行日志
   */
  @Delete('/system', { filters: [ ...authenticate ]})
  @Delete('/system/:filename', { filters: [ ...authenticate ]})
  async removeSystem (ctx: Context, next: NextHandler) {
    let { nextError, logDir } = ctx.service
    let { filename } = ctx.params
    let { files } = ctx.body
    try {
      ctx.filterUserLevel(0, 9998)
      if (filename) {
        files = [ filename ]
      }
      for (let file of files) {
        fs.unlinkSync(path.resolve(logDir, file))
      }
      return ctx.api(null)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }

  /**
   * 获取API日志列表
   */
  @Post('/', { filters: [ ...authenticate, filter.oplog.list ] })
  async list (ctx: Context, next: NextHandler) {
    let { nextError, db, int2ip } = ctx.service
    let { pageInfo, query, options } = ctx.payload
    let { limit, skip } = pageInfo
    let conditions: FilterQuery<OplogDocument> = {}
    let { types, ip, user, create_at } = query
    // 按创建时间
    if (create_at?.length === 2) {
      let [ begin, end ] = create_at
      conditions.create_at = { $gte: begin, $lt: end }
    }
    // 按 IP 地址
    if (ip) {
      if (/(\d+)/.test(ip)) {
        conditions.ip = int2ip(ip)
      }
      else {
        conditions.ip = {
          $regex: new RegExp(ip, 'i')
        }
      }
    }
    // 按类型
    if (types?.length > 0) {
      conditions.type = { $in: types }
    }
    try {
      if (user) {
        let users = await db.user.Dao.find({ $or: [ { username: new RegExp(user) }, { email: new RegExp(user) }, { mobile: new RegExp(user) } ]})
        conditions.user = { $in: users.map( r => r._id ) }
      }
      let result = await db.oplog.Dao.list(conditions, { ...options, limit, skip })
      return ctx.api(result)
    } catch (error) {
      nextError(error, ctx, next)
    }
  }
}