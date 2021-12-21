import http from 'http'
import Websocket from 'ws'
import { loadConfig } from '@kenote/config'
import jsYaml from 'js-yaml'
import { verifyJwToken, toUser } from '~/middlewares/auth'
import * as service from '~/services'
import { WebSocketMessage } from '@/types/services/http'
import { get, map, fromPairs, compact, trim } from 'lodash'
import { PubsubConfigure } from '@/types/services/pubsub'
import ruleJudgment from 'rule-judgment'

const { PubSub } = service

export function createWebsocketServer (server: http.Server) {
  let wss = new Websocket.Server({
    server,
    path: '/dashboard'
  })
  wss.on('connection', async (socket: Websocket, request: http.IncomingMessage) => {
    let token = getCookie('jwtoken', request.headers.cookie)
    let auth = await getAuthUser(token)
    if (!auth) {
      wss.close()
    }
    // 接收客户端消息
    socket.on('message', async (data: Websocket.Data) => {
      let ctx: WebSocketMessage.Request = jsYaml.load(data as string)
      await PubSub.publish(ctx.headers.path, ctx)
    })
    let pubsubConfigure = loadConfig<PubsubConfigure[]>('config/pubsub', { type: 'array' })
    // 订阅内部服务
    PubSub.subscribe(map(pubsubConfigure, 'name'), async (message: string, data: WebSocketMessage.Request) => {
      data.auth = auth
      // 处理订阅逻辑
      let { response } = loadConfig<PubsubConfigure[]>('config/pubsub', { type: 'array', assign: data }).find( ruleJudgment({ name: message }) ) ?? {}
      if (response) {
        let body = {}
        for (let [key, res] of Object.entries(response)) {
          let func = get(service, res.service)
          if (func) {
            let ret = await func(...res.args!)
            body[key] = (res.resultMaps ? get(ret, res.resultMaps) : ret) ?? res.defaultValues
          }
        }
        socket.send(JSON.stringify(resultData(data, body)))
      }
    })
  })
  wss.on('close', (socket: Websocket) => {
    console.log('close')
  })
  wss.on('error', (socket: Websocket, err) => {
    console.log('error', err)
  })
}

async function getAuthUser (token: string) {
  let payload = verifyJwToken(token ?? '')
  if (payload) {
    let user = await service.db.user.Dao.findOne({ _id: payload._id, jw_token: token })
    return user ? toUser(user) : user
  }
  return null
}

function resultData (request: WebSocketMessage.Request, body: any) {
  let { headers, payload } = request
  let result: WebSocketMessage.Response = {
    headers: {
      path: headers.path,
      payload,
      timestamp: Date.now()
    },
    body
  }
  return result
}

function getCookie (name: string, cookie?: string) {
  return get(fromPairs(compact((cookie ?? '').split(/\;/))
      .map(String)
      .map(trim)
      .map( s => s.split(/\=/) )), name)
}
