'use strict'

const path = require('path')

const DATA_SHEET = [
  { '.b-product_name': 'plantName' },
  { '.b-product_description': 'description' },
  { '.b-product_properties-property_value': 'properties' },
  { '.b-product_growing_info-sow_info': 'health.sow' },
  { '.b-product_growing_info-grow_info': 'health.grow' },
  { '.b-product_growing_info-growing_tips': 'health.tips' }
]

const URLS = [
  'https://www.burpee.com/vegetables/arugula/arugula-red-dragon-prod500402.html',
  'https://www.burpee.com/vegetables/artichokes/artichoke-imperial-star-prod000566.html'
]

;(async function () {
  const WebScraper = require('./index')
  const opts = { write: path.join(__dirname, 'scrapes/') }

  const scraper = new WebScraper(DATA_SHEET, opts)
  const data = await scraper.scrape(URLS)
  console.log(data)
})()
