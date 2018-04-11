
let gameActive = false;
let readyToTakeInput = false;
let needsToInstructPlayer = true;
let lastCardMoveInNextTime;
let lastCardArrivalInHolderTime;
let placeNewCardIntoNextInterval;
let score = 0;
let soundEnabled = true;


function playSound(name) {
    if (!soundEnabled) {
        return;
    }
    let audioElem = document.getElementById("sound_" + name);
    audioElem.currentTime = 0;
    audioElem.play();
}

/**
 * Shuffles array in place.
 * From: https://stackoverflow.com/a/6274381/2655932
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function setReadyToTakeInput(value) {
    readyToTakeInput = value;
    let cardHolder = document.getElementById("currentCardHolder");
    if (readyToTakeInput) {
        cardHolder.className = "active";
    } else {
        cardHolder.className = "";
    }
}

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

function createQuestionCard(index) {
    let cardDiv = document.createElement("div");
    cardDiv.className = "logoCard questionCard";
    cardDiv.dataset.questionIndex = index;
    let questionMarkDiv = document.createElement("div");
    questionMarkDiv.className = "questionMark";
    questionMarkDiv.textContent = "?";
    cardDiv.appendChild(questionMarkDiv);
    return cardDiv;
}

function resetNextCardLoader(keepRunning) {
    let loader = document.getElementById("nextLoader");
    loader.className = "";
    if (keepRunning) {
        setTimeout(function() {
            loader.className = "running";
        }, 25);
    }
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
    let currentCardDiv = holderDiv.firstElementChild;
    if (holderDiv.firstElementChild && currentCardDiv.id != "instructionCard") {
        return;
    }
    let cardDiv = document.getElementById("nextCards").firstElementChild;
    if (!cardDiv) {
        return;
    }
    if (cardDiv.classList.contains("questionCard")) {
        resetNextCardLoader(false);
    }
    setReadyToTakeInput(false);
    cardDiv.classList.remove("moveToFirst");
    cardDiv.parentNode.removeChild(cardDiv);
    holderDiv.insertBefore(cardDiv, holderDiv.firstElementChild);
    let nextCardsDiv = document.getElementById("nextCards");
    if (nextCardsDiv.children.length > 0) {
        let newFirstCardDiv = nextCardsDiv.firstElementChild;
        newFirstCardDiv.classList.add("moveToFirst");
        lastCardMoveInNextTime = Date.now();
    }
    setTimeout(function() {
        lastCardArrivalInHolderTime = Date.now();
        if (cardDiv.classList.contains("questionCard")) {
            setUpQuestion(questions[cardDiv.dataset.questionIndex]);
        } else {
            setReadyToTakeInput(true);
        }
    }, 1000);
}

function makeCardDisappear(cardDiv, additionalTimeout) {
    setReadyToTakeInput(false);
    cardDiv.classList.add("disappear");
    setTimeout(function() {
        cardDiv.parentNode.removeChild(cardDiv);
    }, 500 + (additionalTimeout || 0));
    setTimeout(function () {
        moveCardToHolder();
    }, 600 + (additionalTimeout || 0));
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
    setReadyToTakeInput(false);
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

function incrementScore(delta) {
    score += delta;
    let scoreElem = document.getElementById("score");
    scoreElem.textContent = score;
    scoreElem.className = "";
    setTimeout(function() {
        scoreElem.className = "changed";
    }, 10);
}

function gameOver() {
    clearInterval(placeNewCardIntoNextInterval);
    gameActive = false;
    document.body.className = "gameEnded gameOver";
    document.getElementById("quitConfirm").className = "";
    playSound("game_over");
}

function gameWon() {
    clearInterval(placeNewCardIntoNextInterval);
    gameActive = false;
    document.body.className = "gameEnded gameWon";
    document.getElementById("quitConfirm").className = "";
    playSound("game_won");
}

function decreaseLives() {
    let hearts = document.getElementById("livesLine").children;
    let anyLivesLeft = false;
    for (let i=hearts.length - 1; i >= 0; i--) {
        if (!hearts[i].classList.contains("gone")) {
            hearts[i].classList.add("gone");
            anyLivesLeft = i != 0;
            break;
        }
    }
    resetNextCardLoader(true);
    if (!anyLivesLeft) {
        setTimeout(function() {
            gameOver();
        }, 1000);
    }
    return anyLivesLeft;
}

function showFeedback(outcome, scoreChange) {
    let feedbackDiv = document.createElement("div");
    feedbackDiv.className = "feedback " + outcome;
    let outcomeDiv = document.createElement("div");
    outcomeDiv.className = "outcome";
    outcomeDiv.textContent = capitalizeStr(outcome);
    let scoreChangeDiv = document.createElement("scoreChange");
    scoreChangeDiv.className = "scoreChange";
    scoreChangeDiv.textContent = (scoreChange >= 0 ? "+" : "") + scoreChange + " point" +
                                (Math.abs(scoreChange) != 1 ? "s" : "");
    feedbackDiv.appendChild(outcomeDiv);
    feedbackDiv.appendChild(scoreChangeDiv);
    document.getElementById("feedbackArea").appendChild(feedbackDiv);
    incrementScore(scoreChange);
    playSound(outcome);
    if (outcome == "wrong") {
        decreaseLives();
    }
    setTimeout(function() {
        feedbackDiv.parentNode.removeChild(feedbackDiv);
    }, 1500);
}

let questionTimeout;

function answerQuestion(answerNo) {
    let questionArea = document.getElementById("questionArea");
    if (questionArea.className == "disappear") {
        return;
    }
    let cardDiv = getCardFromHolder();
    cardDiv.classList.add("paused");
    let answerElem = document.getElementById("answer" + answerNo);
    let questionTitle = document.getElementById("questionTitle").textContent;
    let question = questions.find(q => q.question == questionTitle);
    answerElem.classList.add("chosen");
    questionArea.className = "disappear";
    let isCorrect = answerElem.textContent == question.answers[0];
    clearTimeout(questionTimeout);
    makeCardDisappear(cardDiv, 2500);
    setTimeout(function() {
        if (isCorrect) {
            showFeedback("correct", 200);
        } else {
            showFeedback("wrong", -100);
        }
    }, 2500);
}

function setUpQuestion(data) {
    let questionArea = document.getElementById("questionArea");
    questionArea.className = "";
    questionArea.innerHTML = "";
    let title = document.createElement("h2");
    title.id = "questionTitle";
    title.textContent = data.question;
    questionArea.appendChild(title);
    let answers = data.answers.slice();
    shuffle(answers);
    for (let i in answers) {
        let answer = document.createElement("div");
        answer.className = "answer";
        answer.id = "answer" + parseInt(i);
        let dot = document.createElement("div");
        dot.className = "dot";
        let answerText = document.createTextNode(answers[i]);
        answer.appendChild(dot);
        answer.appendChild(answerText);
        answer.addEventListener('click', function() {
            answerQuestion(i);
        });
        questionArea.appendChild(answer);
    }
    setTimeout(function() {
        questionArea.className = "appear";
    }, 10);
    setTimeout(function() {
        setReadyToTakeInput(true);
    }, 1000);
    questionTimeout = setTimeout(function() {
        questionArea.className = "disappear";
        setTimeout(function() {
            decreaseLives();
            playSound("wrong");
        }, 2500);
        makeCardDisappear(getCardFromHolder(), 2500);
    }, 8500);
}

function makeArrowsDisappear() {
    let arrowElems = document.getElementsByClassName("arrow");
    for (let arrowElem of arrowElems) {
        arrowElem.classList.add("disappear");
    }
    setTimeout(function() {
        for (let arrowElem of arrowElems) {
            arrowElem.parentNode.removeChild(arrowElem);
        }
    }, 500);
}

function categorizeHolderCard(dest) {
    if (!gameActive || !readyToTakeInput) {
        return;
    }
    let cardDiv = getCardFromHolder();
    if (!cardDiv) {
        return;
    }
    if (needsToInstructPlayer) {
        needsToInstructPlayer = false;
        if (!hasInstructionStarted) {
            clearTimeout(instructionTimeout);
            let instructionCard = document.getElementById("instructionCard");
            if (instructionCard) {
                instructionCard.parentNode.removeChild(instructionCard);
            }
        }
    }
    makeArrowsDisappear();
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
        showFeedback("wrong", -50);
    } else if (moveCardFromHolderToDestination(dest)) {
        destinationSection.classList.remove("correct");
        destinationSection.classList.remove("incorrect");
        setTimeout(function() {
            destinationSection.classList.add("correct");
        }, 10);
        showFeedback("correct", Math.max(5,
            Math.round(90 - (Date.now() - lastCardArrivalInHolderTime) / 100)));
    }
}

function checkKeydownForCardCategorization(event) {
    if (event.key == "ArrowLeft" || event.key == "ArrowRight") {
        let dest = event.key == "ArrowLeft" ? "frontEnd" : "backEnd";
        categorizeHolderCard(dest);
    }
}

function checkKeydownForQuestionAnswer(event) {
    if (!gameActive || !readyToTakeInput) {
        return;
    }
    let keymap = {
        "ArrowLeft": 0,
        "ArrowDown": 1,
        "ArrowRight": 2
    };
    if (event.key in keymap) {
        answerQuestion(keymap[event.key]);
    }
}

let cardIndex;
let questionIndex;

function placeNewCardIntoNext() {
    let nextCardsElem = document.getElementById("nextCards");

    if (!gameActive || needsToInstructPlayer &&
            (nextCardsElem.children.length > 0 || getCardFromHolder())) {
        return;
    }
    let cardFromHolder = getCardFromHolder();
    if (cardFromHolder && cardFromHolder.classList.contains("questionCard")) {
        return;
    }
    if (nextCardsElem.children.length > 1) {
        decreaseLives();
        playSound("wrong");
        return;
    }
    let cardDiv;
    if (questionIndex < questions.length && cardIndex == (questionIndex+1)*4) {
        cardDiv = createQuestionCard(questionIndex++);
    } else {
        let card = cards[cardIndex++];
        if (!card) {
            if (!getCardFromHolder() && nextCardsElem.children.length == 0) {
                gameWon();
            }
            return;
        }
        cardDiv = createCard(card);
    }
    if (!needsToInstructPlayer) {
        resetNextCardLoader(true);
    }
    addCardToNext(cardDiv);
}

function instructPlayer() {
    if (document.getElementById("instructionCard")) {
        return;
    }

    let instructionCardDiv = document.createElement("div");
    instructionCardDiv.className = "logoCard";
    instructionCardDiv.id = "instructionCard";
    let holderCardDiv = getCardFromHolder();
    let name = holderCardDiv.getElementsByClassName("name")[0].textContent;
    let holderCardType = getTypeForCardByName(name);
    if (holderCardType == "frontEnd") {
        document.getElementById("leftArrow").classList.add("animatePress");
        instructionCardDiv.classList.add("moveToFrontEnd");
    } else {
        document.getElementById("rightArrow").classList.add("animatePress");
        instructionCardDiv.classList.add("moveToBackEnd");
    }
    document.getElementById("currentCardHolder").appendChild(instructionCardDiv);

    setTimeout(function() {
        if (!instructionDiv.parentNode) {
            return;
        }
        instructionCardDiv.parentNode.removeChild(instructionCardDiv);
    }, 3500);
}

let instructionTimeout;
let hasInstructionStarted = false;

function startGame() {
    hasInstructionStarted = true;
    document.getElementById("quitConfirm").className = "";
    document.getElementById("nextCards").innerHTML = "";
    let idsToClear = ["currentCardHolder", "frontEndCards",
                      "backEndCards", "questionArea"];
    for (let id of idsToClear) {
        let elem = document.getElementById(id);
        elem.className = "";
        elem.textContent = "";
        if (id == "frontEndCards") {
            elem.innerHTML = "<div class='arrow' id='leftArrow'></div>";
        } else if (id == "backEndCards") {
            elem.innerHTML = "<div class='arrow' id='rightArrow'></div>";
        }
    }
    document.getElementById("frontEndSection").className = "bottom";
    document.getElementById("backEndSection").className = "bottom";
    resetNextCardLoader(false);
    clearTimeout(questionTimeout);
    questionArea.className = "";
    questionArea.innerHTML = "";
    document.body.classList.add("transitionToInGame");
    score = 0;
    document.getElementById("score").textContent = 0;
    for (let heartDiv of document.getElementsByClassName("heart")) {
        heartDiv.classList.remove("gone");
    }
    shuffle(cards);
    shuffle(questions);
    cardIndex = 0;
    questionIndex = 0;
    readyToTakeInput = false;
    needsToInstructPlayer = true;
    hasInstructionStarted = false;
    let delay = 1500;
    if (document.body.classList.contains("gameEnded")) {
        delay = 2500;
    }
    setTimeout(function() {
        document.body.className = "";
        gameActive = true;
        placeNewCardIntoNext();
        placeNewCardIntoNextInterval = setInterval(placeNewCardIntoNext, 3000);

        instructionTimeout = setTimeout(instructPlayer, 4000);
    }, delay);
}

function main() {
    document.addEventListener('keydown', function(event) {
        let classList = document.body.classList;
        if ((classList.contains("initial") || classList.contains("gameEnded")) &&
                !classList.contains("transitionToInGame")) {
            if (classList.contains("initial")) {
                let startButton = document.getElementById("startButton");
                startButton.classList.add("active");
                setTimeout(function() {
                    startButton.classList.remove("active");
                }, 1000);
            }
            startGame();
            return;
        }
        let cardFromHolder = getCardFromHolder();
        if (cardFromHolder) {
            if (cardFromHolder.classList.contains("questionCard")) {
                checkKeydownForQuestionAnswer(event);
            } else {
                checkKeydownForCardCategorization(event);
            }
        }
    });

    document.getElementById("frontEndSection").addEventListener("click", function() {
        categorizeHolderCard("frontEnd");
    });
    document.getElementById("backEndSection").addEventListener("click", function() {
        categorizeHolderCard("backEnd");
    });

    document.getElementById("showQuitConfirmLink").addEventListener("click", function() {
        document.getElementById("quitConfirm").className = "show";
    });
    document.getElementById("confirmQuitLink").addEventListener("click", function() {
        gameActive = false;
        document.body.className = "initial";
    });
    document.getElementById("cancelQuitLink").addEventListener("click", function() {
        document.getElementById("quitConfirm").className = "";
    });

    let toggleSoundLink = document.getElementById("toggleSoundLink");
    toggleSoundLink.addEventListener("click", function() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            toggleSoundLink.className = "enabled";
        } else {
            toggleSoundLink.className = "disabled";
        }
    })

    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("playAgainButton").addEventListener("click", startGame);
}

main();
