
function createCard(params) {
    let name = params.name;
    let logoName = params.logoName;
    if (!logoName) {
        logoName = name.toLowerCase().replace(/ /g, '_');
    }
    let cardDiv = document.createElement("div");
    cardDiv.className = "logoCard";
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
    cardDiv.classList.remove("moveToFirst");
    cardDiv.parentNode.removeChild(cardDiv);
    let holderDiv = document.getElementById("currentCardHolder");
    holderDiv.appendChild(cardDiv);
    let nextCardsDiv = document.getElementById("nextCards");
    if (nextCardsDiv.children.length > 0) {
        let newFirstCardDiv = nextCardsDiv.firstElementChild;
        newFirstCardDiv.classList.add("moveToFirst");
    }
}

function getCardFromHolder() {
    return document.getElementById("currentCardHolder").firstElementChild;
}

function moveCardFromHolderToDestination(isFrontEnd) {
    let cardDiv = getCardFromHolder();
    if (!cardDiv) {
        return false;
    }
    let className = isFrontEnd ? "moveToFrontEnd" : "moveToBackEnd";
    cardDiv.classList.add(className);
    let logoDiv = cardDiv.getElementsByClassName("logo")[0];
    let nameDiv = cardDiv.getElementsByClassName("name")[0];
    cardDiv.style.animation = 'none';
    logoDiv.style.animation = 'none';
    nameDiv.style.animation = 'none';
    setTimeout(function() {
        cardDiv.style.animation = '';
        logoDiv.style.animation = '';
        nameDiv.style.animation = '';
    }, 10);
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

setTimeout(function() {
    document.getElementById("frontEndSection").classList.add("makeRoom");
}, 3000);

setTimeout(function() {
    moveCardFromHolderToDestination(true);
}, 3000);
