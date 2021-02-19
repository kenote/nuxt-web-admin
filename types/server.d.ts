

declare namespace NodeJS {
  interface Process {
    readonly browser: boolean
  }

  interface ProcessEnv {
    readonly NODE_ENV      : 'development' | 'production' | 'test'
    readonly HTTP_PORT    ?: number
  }
}