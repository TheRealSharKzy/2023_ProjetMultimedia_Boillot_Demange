let currLanguage = 'english';
let currAnimalRecognitionGame;
let animalList = [];
let datas;
fetch('json/animals.json')
    .then(function(text) {
        return text.json();
    }
).then(function(jsonData) {
    datas = jsonData;
    constructAnimalList(jsonData);
}).catch(function(error) {
    console.log(error);
});

function speechAnimalName(animal){
    const msg = new SpeechSynthesisUtterance(animal);
    msg.lang = currLanguage;
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
    let elements = "";
    for (let i = 0; i < 6; i++) {
        let current =  jsonData.animals[i];
        animalList.push(current.name);
        let currentAnimalPrononciation = getAnimalPronunciationByLanguage(current.languages)
        elements += `<img src='${current.path}' class="grid-item" onclick=speechAnimalName("${currentAnimalPrononciation}")>`
    }
    grid.innerHTML = elements;
}

function getAnimalPronunciationByLanguage(languages){
    for (let i= 0; i < languages.length; i++) {
        if (languages[i].language === currLanguage) return languages[i].traduction;
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


