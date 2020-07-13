var funcObj = {
    clearScreen() {
        messages.innerHTML = ''
        messages.scrollTop = messages.scrollHeight;
    },
    changeTheme() {
        var Theme = {
            dark:'./css/dark.css',
            light:'./css/default.css'
        }
        var themeCSS = document.getElementById('theme-stylesheet')
        if (themeCSS.getAttribute('href') === Theme.dark){
            themeCSS.setAttribute('href',Theme.light)
        }else{
            themeCSS.setAttribute('href',Theme.dark)
        }
        this.clearScreen()
    }
}