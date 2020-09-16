import * as unzipper from 'unzipper'
import * as fs from 'fs-extra'
import * as isStream from 'is-stream'


export async function unzip (zipfile: fs.ReadStream | string, rootDir: string): Promise<void> {
  let stream: fs.ReadStream
  if (isStream(zipfile)) {
    stream = zipfile as fs.ReadStream
  }
  else {
    stream = fs.createReadStream(zipfile as string)
  }
  await stream.pipe(unzipper.Extract({ path: rootDir })).promise()
}
