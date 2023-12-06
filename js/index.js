
//Il y a surement un moyen d'enlever ces variables mais j'ai pas trouvé
let currAnimalRecognitionGame;
let animalList = [];
let nbTimesClicked = 0;

window.addEventListener("load", async () => {
    // source of data
    let raw_data = await fetch('json/animalsTranslation.json').then((response) => response.json());
    let datas = raw_data;
    writeLanguagesList(Object.keys(raw_data))
    let language = "english"


    /**
     * @type {HTMLSelectElement}
     */
    let selector = document.getElementById("language_select");

    window.addEventListener("input", () => {
        // Je suis pas sûr que la voix change (à revoir)
        language = selector.value
        let translations = datas[language]
        constructAnimalList(translations, language)
    })

    // Game 1 = training
    let game1 = document.getElementById("game1")
    game1.addEventListener("click",() => changeGame("training", datas, language));

    // Game 2 = Recognition game
    let game2 = document.getElementById("game2")
    game2.addEventListener("click",() => changeGame("recognition", datas, language));
})

/**
 *
 * @param languages {string[]}
 */
function writeLanguagesList(languages) {
    /**
     * @type {HTMLSelectElement}
     */
    let selector = document.getElementById("language_select");
    selector.innerHTML = ""
    for (let lang of languages) {
        let optionElement = document.createElement("option");
        optionElement.text = lang
        selector.appendChild(optionElement)
    }

}

function speechAnimalName(animal, language = "english"){
    const msg = new SpeechSynthesisUtterance(animal);
    msg.lang = language;
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
}

function speech(words){
    const msg = new SpeechSynthesisUtterance(words);
    msg.lang = "english";
    msg.rate = 0.8;
    window.speechSynthesis.speak(msg);
}

function constructAnimalList(jsonData, language, game = "training"){
    let grid = document.getElementById("grid")
    let i = 1
    grid.innerHTML = ""
    animalList = [];

    for (const current of jsonData.animals) {
        animalList.push(current.name);

        let imgElement = document.createElement("img");
        imgElement.src = current.path
        imgElement.id = "img" + i++;
        if (game === "training" ) imgElement.addEventListener("click", () => speechAnimalName(current.translation, current.languageCode))
        else imgElement.addEventListener("click", () => recognitionGameClick(current.name, language, jsonData))
        grid.appendChild(imgElement)
    }
}

// Donne la traduction de l'animal dans la langue courante
function getAnimalTranslation(animal, languages){
    for (let i = 0; i<languages.animals.length;i++){
        let current = languages.animals[i];
        if (current.name === animal){
            return current.translation;
        }
    }
}

// Lance le jeu de reconnaissance
function recognitionGameStart(jsonData){
    // Animal aléatoirement pris dans la liste
    currAnimalRecognitionGame = animalList[Math.round(Math.random()*animalList.length - 1)];
    // Traduction de l'animal choisi aléatoirement avec la langue choisi
    let translation = getAnimalTranslation(currAnimalRecognitionGame, jsonData)
    speechAnimalName(translation);
}

// Quand on est dans le jeu de reconnaissance et que l'on clique sur une image
function recognitionGameClick(animalClicked,language, jsonData){
    if (animalClicked === currAnimalRecognitionGame){
        nbTimesClicked = 0;
        speech("You win");
        //Quand on gagne on relance une partie
        // Peut-être mettre un délai avant de relancer la partie
        recognitionGameStart(jsonData);
    } else {
        //Mettre les cases en sur lesquels on a cliqué mais ne sont pas bonnes en rouge
        nbTimesClicked++
        // Je laisse 3 essais
        if (nbTimesClicked<3) {
            speech("You lose but you can retry");
            speechAnimalName(currAnimalRecognitionGame);
        } else {
            speech("You lost completely. The good answer was")
            // Mettre en vert la bonne case
            // Attendre quelques secondes
            recognitionGameStart(jsonData)
        }
    }
}

// Change l'event en fonction du jeu et la jeu de reconnaissance si jamais
function changeGame(game, jsonData, language){
    constructAnimalList(jsonData[language],language, game);
    if (game === "recognition") recognitionGameStart(jsonData[language])
}

/**
 *
 * @param event {Event}
 */
function refreshLanguage(event) {
    let target = event.target;
    console.log(target.value)
}


