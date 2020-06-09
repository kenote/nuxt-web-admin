import { Context } from '@nuxt/types'
import * as auth from '~/store/modules/auth'

export default (context: Context): void => {
  // 使用 context
  let { redirect, store } = context
  let Auth = store.state.auth as auth.State
  if (Auth.auth) {
    return redirect('/dashboard')
  }
}