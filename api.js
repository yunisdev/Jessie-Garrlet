var { APIAI_TOKEN } = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const router = express.Router()
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://yunisdev.github.io");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

router.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API v1',
        author: 'Yunis Huseynzade'
    })
})

router.post('/api/webhook', (req, Res) => {
    try {
        const functionList = {
            currencyConvert({ parameters, queryText }) {
                var resolvedQuery = queryText
                var from = parameters['unit-currency']['currency']
                if (from == 'XBT') {
                    from = 'BTC'
                }
                var q = resolvedQuery.toLowerCase()
                if ((q.includes('try') || q.includes('turkish lira')) && !from) {
                    from = 'try'
                }
                var to = parameters['currency-name']
                if (to == 'XBT') {
                    to = 'BTC'
                }
                var amount = parameters['unit-currency']['amount']
                if (from && to && amount) {
                    var url = `https://exchangerate.guru/${from.toLowerCase()}/${to.toLowerCase()}/${amount}/`
                    axios.get(url).then((res) => {
                        var html = res.data
                        const $ = cheerio.load(html)
                        const value = $('div.conversion-content div.blockquote-classic p span.pretty-sum')
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            value.eq(1).text() + ' ' + to
                                        ]
                                    }
                                }
                            ]
                        })
                    }).catch((e) => {
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            "Can not do this operation"
                                        ]
                                    }
                                }
                            ]
                        })
                    })
                } else {
                    Res.send({
                        "fulfillmentMessages": [
                            {
                                "text": {
                                    "text": [
                                        "Can not do this operation"
                                    ]
                                }
                            }
                        ]
                    })
                }
            },

            countryInfo: ({ parameters }) => {
                axios.get(`https://restcountries.eu/rest/v2/alpha/${parameters['geo-country-code'][parameters['geo-country-code'].length - 1]['alpha-3'].toLowerCase()}`)
                    .then(response => {
                        var typeOfData = parameters['country-info-type']
                        if (typeOfData == 'currencies' || typeOfData == 'languages') {
                            var dataForReturn = []
                            response.data[typeOfData].forEach(i => {
                                dataForReturn.push(i.name)
                            })
                            Res.send({
                                "fulfillmentMessages": [
                                    {
                                        "text": {
                                            "text": [
                                                dataForReturn.join(',')
                                            ]
                                        }
                                    }
                                ]
                            })
                        } else {
                            Res.send({
                                "fulfillmentMessages": [
                                    {
                                        "text": {
                                            "text": [
                                                response.data[typeOfData] || 'I don\'t know.'
                                            ]
                                        }
                                    }
                                ]
                            })
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            },

            globalStats: ({ parameters }) => {
                var type = parameters['global-stats-types']
                if (type == 'covid19') {
                    axios.get(`https://www.worldometers.info/coronavirus/`).then((res) => {
                        var html = res.data
                        const $ = cheerio.load(html)
                        const value = $('.maincounter-number')
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            `${value.eq(0).text()} total cases, ${value.eq(1).text()} deaths, ${value.eq(2).text()} recovered`
                                        ]
                                    }
                                }
                            ]
                        })
                    }).catch((e) => {
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            'Can not do this operation'
                                        ]
                                    }
                                }
                            ]
                        })
                    })
                } else if (type == 'worldPopulation') {
                    axios.get(`https://www.worldometers.info/world-population/`).then((res) => {
                        var html = res.data
                        const $ = cheerio.load(html)
                        const value = $('[rel="current_population"]')
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            value.text()
                                        ]
                                    }
                                }
                            ]
                        })
                    }).catch((e) => {
                        Res.send({
                            "fulfillmentMessages": [
                                {
                                    "text": {
                                        "text": [
                                            'Can not do this operation'
                                        ]
                                    }
                                }
                            ]
                        })
                    })
                }
            },
        }
        var key = req.body.queryResult.fulfillmentText
        console.log(JSON.stringify(req.body))
        if (functionList[key]) {
            functionList[key](req.body.queryResult)
        } else {
            Res.send({
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                req.body.queryResult.fulfillmentText
                            ]
                        }
                    }
                ]
            })
        }
    } catch (e) {
        console.log(e.message)
    }
})

router.post('/api/req', (req, Res) => {
    try {
        const dataResolver = {
            searchQuery: ({ parameters }) => {
                axios.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=' + parameters['query'])
                    .then((res) => {
                        var data = res.data.query.search[0]
                        Res.send({
                            type: 'bot reply multi',
                            result: [`
                        <div style="width:100%;max-width:100%;">
                            <h4 style="display:block;font-weight:bold">${data.title}</h4>
                            <p>${data.snippet}...<a target="_blank" href="https://en.wikipedia.org/wiki/${data.title.split(' ').join('_')}">read more</a></p>
                        </div>
                    `, 'I have found something like this.']
                        })
                    })
                    .catch((err) => {
                        console.log(err.message)
                    })
            },
            youAreWrong: ({ }) => {
                Res.send({
                    type: 'bot reply multi',
                    result: [
                        `I will be happy if you help me to be better. For this you can open issue by <a href="https://github.com/YunisDEV/JessieAI/issues">clicking here</a>`,
                        `I will be happy if you help me to be better. For this you can open issue by clicking here`
                    ]
                })
            },
            sleepTactics: ({ }) => {
                Res.send({
                    type: 'bot reply multi',
                    result: [
                        `You can check <a target="_blank" href="https://www.healthline.com/nutrition/ways-to-fall-asleep">'20 Simple Tips That Help You Fall Asleep Quickly'</a> article`,
                        `You can check '20 Simple Tips That Help You Fall Asleep Quickly' article`
                    ]
                })
            },
            relaxTactics: ({ }) => {
                Res.send({
                    type: 'bot reply multi',
                    result: [
                        `You can check <a target="_blank" href="https://www.healthline.com/health/stress/how-to-relax">'How to Relax: Tips for Chilling Out'</a> article`,
                        `You can check 'How to Relax: Tips for Chilling Out' article`
                    ]
                })
            },
            clearScreen: () => {
                Res.send({ type: 'bot do', result: 'clearScreen' })
            },
            changeTheme: () => {
                Res.send({ type: 'bot do', result: 'changeTheme' })
            }
        }
        var { text } = req.body
        let apiaiReq = apiai.textRequest(text, {
            sessionId: Math.random() * 10000
        })
        apiaiReq.on('response', (response) => {
            var aiText = response.result.fulfillment.messages[response.result.fulfillment.messages.length - 1].speech || response.result.fulfillment.speech
            if (dataResolver[aiText]) {
                dataResolver[aiText](response.result)
            } else {
                Res.send({ type: 'bot reply', result: aiText })
            }
        })
        apiaiReq.on('error', (error) => {
            console.log(error)
        })
        apiaiReq.end()
    } catch (e) {
        console.log(e.message)
    }

})

module.exports = router