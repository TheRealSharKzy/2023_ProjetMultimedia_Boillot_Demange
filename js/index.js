"use strict"

const GAMES = {
    "training": LearnGame,
    "recognition": RecognitionGame
}

window.addEventListener("load", async () => {
    const selector = document.getElementById("language_select");
    const navBar = document.getElementsByTagName("nav")[0];
    const grid = document.getElementById("grid")

    // source of data
    let data = await fetch('json/animalsTranslation.json').then((response) => response.json());

    let currentGame;

    // deal with language changing
    let language;
    writeLanguagesList(selector, Object.keys(data))
    let listener = () => {
        language = selector.value

        constructElementList()
        if (typeof currentGame === "object")
            currentGame = new currentGame.constructor(data[language])
    };
    window.addEventListener("input", listener)
    listener()

    // create game selector
    let gamesList = Object.values(GAMES)
    navBar.innerHTML = ""
    for (let i = 0; i < gamesList.length; i++) {
        let GameConstructor = gamesList[i]

        let htmlElement = document.createElement("span")
        htmlElement.innerText = Object.keys(GAMES)[i]
        let startGame = () => {

            // highlight default game (the first)
            for (let child of navBar.children) {
                child.classList.remove("selected")
            }
            htmlElement.classList.add("selected")

            currentGame = new GameConstructor(data[language])
        };
        htmlElement.addEventListener("click", startGame)
        navBar.appendChild(htmlElement)

        if (i === 0) startGame()
    }

    function constructElementList(){
        let translations = data[language]

        for (let i = 0; i < Math.max(translations.elements.length, grid.children.length); i++) {
            const current = translations.elements[i]
            const currentHtml = grid.children[i]
            let keep = false;
            let exist = false;
            if (currentHtml !== undefined) {
                if (current === undefined) {
                    keep = true
                    currentHtml.remove()
                }
                exist = true
                if (currentHtml.alt === current.alt && currentHtml.src === current.path) {
                    keep = true
                }
            }

            if (!keep) {
                let imgElement = document.createElement("img");
                imgElement.src = current.path
                imgElement.alt = current.name
                imgElement.addEventListener("click", function (event) {
                    currentGame.onclick(current, event.currentTarget)
                })
                translations.elements[i].htmlElement = imgElement
                if (exist) {
                    grid.replaceChild(currentHtml, imgElement)
                } else {
                    grid.appendChild(imgElement)
                }
            }
        }
    }
})

/**
 * @param selector {HTMLSelectElement}
 * @param languages {string[]}
 */
function writeLanguagesList(selector, languages) {
    selector.innerHTML = ""
    for (let lang of languages) {
        let optionElement = document.createElement("option");
        optionElement.text = lang
        selector.appendChild(optionElement)
    }
}

function speech(sentence, languageCode= "en"){
    // if sentence is a translation object
    if (typeof sentence !== "string")
        if (typeof sentence.translation === "string")
            sentence = sentence.translation

    const msg = new SpeechSynthesisUtterance(sentence);
    msg.lang = languageCode;
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
}

function LearnGame(translations) {
    this.languageCode = translations.languageCode
}

LearnGame.prototype.speak = function (text) {
    speech(text, this.languageCode)
}

LearnGame.prototype.onclick = function (elementClicked, htmlTarget) {
    this.speak(elementClicked)
}

function RecognitionGame(translations) {
    this.elements = translations.elements
    this.languageCode = translations.languageCode
    this.refresh()
}
RecognitionGame.prototype.speak = function (text) {
    speech(text, this.languageCode)
}
RecognitionGame.prototype.refresh = function () {
    this.currentElement = this.elements[Math.floor(Math.random() * this.elements.length)]
    this.nbTry = 0;
    this.speak(this.currentElement)
}
RecognitionGame.prototype.onclick = function (elementClicked, htmlTarget){
    let htmlElement = this.currentElement.htmlElement
    if (elementClicked === this.currentElement){
        speech("You win");

        htmlElement.classList.add("highlight")
        let flash = setInterval(() => htmlElement.classList.toggle("highlight"), 500);
        setTimeout(() => {
            clearInterval(flash)
            htmlElement.classList.remove("highlight")
        }, 5000)

        //Quand on gagne on relance une partie
        // Peut-être mettre un délai avant de relancer la partie
        this.refresh()
    } else {
        //Mettre les cases en sur lesquels on a cliqué mais ne sont pas bonnes en rouge
        this.nbTry++
        // Je laisse 3 essais
        if (this.nbTry<3) {
            speech("You lose but you can retry");
            this.speak(this.currentElement)
        } else {
            speech("You lost completely. The good answer was")
            htmlElement.classList.add("highlight")
            let flash = setInterval(() => htmlElement.classList.toggle("highlight"), 500);
            setTimeout(() => {
                clearInterval(flash)
                htmlElement.classList.remove("highlight")
            }, 3000)
            // Mettre en vert la bonne case
            // Attendre quelques secondes
            this.refresh()
        }
    }
}


