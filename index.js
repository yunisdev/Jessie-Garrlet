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

// io.on('connection', function (socket) {
//     socket.on('chat message', (text) => {
//         axios.post('https://jessie-ai.herokuapp.com/api/req',{
//             text
//         }).then(({data}) => {
//             socket.emit(data.type,data.result)
//         }).catch((e) => {
//             console.log(e.message)
//         })
//     })
// })



server.listen(process.env.PORT, () => {
    console.log('Server running')
});