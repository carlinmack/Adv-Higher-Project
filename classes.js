class Deck {
    constructor() {
        //initialises arrays for cards
        this.availableCards = [];
        this.spentCards = [];
    }

    createDeck(decks) {
        decks *= 4; //As there are 4 suits per deck it needs to be multiplied for the loop
        for (var j = 0; j < decks; j++) {;  //for the amount of suits
            for (let i = 0; i < 13; i++) {  //and the amount of cards
                this.availableCards.push([j,i]); // adds a card to the main array
            }
        }
    }

    shuffle() {
        //fisher-yates shuffle
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {
            m -= 1; // Decrease number of remaining cards
            // Pick a remaining element…
            i = Math.floor(Math.random() * m);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    cut() {
        //remove last 20% of cards
        for (let i = 0; i < this.availableCards/5; i++) this.availableCards.pop();
    }

    deal() {

    }
}

class Dealer {
    cards = [];

    stand() {
        //end turn
    }

    hit() {
        //take next card from queue
        //continue turn
    }
}

class Hand extends Dealer {
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
deck.createDeck(6); //creates 6 decks - CHANGE: make user input
console.log(deck.availableCards);
console.log(deck.shuffle());
