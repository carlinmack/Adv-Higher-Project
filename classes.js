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
            for (let i = 0; i < 13; i++) {
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
        for (let i = 0; i < this.availableCards.length / 5; i++) {
            this.cutCards.push(this.availableCards.pop());
        }
    }

    deal() {
        //deal 2 cards to each player and the dealer
    }

    combineDecks() {
        // when availableCards is empty, push cut and spent cards to it
    }
}

class Dealer {
    constructor() {
        this.cards = [];
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
        switch (this.cards[1]) {
        case 0:
            this.value = 1;
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            this.value = this.cards[1] + 1;
            break;
        case 10:
        case 12:
        case 13:
            this.value = 10;
            break;
        }
    }

    stand() {
        //end turn
    }

    hit() {
        //take next card from queue
        //continue turn
    }
}

class VirtualHand extends Dealer {
    wager() {
        let wager = Math.floor(Math.random() * 3);
    }

    hit() {}

    stand() {}
}

class PlayerHand extends Dealer {
    hit() {
        //take next card from queue
        //continue turn
    }

    double() {
        //double wager
        //receive card
        //end turn
    }

    splitCards() {
        //create two seperate hands
    }
}

var deck = new Deck();
console.log(deck.availableCards);
//creates 6 decks - CHANGE: make user input
deck.createDeck(1);
console.log(deck.availableCards);
console.log(deck.shuffle());



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
