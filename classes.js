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
        return("a");
        //fisher-yates shuffle
    }

    cut() {
        //remove last 20% of cards
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
