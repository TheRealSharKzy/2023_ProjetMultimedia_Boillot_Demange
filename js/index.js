let currLanguage = 'english';
fetch('json/animals.json')
    .then(function(text) {
        return text.json();
    }
).then(function(jsonData) {
    console.log(jsonData);
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

function constructAnimalList(jsonData){
    let grid = document.getElementById("grid")
    let elements = "";
    for (let i = 0; i < 6; i++) {
        let current =  jsonData.animals[i];
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
