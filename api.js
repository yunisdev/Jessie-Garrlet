var { APIAI_TOKEN } = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const router = express.Router()
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

router.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API v1',
        author: 'Yunis Huseynzade'
    })
})

router.post('/api/req', (req, res) => {
    try {
        console.log(req.body)
        var { text } = req.body
        let apiaiReq = apiai.textRequest(text, {
            sessionId: Math.random() * 10000
        })
        apiaiReq.on('response', (response) => {
            var aiText = response.result.fulfillment.speech
            // if (dataResolver[aiText]) {
            // dataResolver[aiText](response.result)
            // } else {
            res.send({ type: 'bot reply', result: aiText })
            // }
        })
        apiaiReq.on('error', (error) => {
            console.log(error)
        })
        apiaiReq.end()
    } catch (e) {
        console.log(e.message)
    }

})
router.get('/hello', (req, res) => {
    res.send('Hello')
})
module.exports = router