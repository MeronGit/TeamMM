
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

function capitalizeStr(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function moveCardFromHolderToDestination(destName) {
    let cardDiv = getCardFromHolder();
    if (!cardDiv) {
        return false;
    }
    let destinationSection = document.getElementById(destName + "Section");
    destinationSection.classList.add("makeRoom");
    let movingClassName = "moveTo" + capitalizeStr(destName);
    cardDiv.classList.add(movingClassName);
    let logoDiv = cardDiv.getElementsByClassName("logo")[0];
    let nameDiv = cardDiv.getElementsByClassName("name")[0];
    setTimeout(function() {
        cardDiv.parentNode.removeChild(cardDiv);
        cardDiv.classList.remove(movingClassName);
        destinationSection.classList.remove("makeRoom");
        let destinationCards = document.getElementById(destName + "Cards");
        destinationCards.insertBefore(cardDiv, destinationCards.firstElementChild);
    }, 1010);
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
    moveCardFromHolderToDestination('frontEnd');
}, 3000);
