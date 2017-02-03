// following are debug comment lines

/*jshint esversion: 6 */
/*globals console:false */
/*globals document:false */
/*globals window:false */
/*globals localStorage:false */

// end debug lines



/*TODO
    JAVASCRIPT
        storing and loading
        double

        leaderboard
        split method
        red cards
        fix bug if always lose
        fragments

        when return remove all objects?

    UI
        AI play stopping
        add banks
        winning tournament text
        split cards
        hide dealer first card
        big margin for tournament/1 player
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
        this.cardBalance = 16;
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
    getID('tied').className = 'hidden';

    getID('stand').className = 'mgame action';
    getID('hit').className = 'mgame action';

    var x = document.querySelectorAll(".wager");
    for (let i = 0; i < x.length; i++) {
        x[i].className += ' locked';
    }

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
    for (let i = 0; i < playerLength; i++) {
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

    //selects default wager
    var wager = Players[Players.length - 1].wager;
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
    getID('winnings').innerHTML = Players[Players.length - 1].wager;
    getID('losings').innerHTML = Players[Players.length - 1].wager;
    getID('double').className = 'hidden';

    // unlocks wagers
    var x = document.querySelectorAll(".wager");
    for (let i = 0; i < x.length; i++) {
        x[i].className = 'mgame wager';
    }

    // selects previously selected wager
    var wager = Players[Players.length - 1].wager;
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
        console.log('player ' + i);

        //if dealer goes bust and player still standing
        if (Players[0].evaluate > 21 && Players[i].evaluate < 21) {
            console.log('won ');

            if (i === Players.length - 1) {
                getID('won').className = "center";
                getID('loss').className = "hidden";
            }

            Players[i].bank += Players[i].wager;

            //if player goes bust or less than 21
        } else if (Players[i].evaluate() > 21 ||
            Players[i].evaluate() < Players[0].evaluate()) {
            console.log('loss ');

            if (i === Players.length - 1) {
                getID('loss').className = "center";
                getID('won').className = "hidden";
            }

            Players[i].bank -= Players[i].wager;

            //if player is above dealer
        } else if (Players[i].evaluate() > Players[0].evaluate()) {
            console.log('won ');

            if (i === Players.length - 1) {
                getID('won').className = "center";
                getID('loss').className = "hidden";
            }

            Players[i].bank += Players[i].wager;
        } else {
            console.log('tied ');

            if (i === Players.length - 1) {
                getID('tied').className = "center";
            }

            // tied, do nothing
        }



    }


    //    for (let i = 0; i < Players.length; i++) {
    //        Players[i].bank += Players[i].wager;
    //    }
}

function loadGame() {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    // ensures that 'the round 1 of 10" text is not displayed
    getID("roundText").className = "hidden";

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

    deck = new Deck();

    //Function to map CSV to 2d array
    var string0 = localStorage.getItem('availableCards');
    var data0 = string0.split(',');
    var newArray0 = []
    for (let i = 0; i < data0.length; i += 2) {
        var tempArray0 = []
        tempArray0.push(data0[i])
        tempArray0.push(data0[i + 1])
        deck.availableCards.push(tempArray0);
    }

    deck.cutCards = localStorage.getItem('cutCards');
    deck.spentCards = localStorage.getItem('spentCards');
    deck.players = localStorage.getItem('players');

    for (let i = 1; i < deck.players; i++) {
        //adds AI Players to array
        Players.push(new VirtualHand());
    }

    //adds player to array
    Players.push(new PlayerHand())

    //Function to map CSV to 2d array
    var string1 = localStorage.getItem('cards');
    var data1 = string1.split(',');
    var newArray1 = []
    for (let i = 0; i < data1.length; i += 2) {
        var tempArray1 = []
        tempArray1.push(data1[i])
        tempArray1.push(data1[i + 1])
        Players[0].cards.push(tempArray1);
    }

    Players[0].turn = localStorage.getItem('turn');
    Players[0].cardBalance = localStorage.getItem('cardBalance');

    console.log(Players[0].cards);

    for (let i = 1; i < 60; i++) {
        //Function to map CSV to 2d array
        var string = localStorage.getItem(i + 'cards');
        var data = string.split(',');
        var newArray = []
        for (let j = 0; j < data.length; j += 2) {
            var tempArray = []
            tempArray.push(data[j])
            tempArray.push(data[j + 1])
            Players[i].cards.push(tempArray);
        }

        Players[i].bank = localStorage.getItem(i + 'bank');
        Players[i].wager = localStorage.getItem(i + 'wager');
        alert(i + " " + deck.players);
        if (i == deck.players) {
            alert("player");
            Players[i].splitCards = localStorage.getItem(i + 'splitCards');
            Players[i].handle = localStorage.getItem(i + 'handle');
            alert('player');
        } else {
            Players[i].turn = localStorage.getItem(i + 'turn');
            Players[i].wagerBalance = localStorage.getItem(i + 'wagerBalance');
            Players[i].cardBalance = localStorage.getItem(i + 'cardBalance');
        }
    }
    console.log(Players);

    //selects default wager
    var wager = Players[Players.length - 1].wager;
    getID(wager).className = 'mgame wager selected';
    alert('6');
}

function tournament() {
    // hides other screens, displays main game
    play();
    PLAYING = false;

    getID('roundText').className = "inline";
    getID('deal').className = "center bigGameButton";
    getID('nextRound').className = "hidden";
    getID('selectWager').className = "center";

    getID('dealer').style.marginTop = "-75px";
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
            Players[Players.length - 1].wager = Button;

            //select all wagers and unselect them
            var x = document.querySelectorAll(".wager");
            for (let i = 0; i < x.length; i++) {
                x[i].className = 'mgame wager';
            }

            //add the class selected to the clicked wager
            getID(Button).className = 'mgame wager selected';
        }
    }
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
    newGame();
};

getID('previous').onclick = function () {
    loadGame();
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

getID('double').onclick = function () {
    Players[Players.length - 1].double();
    settlement(true);
};

getID('deal').onclick = function () {
    round();
};

getID('nextRound').onclick = function () {
    round();
};

window.setInterval(function () {
    getID('players').innerHTML = deck.players;
    display();

    if (PLAYING === true) {
        let user = Players[Players.length - 1];
        if (user.evaluate() > 21) {
            settlement(true);
        }

        if (user.evaluate() > 8 && user.evaluate() < 12) {
            getID('double').className = "mgame action inline";
        }
    }

}, 100);

/* SPLIT and DOUBLE

change hidden to inline
*/
