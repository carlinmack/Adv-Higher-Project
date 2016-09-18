class Deck {
    constructor() {
        this.availableCards = [];
        this.spentCards = [];
    }

    createDeck(decks) {
        decks *= 4;
        for (var j = 0; j < decks; j++) {
            this.availableCards.push(new Array());
            for (let i = 0; i < 13; i++) {
                this.availableCards[j][i] = i;
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
}

class Dealer {
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
deck.createDeck(6);
console.log(deck.availableCards);
console.log(deck.shuffle());
