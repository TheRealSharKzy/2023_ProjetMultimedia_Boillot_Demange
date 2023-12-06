let currAnimalRecognitionGame;
let animalList = [];
let datas;

window.addEventListener("load", async () => {
    // source of data
    let raw_data = await fetch('json/animalsTranslation.json').then((response) => response.json());
    datas = raw_data;
    writeLanguagesList(Object.keys(raw_data))
    //constructAnimalList(jsonData);


    //     }).catch(function (error) {
    //     console.log(error);
    // });

    /**
     * @type {HTMLSelectElement}
     */
    let selector = document.getElementById("language_select");

    window.addEventListener("input", () => {
        let language = selector.value
        let translations = datas[language]
        constructAnimalList(translations)
    })
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

function constructAnimalList(jsonData){
    let grid = document.getElementById("grid")
    grid.innerHTML = ""

    for (const current of jsonData.animals) {
        animalList.push(current.name);
        let imgElement = document.createElement("img");
        imgElement.src = current.path
        imgElement.addEventListener("click", () => speechAnimalName(current.translation, current.languageCode))
        grid.appendChild(imgElement)
    }
}

function getAnimalLanguages(animal){
    for (let i = 0; i<datas.animals.size;i++){
        let current = datas.animals[i];
        if (current.name === animal){
            return current.languages;
        }
    }
}

function recognitionGameStart(animalList){
    currAnimalRecognitionGame = animalList[Math.round(Math.random()*animalList.size)];
    let languages = getAnimalLanguages(currAnimalRecognitionGame);
    let pronunciation = getAnimalPronunciationByLanguage(languages);
    speechAnimalName(pronunciation);
}

function recognitionGameClick(animalClicked){
    if (animalClicked === currAnimalRecognitionGame){
        speech("You win");
        recognitionGameStart(animalList);
    } else {
        speech("You lose but you can retry");
        speechAnimalName(currAnimalRecognitionGame);
    }
}

/**
 *
 * @param event {Event}
 */
function refreshLanguage(event) {
    let target = event.target;
    console.log(target.value)
}


