var Theme
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    var Theme = {
        dark: './css/mobile-dark.css',
        light: './css/mobile-default.css'
    }
    document.getElementById('theme-stylesheet').setAttribute('href',Theme.light)
    document.querySelector('.mobile-talk').setAttribute('id','talk')
    // var formHTML = document.querySelector('.message-form')
    // var heightHTML = parseFloat(window.getComputedStyle(formHTML).height)-parseFloat(window.getComputedStyle(formHTML).padding)*3
    // console.log(heightHTML)
    // document.querySelector('button[type="submit"]').setAttribute('style',`height:${heightHTML}px;width:${heightHTML}px`)
} else {
    var Theme = {
        dark: './css/dark.css',
        light: './css/default.css'
    }
    document.querySelector('.desktop-talk').setAttribute('id','talk')
}