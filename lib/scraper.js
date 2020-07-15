'use strict'

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { debuglog, promisify } = require('util')

const writeOut = promisify(fs.writeFile)
const debug = debuglog('webscraper::main')

const Reqi = require('reqi')
const cheerio = require('cheerio')

class WebScraper {
  constructor (dataSheet, opts) {
    debug('Initialized new WebScraper')

    if (!opts) opts = {}

    this.write = opts.write || false

    this.dataSheet = dataSheet
    this.client = new Reqi({})

    /* check validity of write path now */
    if (typeof this.write === 'string') {
      try {
        fs.lstatSync(this.write)
      } catch (error) {
        throw new Error('Invalid write path!')
      }
    }
  }

  async scrape (urls, _dataSheets = null) {
    const RETURN_SHEETS = []

    for (let i = 0; i < urls.length; i++) {
      const sheet = _dataSheets
        ? _dataSheets[i]
          ? _dataSheets[i]
          : null
        : null
      const ret = await this.scrapePage(urls[i], sheet)

      RETURN_SHEETS.push(ret)

      if (this.write) {
        if (typeof this.write === 'string') {
          const fileName = `${urlTransform(urls[i])}.json`
          const writePath = path.join(this.write, fileName)

          try {
            debug(`writing out to: ${writePath}`)

            const json = JSON.stringify(ret)
            await writeOut(writePath, json)
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
    return RETURN_SHEETS
  }

  async scrapePage (url, _dataSheet = null) {
    debug('Fetching page html')
    const dataSheet = _dataSheet || this.dataSheet

    try {
      const data = await this.client.get(url)

      if (!data || !data.body) return new Error('invalid html recieved')

      let RETURN_SHEET = {}

      const $ = cheerio.load(data.body)

      for (const ele of dataSheet) {
        const targetField = Object.keys(ele)[0]
        const mapToName = Object.values(ele)[0]

        debug(`${targetField} --> ${mapToName}`)
        const res = $(targetField)
          .text()
          .trim()
          .replace(/[\n]+/gi, '; ')
          .replace(/[ ]+/gi, ' ')

        if (res && res.length > 0) {
          if (mapToName.indexOf('.') > -1) {
            RETURN_SHEET = recursiveInit(
              RETURN_SHEET,
              mapToName.split('.'),
              res
            )
          } else RETURN_SHEET[mapToName] = res
        }
      }

      /* tack-on original url */
      RETURN_SHEET.url = url

      return RETURN_SHEET
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = WebScraper

function urlTransform (url) {
  let transform = url.slice(url.indexOf('www.') + 4)
  transform = transform.replace(/\//gi, '+').replace(/\./gi, '-')
  return `scrape-${transform}`
}

function recursiveInit (obj, inds, value) {
  debug('recursive init')
  if (!inds || inds.length <= 0) {
    return value
  } else {
    const shift = inds.shift()

    if (obj[shift]) {
      obj[shift] = recursiveInit(obj[shift], inds, value)
    } else {
      obj[shift] = recursiveInit({}, inds, value)
    }
  }
  return obj
}
