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

        constructAnimalList()
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

    function constructAnimalList(){
        let translations = data[language]
        grid.innerHTML = ""

        for (let i = 0; i < translations.animals.length; i++) {
            const current = translations.animals[i]

            let imgElement = document.createElement("img");
            imgElement.src = current.path
            imgElement.addEventListener("click", function (event) {currentGame.onclick(current, event.currentTarget)})
            translations.animals[i].htmlElement = imgElement
            grid.appendChild(imgElement)
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

LearnGame.prototype.onclick = function (animalClicked, htmlTarget) {
    this.speak(animalClicked)
}

function RecognitionGame(translations) {
    this.animals = translations.animals
    this.languageCode = translations.languageCode
    this.refresh()
}
RecognitionGame.prototype.speak = function (text) {
    speech(text, this.languageCode)
}
RecognitionGame.prototype.refresh = function () {
    this.currentAnimal = this.animals[Math.floor(Math.random() * this.animals.length)]
    this.nbTry = 0;
    this.speak(this.currentAnimal)
}
RecognitionGame.prototype.onclick = function (animalClicked, htmlTarget){
    if (animalClicked === this.currentAnimal){
        speech("You win");
        //Quand on gagne on relance une partie
        // Peut-être mettre un délai avant de relancer la partie
        this.refresh()
    } else {
        //Mettre les cases en sur lesquels on a cliqué mais ne sont pas bonnes en rouge
        this.nbTry++
        // Je laisse 3 essais
        if (this.nbTry<3) {
            speech("You lose but you can retry");
            this.speak(this.currentAnimal)
        } else {
            let htmlElementAnimal = this.currentAnimal.htmlElement
            speech("You lost completely. The good answer was")
            htmlElementAnimal.classList.add("highlight")
            let flash = setInterval(() => htmlElementAnimal.classList.toggle("highlight"), 500);
            setTimeout(() => {
                clearInterval(flash)
                htmlElementAnimal.classList.remove("highlight")
            }, 5000)
            // Mettre en vert la bonne case
            // Attendre quelques secondes
            this.refresh()
        }
    }
}

// Change l'event en fonction du jeu et la jeu de reconnaissance si jamais
function changeGame(game, jsonData, language){
    constructAnimalList(jsonData[language],language, game);
    if (game === "recognition") recognitionGameStart(jsonData[language])
}


