import unzipper from 'unzipper'
import fs from 'fs'
import isStream from 'is-stream'
import glob from 'glob'
import archiver from 'archiver'

/**
 * 解压文件
 * @param zipfile 
 * @param rootDir 
 */
export async function unzip (zipfile: fs.ReadStream | string, rootDir: string) {
  let stream: fs.ReadStream
  if (isStream(zipfile)) {
    stream = zipfile as fs.ReadStream
  }
  else {
    stream = fs.createReadStream(zipfile as string)
  }
  await stream.pipe(unzipper.Extract({ path: rootDir })).promise()
}

/**
 * 压缩文件
 * @param file 
 * @param patterns 
 * @param globOptions 
 * @param append 
 * @param format 
 */
export function zip (file: string, patterns: string[], globOptions: glob.IOptions, append: string[][] = [], format: archiver.Format = 'tar') {
  let options: archiver.ArchiverOptions = format === 'zip' ? {
    zlib: { level: 9 }
  } : {
    gzip: true,
    gzipOptions: { level: 9 }
  }
  return new Promise((resolve, reject) => {
    let archive = archiver(format, options)
    let output = fs.createWriteStream(file)
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes')
      console.log('archiver has been finalized and the output file descriptor has closed.')
    })
    output.on('end', () => {
      console.log('Data has been drained')
    })
    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        reject(err)
      }
    })
    archive.on('error', err => {
      reject(err)
    })
    archive.on('end', () => {
      let archiveSize = archive.pointer()
      resolve(archiveSize)
    })
    archive.pipe(output)
    for (let pattern of patterns) {
      archive.glob(pattern, globOptions)
    }
    for (let item of append) {
      let [ source, target ] = item
      archive.directory(source, target)
    }
    archive.finalize()
  })
}