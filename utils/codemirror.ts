
// tslint:disable-next-line: no-namespace
export declare namespace Codemirror {

  type themeName = 'default' | 'base16-light' | 'mdn-like' | 'nord' | 'monokai'
  type modeType = 
    | 'application/json' 
    | 'text/javascript' 
    | 'text/css' 
    | 'text/html' 
    | 'application/x-httpd-php' 
    | 'text/x-python' 
    | 'text/apl' 
    | 'text/x-swift' 
    | 'text/x-go'
    | 'text/x-lua'
    | 'text/x-mysql'
    | 'text/x-markdown'
    | 'text/x-vue'
    | 'text/x-yaml'
    | 'text/x-sh'
    | 'application/x-sh'
    | 'message/http'
    | 'text/x-nginx-conf'
    | 'text/x-java'
    | 'application/xml'
    | 'text/x-protobuf'
    | 'text/x-dockerfile'

  interface Options extends Record<string, any> {
    tabSize              ?: number
    foldGutter           ?: boolean
    styleActiveLine      ?: boolean
    lineNumbers          ?: boolean
    lineWrapping         ?: boolean
    styleSelectedText    ?: boolean
    line                 ?: boolean
    scrollbarStyle       ?: string
    keyMap               ?: string
    readOnly             ?: boolean
    mode                 ?: modeType
    theme                ?: themeName
    placeholder          ?: string
  }
}

export const themeNames = [
  'default' , 
  'base16-light' , 
  'mdn-like' , 
  'nord' , 
  'monokai'
]

export const contentTypes = [
  'application/json', 
  'text/javascript', 
  'text/css', 
  'text/html', 
  'application/x-httpd-php', 
  'text/x-python',
  'text/apl',
  'text/x-swift',
  'text/x-go',
  'text/x-lua',
  'text/x-mysql',
  'text/x-markdown',
  'text/x-vue',
  'text/x-yaml',
  'text/x-sh',
  'application/x-sh',
  'message/http',
  'text/x-nginx-conf',
  'text/x-java',
  'application/xml',
  'text/x-protobuf',
  'text/x-dockerfile'
]

