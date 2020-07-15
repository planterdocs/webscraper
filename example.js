'use strict'

const path = require('path')

let DATA_SHEET = [
  { '.b-product_name': 'plantName' },
  { '.b-product_description': 'description' }
]

let URLS = [
  'https://www.burpee.com/vegetables/arugula/arugula-red-dragon-prod500402.html',
  'https://www.burpee.com/vegetables/artichokes/artichoke-imperial-star-prod000566.html'
]

;(async function () {
  let ws = require('./index')
  let opts = { write: path.join(__dirname, 'scrapes/') }

  let scraper = new ws(DATA_SHEET)
  let data = await scraper.scrape(URLS)
  console.log(data)
})()
