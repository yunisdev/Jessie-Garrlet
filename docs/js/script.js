var apiURL = 'https://jessie-ai.herokuapp.com/api/req'
var Theme
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    var Theme = {
        dark: './css/mobile-dark.css',
        light: './css/mobile-default.css'
    }
    document.getElementById('theme-stylesheet').setAttribute('href',Theme.light)
    document.querySelector('.mobile-talk').setAttribute('id','talk')
    var formHTML = document.querySelector('.message-form')
    var heightHTML = parseFloat(window.getComputedStyle(formHTML).height)-parseFloat(window.getComputedStyle(formHTML).padding)
    // var paddingHTML = parseFloat(window.getComputedStyle(inputHTML).padding)
    // console.log(heightHTML+paddingHTML*2)
    console.log(heightHTML)
    document.querySelector('button[type="submit"]').setAttribute('style',`height:${heightHTML}px;width:${heightHTML}px`)
} else {
    var Theme = {
        dark: './css/dark.css',
        light: './css/default.css'
    }
    document.querySelector('.desktop-talk').setAttribute('id','talk')
}
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