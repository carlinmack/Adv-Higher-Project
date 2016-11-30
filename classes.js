/*jshint esversion: 6 */
/*globals console:false */
class Deck {
    constructor() {
        //initialises arrays for cards
        this.availableCards = [];
        this.cutCards = [];
        this.spentCards = [];
    }

    createDeck(decks) {
        //As there are 4 suits per deck it needs to be multiplied for the loop
        decks *= 4;
        //for the amount of suits
        for (var j = 0; j < decks; j++) {
            //and the amount of cards in a suit
            for (var i = 0; i < 14; i++) {
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
        for (var i = 0; i > len(players); i++) {}
    }

    hit() {
        return this.availableCards.pop();
    }

    combineDecks() {
        // when availableCards is empty, push cut and spent cards to it
    }

    store()
}

class Dealer {
    constructor() {
        this.cards = [];
        this.players = 2;
    }

    display() {
        //Change [0, 2] to A ♦
        var prefix = "0x0001F0",
            suit = "",
            cardVal, temp;
        this.cards.forEach(function (card) {
            var suits = {
                '0': 'A',
                '1': 'B',
                '2': 'C',
                '3': 'D'
            };
            suit = suits[card[0]];
            cardVal = (card[1] + 1).toString(16);
            temp = prefix.concat(suit, cardVal);
            return String.fromCodePoint(temp);
        });
    }

    evaluate() {
        var value = 0;
        for (var k = 0; k < array.length; k++) {
            if (array[k][1] < 10) {
                value += array[k][1] + 1;
            } else {
                value += 10;
            }
        }
        return value;
    }

    stand() {
        //end turn
    }

    hit() {
        //take card from start of queue
        this.cards.push(deck.hit());
    }

    store() {}
}

class VirtualHand extends Dealer {
    constructor() {
        this.bank = 5000
        this.cards = [];
        this.players = 2;
    }

    wager() {
        let wager = Math.floor(Math.random() * 3);
    }

    store() {}
}

class PlayerHand extends Dealer {
    constructor() {
        this.bank = 5000;
        this.wager = 50;
        this.splitCards = [];
        this.handle = "";
    }

    display() {}

    double() {
        //double wager
        //receive card
        //end turn
    }

    splitCards() {
        //create two seperate hands
    }

    store() {}
}



//// MAIN FUNCTION ////
var deck = new Deck();
var dealer = new Dealer();
var player = new PlayerHand();
var Players = new Array();
Players.push(dealer);

function newGame() {
    dealer.players = 5; //Number from GUI
    for (var i = 1; i < dealer.players; i++) {
        Players.push(new VirtualHand);
    }

    Players.push(player);

    deck.CreateDeck(6)
    deck.shuffle()
    deck.cut()
}

/*
MAIN
var cases = {
    1: doX,
    2: doY,
    3: doN
};
if (cases[something]) {
    cases[something]();
}
*/
