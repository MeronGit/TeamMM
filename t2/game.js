
function createCard(params) {
    let name = params.name;
    let logoName = params.logoName;
    if (!logoName) {
        logoName = name.toLowerCase().replace(/ /g, '_');
    }
    let cardDiv = document.createElement("div");
    cardDiv.className = "logo-card";
    let logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    logoDiv.style.backgroundImage = `url('images/logos/${logoName}.png')`;
    let nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.textContent = name;
    cardDiv.appendChild(logoDiv);
    cardDiv.appendChild(nameDiv);
    return cardDiv;
}

function addCardToNext(cardDiv) {
    let nextCardsDiv = document.getElementById("nextCards");
    nextCardsDiv.appendChild(cardDiv);
}

function moveCardToHolder(cardDiv) {
    cardDiv.classList.remove("move-to-first");
    cardDiv.parentNode.removeChild(cardDiv);
    let holderDiv = document.getElementById("currentCardHolder");
    holderDiv.appendChild(cardDiv);
    let nextCardsDiv = document.getElementById("nextCards");
    if (nextCardsDiv.children.length > 0) {
        let newFirstCardDiv = nextCardsDiv.firstElementChild;
        newFirstCardDiv.classList.add("move-to-first");
    }
}

// testing
let cardDiv1 = createCard(cards[0]);
let cardDiv2 = createCard(cards[1]);
addCardToNext(cardDiv1);
setTimeout(function() {
    addCardToNext(cardDiv2);
}, 1000);
setTimeout(function() {
    moveCardToHolder(cardDiv1);
}, 2000);
