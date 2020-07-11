var { APIAI_TOKEN } = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'API v1',
        author: 'Yunis Huseynzade'
    })
})
router.get('/weather', (req, res) => {
    
})

module.exports = router