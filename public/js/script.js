const socket = io()
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
var synth = window.speechSynthesis;
var button = document.querySelector('#talk')
var you = document.querySelector('#you')
var jessie = document.querySelector('#jessie')
var messages = document.querySelector('.message-container')

function chat(side, text) {
    if (messages.classList.contains('no-message')) {
        messages.classList.remove('no-message')
    }
    messages.insertAdjacentHTML('beforeend', `<div class="chat chat-${side}"><div>${text}</div></div>`)

    messages.scrollTop = messages.scrollHeight;
}

if (SpeechRecognition) {
    button.hidden = false

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    button.addEventListener('click', (e) => {
        if (button.classList.contains('start')) {
            recognition.start()
        } else {
            recognition.stop()
        }
    })

    recognition.addEventListener('start', (e) => {
        button.classList.remove('start')
        button.innerHTML = '<i class="fa fa-stop mr-1" style="font-weight:light;"></i>&nbsp;&nbsp;&nbsp;STOP'
    })
    recognition.addEventListener('end', (e) => {
        button.classList.add('start')
        button.innerHTML = '<i class="fa fa-play mr-1" style="font-weight:light;"></i>&nbsp;&nbsp;&nbsp;START'
    })
    recognition.addEventListener('result', (e) => {
        var result = e.results[e.results.length - 1][0].transcript
        socket.emit('chat message', result)
        chat('you', result)
    })
    document.addEventListener('keydown', (e) => {
        if (e.code == 'Space') {
            button.click()
        }
    })
    socket.on('bot reply', (text) => {
        chat('jessie', text)
        var utterThis = new SpeechSynthesisUtterance(text);
        synth.speak(utterThis)
        utterThis.addEventListener('start', () => {
            recognition.stop()
        })
        utterThis.addEventListener('end', () => {
            recognition.start()
        })
    })
} else {
    button.hidden = true

}
