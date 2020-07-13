var apiURL = '/api/req'
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
var synth = window.speechSynthesis;
var button = document.querySelector('#talk')
var you = document.querySelector('#you')
var jessie = document.querySelector('#jessie')
var messages = document.querySelector('.message-body')
var form = document.querySelector('form.message-form')
var messageInput = document.querySelector('form.message-form input')
var inputStatus = 'blur'
messageInput.addEventListener('focus', (e) => {
    inputStatus = 'focus'
})
messageInput.addEventListener('blur', (e) => {
    inputStatus = 'blur'
})

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
    recognition.onerror = (e) => {
        console.log(e.error)
    }
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

    function replyMessage({ type, result }) {
        if (type == 'bot do') {
            var func = result
            funcObj[func]()
        } else if (type == 'bot reply') {
            var text = result
            chat('jessie', text)
            var utterThis = new SpeechSynthesisUtterance(text);
            synth.cancel()
            synth.speak(utterThis)
            utterThis.addEventListener('start', () => {
                recognition.stop()
            })
            utterThis.addEventListener('end', () => {
                recognition.start()
            })
        } else if (type == 'bot reply multi') {
            var arr = result
            chat('jessie', arr[0])
            var utterThis = new SpeechSynthesisUtterance(arr[1]);
            synth.cancel()
            synth.speak(utterThis)
            utterThis.addEventListener('start', () => {
                recognition.stop()
            })
            utterThis.addEventListener('end', () => {
                recognition.start()
            })
        }
    }
    recognition.addEventListener('result', (e) => {
        var result = e.results[e.results.length - 1][0].transcript
        chat('you', result)
        recognition.stop()
        fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: result })
        }).then((res) => {
            res.json().then((reply) => {
                replyMessage(reply)
            })
        })
    })
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: messageInput.value })
        }).then((res) => {
            console.log(res)
            res.json().then((reply) => {
                replyMessage(reply)
            })
        })
        chat('you', messageInput.value)
        messageInput.value = ''
        recognition.stop()
    })
    document.addEventListener('keydown', (e) => {
        if (e.code == 'Space' && inputStatus == 'blur') {
            button.click()
        }
    })


} else {
    button.hidden = true
}

//! Alternative with Socket.IO
// const socket = io()
// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
// var synth = window.speechSynthesis;
// var button = document.querySelector('#talk')
// var you = document.querySelector('#you')
// var jessie = document.querySelector('#jessie')
// var messages = document.querySelector('.message-body')
// var form = document.querySelector('form.message-form')
// var messageInput = document.querySelector('form.message-form input')
// var inputStatus = 'blur'
// messageInput.addEventListener('focus', (e) => {
//     inputStatus = 'focus'
// })
// messageInput.addEventListener('blur', (e) => {
//     inputStatus = 'blur'
// })
// function chat(side, text) {
//     if (messages.classList.contains('no-message')) {
//         messages.classList.remove('no-message')
//     }
//     messages.insertAdjacentHTML('beforeend', `<div class="chat chat-${side}"><div>${text}</div></div>`)
//     messages.scrollTop = messages.scrollHeight;
// }
// if (SpeechRecognition) {
//     button.hidden = false
//     const recognition = new SpeechRecognition()
//     recognition.continuous = true
//     recognition.onerror = (e) => {
//         console.log(e.error)
//     }
//     button.addEventListener('click', (e) => {
//         if (button.classList.contains('start')) {
//             recognition.start()
//         } else {
//             recognition.stop()
//         }
//     })
//     recognition.addEventListener('start', (e) => {
//         button.classList.remove('start')
//         button.innerHTML = '<i class="fa fa-stop mr-1" style="font-weight:light;"></i>&nbsp;&nbsp;&nbsp;STOP'
//     })
//     recognition.addEventListener('end', (e) => {
//         button.classList.add('start')
//         button.innerHTML = '<i class="fa fa-play mr-1" style="font-weight:light;"></i>&nbsp;&nbsp;&nbsp;START'
//     })
//     recognition.addEventListener('result', (e) => {
//         var result = e.results[e.results.length - 1][0].transcript
//         socket.emit('chat message', result)
//         chat('you', result)
//         recognition.stop()
//     })
//     form.addEventListener('submit', (e) => {
//         e.preventDefault()
//         socket.emit('chat message', messageInput.value)
//         chat('you', messageInput.value)
//         messageInput.value = ''
//         if (!button.classList.contains('start')) {
//         recognition.stop()
//         }
//     })
//     document.addEventListener('keydown', (e) => {
//         if (e.code == 'Space' && inputStatus == 'blur') {
//             button.click()
//         }
//     })
//     socket.on('bot reply', (text) => {
//         chat('jessie', text)
//         var utterThis = new SpeechSynthesisUtterance(text);
//         synth.cancel()
//         synth.speak(utterThis)
//         utterThis.addEventListener('start', () => {
//             recognition.stop()
//         })
//         utterThis.addEventListener('end', () => {
//             recognition.start()
//         })
//     })
//     socket.on('bot reply multi', (arr) => {
//         chat('jessie', arr[0])
//         var utterThis = new SpeechSynthesisUtterance(arr[1]);
//         synth.cancel()
//         synth.speak(utterThis)
//         utterThis.addEventListener('start', () => {
//             recognition.stop()
//         })
//         utterThis.addEventListener('end', () => {
//             recognition.start()
//         })
//     })
//     socket.on('bot do', (func) => {
//         funcObj[func]()
//     })
// } else {
//     button.hidden = true
// }