import { Maps, KeyMap } from 'kenote-config-helper'
import { Bookmark } from '@/types/proxys/plan'
import { remove, isEqual, cloneDeep, unset } from 'lodash'
import { ruleJudgment } from './query'

export class IBookmark {

  private __bookmarks!: Bookmark[]

  constructor (bookmarks: Bookmark[]) {
    this.__bookmarks = (bookmarks)
  }

  public find (query: Maps<any>, bookmarks: Bookmark[] = this.__bookmarks): Bookmark | undefined {
    let __bookmark: Bookmark | undefined
    for (let bookmark of bookmarks) {
      if (ruleJudgment(bookmark, query)) {
        __bookmark = bookmark
        return __bookmark
      }
      else if (bookmark.children) {
        __bookmark = this.find(query, bookmark.children)
        if (__bookmark) return __bookmark
      }
    }
    return __bookmark
  }

  public remove (key: string, bookmarks: Bookmark[] = this.__bookmarks): Bookmark[] {
    let __bookmarks: Bookmark[] = bookmarks
    for (let bookmark of bookmarks) {
      if (bookmark.key === key) {
        remove(__bookmarks, o => o.key === key)
        return __bookmarks
      }
      else if (bookmark.children) {
        let __children = this.remove(key, bookmark.children)
        if (!isEqual(__children, bookmark.children)) return bookmarks
      }
    }
    return __bookmarks
  }

  public folders (bookmarks: Bookmark[] = this.__bookmarks): Bookmark[] {
    let __bookmarks: Bookmark[] = cloneDeep(bookmarks.filter( o => !!o.children ))
    __bookmarks.forEach( (bookmark: Bookmark, __v: number) => {
      __bookmarks[__v].children = this.folders(bookmark.children)
    })
    return __bookmarks
  }

  public add (key: string, bookmark: Bookmark, bookmarks: Bookmark[] = this.__bookmarks): void {
    let _bookmark = this.find({ key }, bookmarks)
    if (_bookmark) {
      _bookmark.children?.push(bookmark)
    }
  }

  public update (key: string, item: Bookmark, bookmarks: Bookmark[] = this.__bookmarks) {
    let i: number = 0
    for (let bookmark of bookmarks) {
      if (bookmark.key === key) {
        bookmarks[i] = { ...bookmark, ...item }
        return bookmarks
      }
      else if (bookmark.children) {
        let children = cloneDeep(bookmark.children)
        let __children = this.update(key, item, bookmark.children)
        if (!isEqual(__children, children)) return bookmarks
      }
      i++
    }
    return bookmarks
    
  }
}

export function initMaps (bookmarks: Bookmark[], maps: Bookmark[] = []): Bookmark[] {
  bookmarks.forEach( (bookmark: Bookmark, __v: number) => {
    let { key, name, command } = bookmark
    bookmark.maps = [ ...maps ]
    bookmark.maps.push({ key, name, command })
    if (bookmark.children) {
      return initMaps(bookmark.children, bookmark.maps)
    }
  })
  return bookmarks
}

export function removeMaps (bookmarks: Bookmark[]) {
  bookmarks.forEach( (bookmark: Bookmark, __v: number) => {
    unset(bookmark, 'maps')
    if (bookmark.children) {
      return removeMaps(bookmark.children)
    }
  })
  return bookmarks
}

export declare namespace IBookmark {

  interface values {
    key       ?: string
    name      ?: string
    command   ?: string
  }

  interface target extends KeyMap<string> {
    maps      ?: Bookmark[]
  }
}