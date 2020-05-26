import { Context } from '@nuxt/types'

export default (context: Context): void => {
  // 使用 context
  let { redirect, store, route } = context
  return redirect('/')
}
