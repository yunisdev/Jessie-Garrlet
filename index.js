var {APIAI_TOKEN} = process.env
const apiai = require('apiai')(APIAI_TOKEN)
const socketio = require('socket.io')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(express.static(__dirname + '/views'))
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    res.sendFile('index.html')
})


io.on('connection', function (socket) {
    socket.on('chat message', (text) => {
        let apiaiReq = apiai.textRequest(text, {
            sessionId: Math.random() * 10000
        })
        apiaiReq.on('response', (response) => {
            let aiText = response.result.fulfillment.speech
            socket.emit('bot reply', aiText)
        })
        apiaiReq.on('error', (error) => {
            console.log(error)
        })
        apiaiReq.end()
    })
})

server.listen(3000, () => {
    console.log('Server running')
});