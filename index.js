var { APIAI_TOKEN } = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const socketio = require('socket.io')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const axios = require('axios')
const cheerio = require('cheerio')
const apiRouter = require('./api')
app.use(express.static(__dirname + '/views'))
app.use(express.static(__dirname + '/public'))
app.use(apiRouter)
app.get('/', (req, res) => {
    res.sendFile('index.html')
})

io.on('connection', function (socket) {
    const dataResolver = {
        countryInfo: ({ parameters }) => {
            axios.get(`https://restcountries.eu/rest/v2/alpha/${parameters['geo-country-code'][parameters['geo-country-code'].length - 1]['alpha-3'].toLowerCase()}`)
                .then(response => {
                    var typeOfData = parameters['country-info-type']
                    if (typeOfData == 'currencies' || typeOfData == 'languages') {
                        var dataForReturn = []
                        response.data[typeOfData].forEach(i => {
                            dataForReturn.push(i.name)
                        })
                        socket.emit('bot reply', dataForReturn)
                    } else {
                        socket.emit('bot reply', response.data[typeOfData])
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        },
        currencyConvert: ({ parameters, resolvedQuery }) => {
            var from = parameters['unit-currency']['currency']
            var q = resolvedQuery.toLowerCase()
            if ((q.includes('try') || q.includes('turkish lira')) && !from) {
                from = 'try'
            }
            console.log(from)
            var to = parameters['currency-name']
            console.log(to)
            var amount = parameters['unit-currency']['amount']
            console.log(amount)
            if (from && to && amount) {
                var url = `https://exchangerate.guru/${from.toLowerCase()}/${to.toLowerCase()}/${amount}/`
                axios.get(url).then((res) => {
                    var html = res.data
                    const $ = cheerio.load(html)
                    const value = $('div.conversion-content div.blockquote-classic p span.pretty-sum')
                    socket.emit('bot reply', value.eq(1).text() + ' ' + to)
                }).catch((e) => {
                    socket.emit('bot reply', 'Can not do this operation')
                })
            } else {
                console.log('a')
                socket.emit('bot reply', 'Can not do this operation')
            }

        },
        globalStats: ({ parameters }) => {
            var type = parameters['global-stats-types']
            if (type == 'covid19') {
                axios.get(`https://www.worldometers.info/coronavirus/`).then((res) => {
                    var html = res.data
                    const $ = cheerio.load(html)
                    const value = $('.maincounter-number')
                    socket.emit('bot reply', `${value.eq(0).text()} total cases, ${value.eq(1).text()} deaths, ${value.eq(2).text()} recovered`)
                }).catch((e) => {
                    socket.emit('bot reply', 'Can not do this operation')
                })
            } else if (type == 'worldPopulation') {
                axios.get(`https://www.worldometers.info/world-population/`).then((res) => {
                    var html = res.data
                    const $ = cheerio.load(html)
                    const value = $('[rel="current_population"]')
                    socket.emit('bot reply', value.text())
                }).catch((e) => {
                    socket.emit('bot reply', 'Can not do this operation')
                })
            }
        },
        searchQuery: ({ parameters }) => {
            axios.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=' + parameters['query'])
                .then((res) => {
                    var data = res.data.query.search[0]
                    socket.emit('bot reply multi', [`
                        <div style="width:100%;max-width:100%;">
                            <h4 style="display:block;font-weight:bold">${data.title}</h4>
                            <p>${data.snippet}...<a target="_blank" href="https://en.wikipedia.org/wiki/${data.title.split(' ').join('_')}">read more</a></p>
                        </div>
                    `, 'I have found something like this.'])
                })
                .catch((err) => {

                })
        },
        youAreWrong: ({ }) => {
            socket.emit('bot reply multi', [
                `I will be happy if you help me to be better. For this you can open issue by <a href="https://github.com/YunisDEV/JessieAI/issues">clicking here</a>`,
                `I will be happy if you help me to be better. For this you can open issue by clicking here`
            ])
        },
        sleepTactics: ({ }) => {
            socket.emit('bot reply multi', [
                `You can check <a target="_blank" href="https://www.healthline.com/nutrition/ways-to-fall-asleep">'20 Simple Tips That Help You Fall Asleep Quickly'</a> article`,
                `You can check '20 Simple Tips That Help You Fall Asleep Quickly' article`
            ])
        },
        relaxTactics: ({ }) => {
            socket.emit('bot reply multi', [
                `You can check <a target="_blank" href="https://www.healthline.com/health/stress/how-to-relax">'How to Relax: Tips for Chilling Out'</a> article`,
                `You can check 'How to Relax: Tips for Chilling Out' article`
            ])
        },
        repeatText: ({ parameters }) => {
            socket.emit('bot reply', parameters.textForRepeat)
        },
        clearScreen: () => {
            socket.emit('bot do', 'clearScreen')
        },
        changeTheme: () => {
            socket.emit('bot do','changeTheme')
        }
    }
    socket.on('chat message', (text) => {
        let apiaiReq = apiai.textRequest(text, {
            sessionId: Math.random() * 10000
        })
        apiaiReq.on('response', (response) => {
            var aiText = response.result.fulfillment.speech
            if (dataResolver[aiText]) {
                dataResolver[aiText](response.result)
            } else {
                socket.emit('bot reply', aiText)
            }
        })
        apiaiReq.on('error', (error) => {
            console.log(error)
        })
        apiaiReq.end()

    })
})



server.listen(process.env.PORT, () => {
    console.log('Server running')
});