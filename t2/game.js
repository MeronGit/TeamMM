
let readyToMoveCard = false;
let lastCardMoveInNextTime;

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
    lastCardMoveInNextTime = Date.now();
    setTimeout(function() {
        moveCardToHolder();
    }, 1000);
}

function moveCardToHolder() {
    let holderDiv = document.getElementById("currentCardHolder");
    let timeLeft = 1000 - (Date.now() - lastCardMoveInNextTime);
    if (timeLeft > 0) {
        setTimeout(moveCardToHolder, timeLeft);
        return;
    }
    if (holderDiv.firstElementChild) {
        return;
    }
    let cardDiv = document.getElementById("nextCards").firstElementChild;
    if (!cardDiv) {
        return;
    }
    readyToMoveCard = false;
    cardDiv.classList.remove("moveToFirst");
    cardDiv.parentNode.removeChild(cardDiv);
    holderDiv.appendChild(cardDiv);
    let nextCardsDiv = document.getElementById("nextCards");
    if (nextCardsDiv.children.length > 0) {
        let newFirstCardDiv = nextCardsDiv.firstElementChild;
        newFirstCardDiv.classList.add("moveToFirst");
        lastCardMoveInNextTime = Date.now();
    }
    setTimeout(function() {
        readyToMoveCard = true;
    }, 1000);
}

function makeCardDisappear(cardDiv) {
    readyToMoveCard = false;
    cardDiv.classList.add("disappear");
    setTimeout(function() {
        cardDiv.parentNode.removeChild(cardDiv);
    }, 500);
    setTimeout(function () {
        moveCardToHolder();
    }, 600);
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
    readyToMoveCard = false;
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
        moveCardToHolder();
    }, 1010);
    return true;
}

function getTypeForCardByName(name) {
    let card = cards.find((card) => card.name == name);
    if (card) {
        return card.type;
    } else {
        return "";
    }
}

function main() {
    let nextCardsElem = document.getElementById("nextCards");
    let cardIndex = 0;
    let placeNewCardIntoNextInterval;
    let placeNewCardIntoNext = function() {
        if (nextCardsElem.children.length > 1) {
            alert("Game over!");
            clearInterval(placeNewCardIntoNextInterval);
            readyToMoveCard = false;
            return;
        }
        let card = cards[cardIndex++];
        if (!card) {
            alert("You WON!");
            clearInterval(placeNewCardIntoNextInterval);
            readyToMoveCard = false;
            return;
        }
        let cardDiv = createCard(card);
        addCardToNext(cardDiv);
    }
    placeNewCardIntoNext();
    placeNewCardIntoNextInterval = setInterval(placeNewCardIntoNext, 3000);
    document.addEventListener('keydown', function(event) {
        if (!readyToMoveCard) {
            return;
        }
        if (event.key == "ArrowLeft" || event.key == "ArrowRight") {
            let dest = event.key == "ArrowLeft" ? "frontEnd" : "backEnd";
            let cardDiv = getCardFromHolder();
            if (!cardDiv) {
                return;
            }
            let name = cardDiv.getElementsByClassName("name")[0].textContent;
            let correctType = getTypeForCardByName(name);
            let destinationSection = document.getElementById(dest + "Section");
            if (dest != correctType) {
                destinationSection.classList.remove("correct");
                destinationSection.classList.remove("incorrect");
                setTimeout(function() {
                    destinationSection.classList.add("incorrect");
                }, 10);
                makeCardDisappear(cardDiv);
            } else if (moveCardFromHolderToDestination(dest)) {
                destinationSection.classList.remove("correct");
                destinationSection.classList.remove("incorrect");
                setTimeout(function() {
                    destinationSection.classList.add("correct");
                }, 10);
            }
        }
    });
}

main();
