
import isBlob from 'is-blob'


export function readImageFile<T = string | ArrayBuffer | null> (file: File | Blob): Promise<T> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as unknown as T)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(file)
  })
}

export function readTextFile<T = string> (file: File | Blob): Promise<T> {
  if (!isBlob(file)) {
    file = new Blob([file], { type: (<File> file).type })
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as unknown as T)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}