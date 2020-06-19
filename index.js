var { APIAI_TOKEN } = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const socketio = require('socket.io')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const axios = require('axios')
app.use(express.static(__dirname + '/views'))
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    res.sendFile('index.html')
})

io.on('connection', function (socket) {
    const dataResolver = {
        countryInfo: (parameters) => {
            console.log(parameters)
            axios.get(`https://restcountries.eu/rest/v2/alpha/${parameters['geo-country-code']['alpha-3'].toLowerCase()}`)
                .then(response => {
                    var typeOfData = parameters['country-info-type']
                    if (typeOfData == 'currencies') {
                        var currencies = []
                        response.data[typeOfData].forEach(i => {
                            currencies.push(i.name)
                        })
                        socket.emit('bot reply', currencies)
                    } else {
                        socket.emit('bot reply', response.data[typeOfData])
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
    socket.on('chat message', (text) => {

        let apiaiReq = apiai.textRequest(text, {
            sessionId: Math.random() * 10000
        })
        apiaiReq.on('response', (response) => {
            var aiText = response.result.fulfillment.speech
            if (dataResolver[aiText]) {
                dataResolver[aiText](response.result.parameters)
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