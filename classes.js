// following are debug comment lines
/*jshint esversion: 6 */
/*globals console:false */
/*globals document:false */
/*globals window:false */
/*globals localStorage:false */
// end debug lines

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

    cut() {
        //remove last 20% of cards
        var len = this.availableCards.length / 5;
        for (let i = 0; i < len; i++) {
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
        localStorage.cutCards = this.availableCards;
        localStorage.spentCards = this.availableCards;
        localStorage.players = this.players;
    }
}

class Dealer {
    constructor() {
        this.cards = [];
        this.turn = false;
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
        for (let k = 0; k < this.cards.length; k++) {
            if (this.cards[k][1] < 10) {
                value += this.cards[k][1] + 1;
            } else {
                value += 10;
            }
        }
        return value;
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
        localStorage.availableCards = this.availableCards;
        localStorage.cutCards = this.cutCards;
        localStorage.spentCards = this.spentCards;
        localStorage.players = this.players;
    }
}

class VirtualHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wagerBalance = 0;
        this.cardBalance = 16;
    }

    wagerBalanceCalc() {
        this.wagerBalance = Math.floor(Math.random() * 3);
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
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wagerBalance", this.wagerBalance);
        localStorage.setItem(i + "cardBalance", this.cardBalance);
    }
}

class PlayerHand extends Dealer {
    constructor() {
        super();
        this.bank = 5000;
        this.wager = 50;
        this.splitCards = [];
        this.handle = "";
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
        settlement();
    }

    double() {
        this.hit();
        this.wager += this.wager;
        PLAYING = false;
        //double wager
        //receive card
        //end playing
    }

    splitCards() {
        //create two seperate hands
        this.splitCards.push(this.cards.pop);
    }

    store(i) {
        localStorage.setItem(i + "bank", this.bank);
        localStorage.setItem(i + "wager", this.wager);
        localStorage.setItem(i + "splitCards", this.splitCards);
        localStorage.setItem(i + "handle", this.handle);
    }
}

////////////////////// MAIN FUNCTION //////////////////////
var deck = new Deck(),
    Players = [],
    PLAYING = false;

//helper function to make code easier to read
function getID(x) {
    return document.getElementById(x);
}

function round() {
    getID('deal').className = 'hidden';
    getID('selectWager').className = 'hidden';
    getID('nextRound').className = 'hidden';
    getID('won').className = 'hidden';
    getID('loss').className = 'hidden';

    getID('stand').className = 'mgame action';
    getID('hit').className = 'mgame action';

    var x = document.querySelectorAll(".wager");
    for (let i = 0; i < x.length; i++) {
        x[i].className += ' locked';
    }


    var playerLength = Players.length - 1;
    PLAYING = true;

    for (let i = 0; i < playerLength + 1; i++) {
        Players[i].returnCards();
    }

    // generates new values for wager and card balances.
    for (let i = 1; i < playerLength - 1; i++) {
        Players[i].wagerBalanceCalc();
        Players[i].cardBalanceCalc();
    }

    deck.deal();

    for (let i = 0; i < playerLength; i++) {
        Players[i].store(i);
    }

    deck.store();

    //checking for naturals, dealer can have one
    var natural = false;
    for (let n = 1; n < playerLength; n++) {
        if (Players[n].natural()) {
            natural = true;
        }
    }

    // if there is a natural then the game instantly ends, cards are evaled
    if (natural === false) {
        for (let l = 1; l < playerLength; l++) {
            // Players[l].turn = true;
            while (Players[l].turn) {
                if (Players[l].evaluate() > Players[l].cardBalance) {
                    //Players[l].hit();
                } else {
                    //Players[l].stand();
                }
            }
        }
    } else {
        settlement();
    }

    //while (PLAYING) {
    //}
}

function newGame() {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    // ensures that 'the round 1 of 10" text is not displayed
    getID("roundText").className = "hidden";
    getID('deal').className = "bigGameButton center";
    getID('nextRound').className = "hidden";
    getID('selectWager').className = "center";

    getID('dealer').style.marginTop = "0px";
    getID('dealer').style.marginLeft = "100px";

    var x = document.querySelectorAll(".wager");
    for (let i = 0; i < x.length; i++) {
        x[i].className = 'mgame wager';
    }

    // Adds AI players to the page
    var hand0 = getID('hand0');
    var hand1 = getID('hand1');

    // creates player array
    Players = [];
    //adds dealer to array
    Players.push(new Dealer());

    for (let i = 1; i < deck.players; i++) {
        //adds AI Players to array
        Players.push(new VirtualHand());
    }

    //adds player to array
    Players.push(new PlayerHand());

    var wager = Players[Players.length - 1].wager;
    getID(wager).className = 'mgame wager selected';

    deck.createDeck(6);
    deck.shuffle();
    deck.cut();
    //    while (playing) {
    //        if (deck.availableCards.length > 4 * Players.length) {
    //
    //        } else {
    //            deck.combineDecks();
    //            deck.shuffle();
    //            deck.cut();
    //        }
    //    }
}

function settlement() {
    PLAYING = false;

    getID('nextRound').className = "center bigGameButton";
    getID('won').className = "center";
    getID('stand').className += " locked";
    getID('hit').className += " locked";
    getID('winnings').innerHTML = Players[Players.length - 1].wager;

    var x = document.querySelectorAll(".wager");
    for (let i = 0; i < x.length; i++) {
        x[i].className = 'mgame wager';
    }

    var wager = Players[Players.length - 1].wager;
    getID(wager).className = 'mgame wager selected';

    for (let i = 0; i < Players.length; i++) {
        Players[i].bank += Players[i].wager;
    }
}

function loadGame() {
    deck.availableCards = localStorage.getItem('availableCards');
    deck.cutCards = localStorage.getItem('cutCards');
    deck.spentCards = localStorage.getItem('spentCards');
    deck.players = localStorage.getItem('players');

    Players[0].cards = localStorage.getItem('0cards');

    for (let i = 1; i < Players.length + 1; i++) {
        Players[i].cards = localStorage.getItem(i + 'cards');
        Players[i].bank = localStorage.getItem(i + 'bank');
        Players[i].balance = localStorage.getItem(i + 'balance');

        if (i === Players.length) {
            Players[i].cards = localStorage.getItem(i + 'cards');
            Players[i].bank = localStorage.getItem(i + 'bank');
            Players[i].wager = localStorage.getItem(i + 'wager');
            Players[i].splitCards = localStorage.getItem(i + 'splitCards');
            Players[i].handle = localStorage.getItem(i + 'handle');
        }
    }
}

function tournament() {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    getID('roundText').className = "inline";
    getID('deal').className = "center bigGameButton";
    getID('nextRound').className = "hidden";
    getID('selectWager').className = "inline";

    getID('dealer').style.marginTop = "-50px";
    getID('dealer').style.marginLeft = "100px";

    Players = [];

    Players.push(new Dealer()); //adds dealer to array
    Players.push(new PlayerHand()); //adds player to array

    deck.createDeck(6);
    deck.shuffle();
    deck.cut();

    Players[Players.length - 1].handle = prompt('Handle: ');

    //for (let i = 0; i < 10; i++) {
    // idk when this happens or how but it'll be banter right
    //}

    //Sort leaderboard
}

function display() {
    // for bank

    //for (let i = 0; i < Players.length - 1; i++) {
    getID("total").innerHTML = Players[Players.length - 1].bank;
    //}

    // clearing dealer
    var dealerNode = getID("dealer");
    while (dealerNode.firstChild) {
        dealerNode.removeChild(dealerNode.firstChild);
    }

    // for each card in dealer hand
    var dealer = Players[0];
    for (let Cd = 0; Cd < dealer.cards.length; Cd++) {
        let card = dealer.cards[Cd];
        let content = document.createTextNode(dealer.display(card));

        let span = document.createElement("span");
        span.className = "card";
        span.appendChild(content);
        dealerNode.appendChild(span);
    }

    // for showing back of card if no cards
    if (dealer.cards.length === 0) {
        let card = [0, -1];
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
    var player = Players[Players.length - 1];
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
var main = makeClicker("mainScreen");
var game = makeClicker("gameScreen");
var rules = makeClicker("rulesScreen");
var leaderboard = makeClicker("leaderboardScreen");
var exit = makeClicker("exit");
var play = makeClicker("mainGame");
var game2 = makeClicker("gameScreen2");


function makeClicker(Button) {
    return function () {
        var x = document.querySelectorAll(".screen");
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'screen hidden';
        }
        getID(Button).className = 'screen';
    };
}

getID('game').onclick = game;
getID('create').onclick = game2;
getID('rules').onclick = rules;
getID('leaderboard').onclick = leaderboard;
getID('exit').onclick = exit;

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
    newGame();
};

getID('tournament').onclick = function () {
    tournament();
};

getID('hit').onclick = function () {
    if (PLAYING === true) {
        Players[Players.length - 1].hit();
    }
};

getID('stand').onclick = function () {
    if (PLAYING === true) {
        Players[Players.length - 1].stand();
    }
};

getID('deal').onclick = function () {
    round();
};

getID('nextRound').onclick = function () {
    round();
};

getID('10').onclick = function () {
    if (PLAYING === false) {
        Players[Players.length - 1].wager = 10;

        //select all wagers and unselect them
        var x = document.querySelectorAll(".wager");
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'mgame wager';
        }

        //add the class selected to the clicked wager
        getID('10').className = 'mgame wager selected';
    }
};

getID('50').onclick = function () {
    if (PLAYING === false) {
        Players[Players.length - 1].wager = 50;

        var x = document.querySelectorAll(".wager");
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'mgame wager';
        }
        getID('50').className = 'mgame wager selected';
    }
};

getID('100').onclick = function () {
    if (PLAYING === false) {
        Players[Players.length - 1].wager = 100;

        var x = document.querySelectorAll(".wager");
        for (let i = 0; i < x.length; i++) {
            x[i].className = 'mgame wager';
        }
        getID('100').className = 'mgame wager selected';
    }
};

window.setInterval(function () {
    getID('players').innerHTML = deck.players;
    display();

    if (PLAYING === true && Players[Players.length - 1].evaluate() > 21) {
        settlement();
    }

}, 100);

/* DISPLAYING PLAYER MOVES

var display = Math.floor(playerLength / 2);
    for (let j = 1; j < display + 1; j++) {
    */

/* SPLIT and DOUBLE

change hidden to inline
*/
