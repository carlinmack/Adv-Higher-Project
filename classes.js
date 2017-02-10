// following are debug comment lines

/*jshint esversion: 6 */
/*globals prompt:false */
/*globals document:false */
/*globals window:false */
/*globals localStorage:false */

// end debug lines



/*TODO
    JAVASCRIPT

        leaderboard
        split method
        red cards

    BUGS
        always losing destroys game
        when new game try, catch - remove all objects?

    UI
        add banks
        winning tournament text
        split cards
        hide dealer first card
        big margin for tournament/1 player

    EFFICIENCY
        simplify duplicated code
        don't update hidden things

    STRETCH GOALS
        feedback for natural
        delay ai players turns a bit
        fragments
        new game button below 0
        missing semicolon on make button
        getIDs function mess
*/

class Deck {
    constructor() {
        //initialises arrays for cards
        this.availableCards = [];
        this.cutCards = [];
        this.spentCards = [];
        this.players = 5;
    }

    createDeck(decks) {
        //As there are 4 suits per deck it needs to be multiplied for the loop
        decks *= 4;
        //for the amount of suits
        for (let j = 0; j < decks; j++) {
            //and the amount of cards in a suit
            for (let i = 0; i < 14; i++) {
                if (i === 11) {
                    //unicode has a knight card which is not needed for the game
                } else {
                    // adds a card to the main array
                    this.availableCards.push([j, i]);
                }
            }
        }
    }

    shuffle() {
        //fisher-yates shuffle
        var m = this.availableCards.length,
            t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Decrease number of remaining cards
            m -= 1;
            // Pick a remaining element…
            i = Math.floor(Math.random() * m);
            // And swap it with the current element.
            t = this.availableCards[m];
            this.availableCards[m] = this.availableCards[i];
            this.availableCards[i] = t;
        }
        return this.availableCards;
    }

    //remove last 20% of cards
    cut() {
        // select the last 20%
        var len = this.availableCards.length / 5;
        for (let i = 0; i < len; i++) {
            // remove them from the end of the array
            // and add it to the front of the cut cards arry
            this.cutCards.push(this.availableCards.pop());
        }
    }

    deal() {
        //deal 2 cards to each player and the dealer
        for (let i = 0; i < Players.length; i++) {
            Players[i].cards.push(this.availableCards.pop());
            Players[i].cards.push(this.availableCards.pop());
        }
    }

    hit() {
        return this.availableCards.pop();
    }

    returnCards(cards) {
        this.spentCards.push(cards);
    }

    combineDecks() {
        // when availableCards is empty, push cut and spent cards to it
        for (let i = 0; i < this.cutCards.length; i++) {
            this.availableCards.push(this.cutCards[i]);
        }
        for (let j = 0; j < this.spentCards.length; j++) {
            this.availableCards.push(this.spentCards[j]);
        }
    }

    store() {
        localStorage.availableCards = this.availableCards;
        localStorage.cutCards = this.cutCards;
        localStorage.spentCards = this.spentCards;
        localStorage.players = this.players;
    }
}

class Dealer {
    constructor() {
        this.cards = [];
        this.turn = false;
        this.cardBalance = 17;
    }

    display(card) {
        //Change [0, 2] to A ♦
        var prefix = "0x0001F0",
            suit = "",
            cardVal, temp;

        var suits = {
            '0': 'A',
            '1': 'B',
            '2': 'C',
            '3': 'D'
        };
        var value = (card[0] % 4).toString();
        suit = suits[value];
        cardVal = (card[1] + 1).toString(16);
        temp = prefix.concat(suit, cardVal);
        return String.fromCodePoint(temp);
    }

    evaluate() {
        var value = 0;
        var flag = false;

        for (let k = 0; k < this.cards.length; k++) {
            if (this.cards[k][1] === 0 && flag === false) {
                value += 11;
                flag = true;
            }
            //if card is less than ten, value of it is card val + 1
            else if (this.cards[k][1] < 10) {
                value += this.cards[k][1] + 1;
            } else {
                //all cards above ten are valued at 10
                value += 10;
            }
        }
        if (value > 21 && flag) {
            value -= 10;
            return value;
        } else {
            return value;
        }
    }


    natural() {
        if (this.cards[0][1] === 0 && this.cards[1][1] > 8) {
            return true;
        } else if (this.cards[0][1] > 8 && this.cards[1][1] === 0) {
            return true;
        } else {
            return false;
        }
    }

    stand() {
        this.turn = false;
    }

    hit() {
        //take card from start of queue
        this.cards.push(deck.hit());
    }

    returnCards(cards) {
        deck.returnCards(this.cards);
        this.cards = [];
    }

    store() {
        localStorage.cards = this.cards;
        localStorage.turn = this.turn;
        localStorage.cardBalance = this.cardBalance;
    }
}

class VirtualHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wager = 50;
        this.wagerBalance = 0;
    }

    wagerBalanceCalc() {
        this.wagerBalance = Math.floor(Math.random() * 3);
        switch (this.wagerBalance) {
        case 0:
            this.wager = 10;
            break;
        case 1:
            this.wager = 50;
            break;
        case 2:
            this.wager = 100;
            break;
        }
    }

    cardBalanceCalc() {
        //to get a normal (bell curve) distribution I'm adding two random numbers
        //not a statistically sound method but it should do the trick
        var max = 9;
        var min = 7;
        var x = Math.floor(Math.random() * (max - min + 1) + min);
        var y = Math.floor(Math.random() * (max - min + 1) + min);
        this.cardBalance = x + y;
    }

    store(i) {
        localStorage.setItem(i + "cards", this.cards);
        localStorage.setItem(i + "turn", this.turn);
        localStorage.setItem(i + "cardBalance", this.cardBalance);
        localStorage.setItem(i + "wagerBalance", this.wagerBalance);
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wager", this.wager);
    }
}

class PlayerHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wager = 50;
        this.splitCards = [];
        this.handle = "";
        this.rounds = 0;
    }

    display(card) {
        //Change [0, 2] to A ♦
        var prefix = "0x0001F0",
            suit = "",
            cardVal, temp;

        var suits = {
            '0': 'A',
            '1': 'B',
            '2': 'C',
            '3': 'D'
        };
        suit = suits[card[0] % 4];
        cardVal = (card[1] + 1).toString(16);
        temp = prefix.concat(suit, cardVal);
        return String.fromCodePoint(temp);

        //        if (splitCards != [])
        //            RETURN unicodeCards[splitCards[card][0] MOD 4, splitCards[card][1]]
        //        END IF
    }

    stand() {
        settlement(true);
    }

    double() {
        this.hit();
        this.wager += this.wager;
        //double wager
        //receive card
        //end playing
    }

    splitCards() {
        //create two seperate hands
        this.splitCards.push(this.cards.pop);
    }

    store(i) {
        localStorage.setItem(i + "cards", this.cards);
        localStorage.setItem(i + "turn", this.turn);
        localStorage.setItem(i + "cardBalance", this.cardBalance);
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wager", this.wager);
        localStorage.setItem(i + "splitCards", this.splitCards);
        localStorage.setItem(i + "handle", this.handle);
    }
}

////////////////////// MAIN FUNCTION //////////////////////
var deck = new Deck(),
    Players, PLAYING = false;

//helper function to make code easier to read
function getID(x) {
    return document.getElementById(x);
}

function csvTO2d(object, item) {
    var string = localStorage.getItem(item);
    var data = string.split(',');
    var newArray = [];
    for (let k = 0; k < data.length; k += 2) {
        var tempArray = [];
        tempArray.push(parseInt(data[k]));
        tempArray.push(parseInt(data[k + 1]));
        object.push(tempArray);
    }
}

Array.prototype.last = function () {
    return this[this.length - 1];
}

function toggleWagers(bool) {
    var x = document.querySelectorAll(".wager");

    if (bool) {
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'mgame wager';
        }
    } else {
        for (let i = 0; i < x.length; i++) {
            x[i].className += ' locked';
        }
    }
}

function round(Tournament) {
    console.log(Players.last());
    getID('deal').className = 'hidden';
    getID('selectWager').className = 'hidden';
    getID('nextRound').className = 'hidden';
    getID('won').className = 'hidden';
    getID('loss').className = 'hidden';
    getID('tied').className = 'hidden';

    getID('stand').className = 'mgame action';
    getID('hit').className = 'mgame action';

    toggleWagers(false);

    var playerLength = Players.length - 1;
    PLAYING = true;

    if (deck.availableCards.length < Players.length * 5) {
        deck.combineDecks();
        deck.shuffle();
        deck.cut();
    }

    for (let i = 0; i < playerLength + 1; i++) {
        Players[i].returnCards();
    }

    // generates new values for wager and card balances.
    for (let i = 1; i < playerLength; i++) {
        Players[i].wagerBalanceCalc();
        Players[i].cardBalanceCalc();
    }

    deck.deal();

    //stores all players
    for (let i = 0; i < playerLength + 1; i++) {
        Players[i].store(i);
    }

    deck.store();

    //checking for naturals, dealer can have one
    var natural = false;
    for (let n = 1; n < playerLength + 1; n++) {
        if (Players[n].natural()) {
            natural = true;
        }
    }

    // if there is a natural then the game instantly ends, cards are evaled
    if (natural === false) {
        //turn for players before user
        var showPlayers = Math.floor(playerLength / 2) + 1;
        for (let l = 1; l < showPlayers; l++) {
            Players[l].turn = true;
            while (Players[l].turn) {
                if (Players[l].evaluate() < Players[l].cardBalance) {
                    Players[l].hit();
                } else {
                    Players[l].stand();
                }
            }
        }
    } else {
        settlement(false);
    }

    if (Tournament) {
        Players.last().rounds += 1;
    }

    if (Players.last().rounds >= 12) tournament();
}

function newGame(players) {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    toggleWagers(true);

    // Adds AI players to the page
    var hand0 = getID('hand0');
    var hand1 = getID('hand1');

    Players = [];
    deck = new Deck();

    deck.players = players;
    //adds dealer to array
    Players.push(new Dealer());

    for (let i = 1; i < players; i++) {
        //adds AI Players to array
        Players.push(new VirtualHand());
    }

    //adds player to array
    Players.push(new PlayerHand());

    //selects default wager
    var wager = Players.last().wager;
    getID(wager).className = 'mgame wager selected';

    deck.createDeck(6);
    deck.shuffle();
    deck.cut();
}

function settlement(noNatural) {
    PLAYING = false;

    getID('nextRound').className = "center bigGameButton";
    getID('stand').className += " locked";
    getID('hit').className += " locked";
    getID('winnings').innerHTML = Players.last().wager;
    getID('losings').innerHTML = Players.last().wager;
    getID('double').className = 'hidden';

    // unlocks wagers
    toggleWagers(true);

    // selects previously selected wager
    var wager = Players.last().wager;
    getID(wager).className = 'mgame wager selected';

    if (noNatural) {
        // Dealer and other player moves
        for (let l = 0; l < Players.length - 1; l++) {
            Players[l].turn = true;
            while (Players[l].turn) {
                if (Players[l].evaluate() < Players[l].cardBalance) {
                    Players[l].hit();
                } else {
                    Players[l].stand();
                }
            }
        }
    }
    // Settling
    for (let i = 1; i < Players.length; i++) {

        //if there is a natural
        if (noNatural === false) {
            // if the player has a natural
            if (Players[i].natural()) {
                Players[i].bank = Players[i].bank + (Players[i].wager * 1.5);
                // if the player is the user
                if (i === Players.length - 1) {
                    getID('won').className = "center";
                    getID('loss').className = "hidden";
                }
            }
            //if dealer goes bust and player still standing
        } else if (Players[0].evaluate > 21 && Players[i].evaluate < 21) {
            console.log('player ' + i + ' won ');
            Players[i].bank += Players[i].wager;

            if (i === Players.length - 1) {
                getID('won').className = "center";
                getID('loss').className = "hidden";
            }

            //if player goes bust or less than 21
        } else if (Players[i].evaluate() > 21 || Players[i].evaluate() < Players[0].evaluate()) {
            console.log('player ' + i + 'loss ');
            Players[i].bank -= Players[i].wager;

            if (i === Players.length - 1) {
                getID('loss').className = "center";
                getID('won').className = "hidden";
            }

            //if player is above dealer
        } else if (Players[i].evaluate() > Players[0].evaluate()) {
            console.log('player ' + i + 'won ');
            Players[i].bank += Players[i].wager;

            if (i === Players.length - 1) {
                getID('won').className = "center";
                getID('loss').className = "hidden";
            }
            //if they have the same value cards
        } else {
            console.log('player ' + i + 'tied ');

            if (i === Players.length - 1) {
                getID('tied').className = "center";
            }
        }
    }


    //    for (let i = 0; i < Players.length; i++) {
    //        Players[i].bank += Players[i].wager;
    //    }
}

function tournament() {
    prompt(':3');
}

function loadGame() {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    // ensures that 'the round 1 of 10" text is not displayed
    getID("roundText").className = "hidden";

    getID('dealer').style.marginTop = "0px";
    getID('dealer').style.marginLeft = "100px";

    toggleWagers(true);

    // Adds AI players to the page
    var hand0 = getID('hand0');
    var hand1 = getID('hand1');

    Players = undefined;
    // creates player array
    window.Players = [];
    //adds dealer to array
    Players.push(new Dealer());

    deck = undefined;
    window.deck = new Deck();

    //Function to map CSV to 2d array
    csvTO2d(deck.availableCards, 'availableCards');
    csvTO2d(deck.cutCards, 'cutCards');
    csvTO2d(deck.spentCards, 'spentCards');

    deck.players = parseInt(localStorage.getItem('players'));

    for (let i = 1; i < deck.players; i++) {
        //adds AI Players to array
        Players.push(new VirtualHand());
    }

    //adds player to array
    Players.push(new PlayerHand());

    //Function to map CSV to 2d array
    csvTO2d(Players[0].cards, 'cards');

    Players[0].turn = localStorage.getItem('turn');
    Players[0].cardBalance = localStorage.getItem('cardBalance');

    console.log(Players[0].cards);

    for (let j = 1; j < deck.players + 1; j++) {
        //Function to map CSV to 2d array
        csvTO2d(Players[j].cards, j + 'cards');

        Players[j].bank = parseInt(localStorage.getItem(j + 'bank'));
        Players[j].wager = parseInt(localStorage.getItem(j + 'wager'));
        Players[j].turn = localStorage.getItem(j + 'turn');
        Players[j].cardBalance = parseInt(localStorage.getItem(j + 'cardBalance'));

        if (j == deck.players) {
            Players[j].splitCards = localStorage.getItem(j + 'splitCards');
            Players[j].handle = localStorage.getItem(j + 'handle');
        } else {
            Players[j].wagerBalance = parseInt(localStorage.getItem(j + 'wagerBalance'));
        }
    }

    //selects default wager
    var wager = Players.last().wager;
    getID(wager).className = 'mgame wager selected';
}

function display() {
    // for bank

    //for (let i = 0; i < Players.length - 1; i++) {
    getID("total").innerHTML = Players.last().bank;
    //}

    // clearing dealer
    var dealerNode = getID("dealer");
    while (dealerNode.firstChild) {
        dealerNode.removeChild(dealerNode.firstChild);
    }

    // for each card in dealer hand
    var dealer = Players[0];

    // for showing back of card if no cards
    if (dealer.cards.length === 0 || PLAYING === true) {
        let card = [0, -1];
        let content = document.createTextNode(dealer.display(card));
        let span = document.createElement("span");
        span.className = "card";
        span.appendChild(content);
        dealerNode.appendChild(span);
    }

    let Cd = (PLAYING) ? 1 : 0;
    for (; Cd < dealer.cards.length; Cd++) {
        let card = dealer.cards[Cd];
        let content = document.createTextNode(dealer.display(card));

        let span = document.createElement("span");
        span.className = "card";
        span.appendChild(content);
        dealerNode.appendChild(span);
    }

    //clearing ai players
    for (let x = 1; x < 5; x++) {
        let aiNode = getID("ai" + (x));
        while (aiNode.firstChild) {
            aiNode.removeChild(aiNode.firstChild);
        }
    }

    //if there are ai players
    if (Players.length > 2) {

        //for each player
        for (let Pl = 1; Pl < deck.players; Pl++) {
            let aiNode = getID("ai" + (Pl));

            // for each card in their hand
            for (let Cd = 0; Cd < Players[Pl].cards.length; Cd++) {

                let card = Players[Pl].cards[Cd];
                let content = document.createTextNode(Players[Pl].display(card));

                let span = document.createElement("span");
                span.className = "card";
                span.appendChild(content);
                aiNode.appendChild(span);
            }
        }
    }

    // clearing player
    var playerNode = getID("player");
    while (playerNode.firstChild) {
        playerNode.removeChild(playerNode.firstChild);
    }

    // for each card in their hand
    var player = Players.last();
    for (let Cd = 0; Cd < player.cards.length; Cd++) {
        var card = player.cards[Cd];
        var content = document.createTextNode(player.display(card));

        var span = document.createElement("span");
        span.className = "card";
        span.appendChild(content);
        playerNode.appendChild(span);
    }
}

////////////////////// CLICKING //////////////////////
getID('game').onclick = makeClicker("gameScreen");
getID('rules').onclick = makeClicker("rulesScreen");
getID('leaderboard').onclick = makeClicker("leaderboardScreen");
getID('exit').onclick = makeClicker("exit");
getID('create').onclick = makeClicker("gameScreen2");
getID('10').onclick = makeWager("10");
getID('50').onclick = makeWager("50");
getID('100').onclick = makeWager("100");
var main = makeClicker("mainScreen");
var play = makeClicker("mainGame");

function makeClicker(Button) {
    return function () {
        var x = document.querySelectorAll(".screen");
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'screen hidden';
        }
        getID(Button).className = 'screen';
    };
}

function makeWager(Button) {
    return function () {
        if (PLAYING === false) {
            Players.last().wager = Button;

            //select all wagers and unselect them
            toggleWagers(true);

            //add the class selected to the clicked wager
            getID(Button).className = 'mgame wager selected';
        }
    };
}

var y = document.querySelectorAll(".return");
for (let k = 0; k < y.length; k++) {
    y[k].onclick = main;
}

getID('decPlayers').onclick = function () {
    if (deck.players > 1) deck.players--;
};

getID('incPlayers').onclick = function () {
    if (deck.players < 5) deck.players++;
};

getID('play').onclick = function () {
    // ensures that 'the round 1 of 10" text is not displayed
    getID("roundText").className = "hidden";
    getID('deal').className = "bigGameButton center";
    getID('nextRound').className = "hidden";
    getID('selectWager').className = "center";

    getID('dealer').style.marginTop = "0px";
    getID('dealer').style.marginLeft = "100px";

    newGame(deck.players);
};

getID('previous').onclick = function () {
    loadGame();
};

getID('tournament').onclick = function () {
    getID('roundText').className = "inline";
    getID('deal').className = "center bigGameButton";
    getID('nextRound').className = "hidden";
    getID('selectWager').className = "center";

    getID('dealer').style.marginTop = "-75px";
    getID('dealer').style.marginLeft = "100px";

    newGame(1);


    Players.last().rounds = 1;
    Players.last().handle = prompt('Handle: ');
};

getID('hit').onclick = function () {
    if (PLAYING === true) {
        Players.last().hit();
    }
};

getID('stand').onclick = function () {
    if (PLAYING === true) {
        Players.last().stand();
    }
};

getID('double').onclick = function () {
    Players.last().double();
    settlement(true);
};

getID('deal').onclick = function () {
    round(Players.last().rounds);
};

getID('nextRound').onclick = function () {
    round(Players.last().rounds);
};

window.setInterval(function () {
    getID('players').innerHTML = deck.players;
    display();

    if (PLAYING === true) {
        let user = Players.last();
        if (user.evaluate() > 21) {
            settlement(true);
        }

        if (user.evaluate() > 8 && user.evaluate() < 12) {
            getID('double').className = "mgame action inline";
        }
    }

    if (Players.last().rounds) {
        getID('rounds').innerHTML = Players.last().rounds - 1;
    }

}, 100);
