// following are debug comment lines

/* jshint esversion: 6 */
/* globals prompt:false */
/* globals document:false */
/* globals window:false */
/* globals localStorage:false */

// end debug lines

/*TODO
    JAVASCRIPT
		recombining decks
        split method
		store leaderboard and load it (:

    BUGS
        always losing destroys game
        if other people have a natural?

    UI
        change margins so that nothing moves
        style tied

    EFFICIENCY
        simplify duplicated code
        don't update hidden things
		only update cards when they need to
		only check double and split once

    STRETCH GOALS
        delay ai players turns a bit
        new game button below 500
        getIDs function mess
		fix jank
*/

class Deck {
	constructor() {
		// initialises arrays for cards
		this.availableCards = [];
		this.cutCards = [];
		this.spentCards = [];
		// initialises default number of players
		this.players = 5;
	}

	createDeck(decks) {
		// As there are 4 suits per deck it needs to be multiplied for the loop
		decks *= 4;
		// for the amount of suits
		for (let j = 0; j < decks; j++) {
			// and the amount of cards in a suit
			for (let i = 0; i < 14; i++) {
				if (i === 11) {
					// unicode has a knight card which is not needed for the game
				} else {
					// adds a card to the front of the main array
					this.availableCards.unshift([j, i]);
				}
			}
		}
	}

	shuffle() {
		// fisher-yates shuffle
		var length = this.availableCards.length,
			temp, card;
		// While there remain elements to shuffle…
		while (length) {
			// Decrease number of remaining cards
			length -= 1;
			// Pick a remaining element…
			card = Math.floor(Math.random() * length);
			// And swap it with the current element.
			temp = this.availableCards[length];
			this.availableCards[length] = this.availableCards[card];
			this.availableCards[card] = temp;
		}
	}

	// remove last 20% of cards
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
		// deal 2 cards to each player and the dealer
		for (let i = 0; i < Players.length; i++) {
			// adds the last two cards of the deck to the front of the Players cards
			Players[i].cards.unshift(this.availableCards.pop());
			Players[i].cards.unshift(this.availableCards.pop());
		}
	}

	hit() {
		// returns the last card of the deck and removes it from the array
		return this.availableCards.pop();
	}

	returnCards(card) {
		// add the cards from the player to the end of the array
		this.spentCards.push(card);
	}

	combineDecks() {
		// add cut and spent cards to the end of available cards
		for (let i = this.cutCards.length; i > 0; i -= 2) {
			let tempArray = [];
			// push two items to the array
			tempArray.push(this.cutCards.pop());
			tempArray.push(this.cutCards.pop());
			// adds the two index array (a card) to the object
			this.availableCards.push(tempArray);
		}
		for (let j = this.spentCards.length; j > 0; j -= 2) {
			let tempArray = [];
			// push two items to the array
			tempArray.push(this.spentCards.pop());
			tempArray.push(this.spentCards.pop());
			// adds the two index array (a card) to the object
			this.availableCards.push(tempArray);
		}
	}

	store() {
		// store all object parameters
		localStorage.availableCards = this.availableCards;
		localStorage.cutCards = this.cutCards;
		localStorage.spentCards = this.spentCards;
		localStorage.players = this.players;
		localStorage.playing = PLAYING;
	}
}

class Dealer {
	constructor() {
		this.cards = [];
		this.turn = false;
		this.cardBalance = 17;
	}

	// Change [0, 2] to A ♦
	display(card) {
		var prefix = "0x0001F0",
			suit = "",
			cardVal, temp;

		var suits = {
				'0': 'A',
				'1': 'B',
				'2': 'C',
				'3': 'D'
			},
			colour = {
				'0': 'black',
				'1': 'red',
				'2': 'red',
				'3': 'black'
			};

		// takes the first value, finds the remainder it has with 4 and casts it to a string
		var value = (card[0] % 4).toString();
		// select which suit by passing the raw value into the object, which returns the unicode suit value
		suit = suits[value];
		// adds one to the card value and converts it into hexadecimal
		cardVal = (card[1] + 1).toString(16);
		// concatenates the suit and the card value
		temp = prefix.concat(suit, cardVal);
		// 1. returns a string from the unicode code point
		// 2. returns the colour by passing in the suit value  which returns the respective colour
		return [String.fromCodePoint(temp), colour[value]];
	}

	evaluate() {
		var value = 0;
		var flag = false;

		// for each card
		for (let k = 0; k < this.cards.length; k++) {
			// if card is an ace and they don't have another ace
			if (this.cards[k][1] === 0 && flag === false) {
				value += 11;
				flag = true;
			}
			// if card is less than ten, value of it is card val + 1
			else if (this.cards[k][1] < 10) {
				value += this.cards[k][1] + 1;
			} else {
				// all cards above ten are valued at 10
				value += 10;
			}
		}
		// if there is an ace (11) and the value is over 21 then the ace should be worth 1
		if (flag && value > 21) {
			value -= 10;
			return value;
		} else {
			return value;
		}
	}

	natural() {
		// if the first card is an ace and the second card is over 9
		if (this.cards[0][1] === 0 && this.cards[1][1] > 8) {
			return true;
			// if the first card is over 9 and the second card is an ace
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
		// take card from start of queue
		this.cards.push(deck.hit());
	}

	returnCards() {
		// for all cards
		for (let i = this.cards.length; i > 0; i--) {
			// .pop() removes the last index and returns it
			var temp = this.cards.pop();
			// returns the index to deck
			deck.returnCards(temp);
		}
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
		// chooses a random number between 0 and 2
		this.wagerBalance = Math.floor(Math.random() * 3);
		// selects the relevant wager
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
		// to get a normal (bell curve) distribution I'm adding two random numbers
		// not a statistically sound method but it should do the trick
		var max = 9;
		var min = 7;
		// standard formula to select a random number in a range
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

	stand() {
		settlement(true, true);
	}

	returnCards() {
		// for all cards
		for (let i = this.cards.length; i > 0; i--) {
			// .pop() removes the last index and returns it. Then returns the index to deck
			deck.returnCards(this.cards.pop());
		}
		// if there are split cards, remove them
		if (this.splitCards.length) {
			for (let j = this.splitCards.length; j > 0; j--) {
				// .pop() removes the last index and returns it. Then returns the index to deck
				deck.returnCards(this.splitCards.pop());
			}
		}
	}

	splitCardsCheck() {
		// if the cards have the same value
		if (this.cards[0][1] === this.cards[1][1]) {
			return true;
			// or if they are both valued above 9
		} else if (this.cards[0][1] > 8 && this.cards[1][1] > 8) {
			return true;
		} else {
			return false;
		}
	}

	splitTheCards() {
		// create two seperate hands
		this.splitCards.push(this.cards.pop());
		// hit to player hand
		this.hit();
		// hit to splitCards
		this.hit();
		this.splitCards.push(this.cards.pop());
	}

	store(i) {
		localStorage.setItem(i + "cards", this.cards);
		localStorage.setItem(i + "turn", this.turn);
		localStorage.setItem(i + "cardBalance", this.cardBalance);
		localStorage.setItem(i + "bank", this.bank);
		localStorage.setItem(i + "wager", this.wager);
		localStorage.setItem(i + "splitCards", this.splitCards);
		localStorage.setItem(i + "handle", this.handle);
		localStorage.setItem(i + "rounds", this.rounds);
	}
}

////////////////////// MAIN FUNCTION //////////////////////
var deck = new Deck(),
	Players, PLAYING = false;

// helper function to make code easier to read
function getID(x) {
	return document.getElementById(x);
}

// helper function to make code easier to read
function styleID(x) {
	return document.getElementById(x).style;
}

// helper function to parse CSV formatted cards in localstorage to 2D array so that they can be loaded properly
function parse2D(object, item) {
	var string = localStorage.getItem(item);
	// splits the string into an array on commas
	var data = string.split(',');
	// for every second index of the array
	for (let k = 0; k < data.length; k += 2) {
		var tempArray = [];
		// push two items to the array
		tempArray.push(parseInt(data[k]));
		tempArray.push(parseInt(data[k + 1]));
		// adds the two index array (a card) to the object
		object.push(tempArray);
	}
}

// helper function so I don't have to write
// Players[Players.length - 1] to access the user
Array.prototype.last = function () {
	return this[this.length - 1];
};

function toggleWagers(bool) {
	var x = document.querySelectorAll(".wager");

	if (bool) {
		for (let i = 0; i < x.length; i++) {
			// remove locked css
			x[i].className = 'mgame wager';
		}
	} else {
		for (let i = 0; i < x.length; i++) {
			// lock the buttons
			x[i].className += ' locked';
		}
	}
}

function round(Tournament) {
	getID('deal').className = 'hidden';
	getID('selectWager').className = 'hidden';
	getID('nextRound').className = 'hidden';
	getID('won').className = 'hidden';
	getID('loss').className = 'hidden';
	getID('tied').className = 'hidden';
	getID('loseTour').className = "hidden";
	getID('winTourn').className = "hidden";

	getID('stand').className = 'mgame action';
	getID('hit').className = 'mgame action';

	toggleWagers(false);

	var playerLength = Players.length;
	PLAYING = true;

	// if there aren't enough cards to play the next round
	if (deck.availableCards.length < playerLength * 5) {
		deck.combineDecks();
		deck.shuffle();
		deck.cut();

	}

	// generates new values for wager and card balances.
	for (let i = 1; i < playerLength-1; i++) {
		Players[i].wagerBalanceCalc();
		Players[i].cardBalanceCalc();
	}

	// returns the cards if there was a previous round
	if (Players[0].cards.length) {
		for (let i = 0; i < playerLength; i++) {
			Players[i].returnCards();
		}
	}

	if (Players.last().rounds > 10) {
		tournament(Players.last().bank, Players.last().handle);
		return;
	}

	deck.deal();

	// stores all players
	for (let i = 0; i < playerLength; i++) {
		Players[i].store(i);
	}

	deck.store();

	// checking for naturals, dealer can have one
	var natural = false;
	for (let n = 1; n < playerLength; n++) {
		if (Players[n].natural()) {
			natural = true;
		}
	}


	if (natural === false) {
		// turn for players before user
		var showPlayers = Math.floor((playerLength-1) / 2) + 1;
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
		// if there is a natural then the game instantly ends, cards are evaled
	} else {
		settlement(false, true);
	}

	if (Tournament) {
		Players.last().rounds += 1;
	}
}

function newGame(players) {
	// hides other screens, displays main game
	play();

	getID('deal').className = "bigGameButton center";
	getID('nextRound').className = "hidden";
	getID('selectWager').className = "center";
	getID('double').className = "hidden";
	getID('split').className = "hidden";
	getID('loseTour').className = "hidden";
	getID('winTourn').className = "hidden";

	PLAYING = false;

	toggleWagers(true);

	Players = [];
	deck = new Deck();

	deck.players = players;
	// adds dealer to array
	Players.push(new Dealer());

	for (let i = 1; i < players; i++) {
		// adds AI Players to array
		Players.push(new VirtualHand());
	}

	// adds player to array
	Players.push(new PlayerHand());

	// selects default wager
	var wager = Players.last().wager;
	getID(wager).className = 'mgame wager selected';

	deck.createDeck(6);
	deck.shuffle();
	deck.cut();
}

function settlement(noNatural, noDouble) {
	PLAYING = false;

	getID('nextRound').className = "center bigGameButton";
	getID('player').className = 'inline';
	getID('stand').className += " locked";
	getID('hit').className += " locked";
	getID('double').className = 'hidden';
	getID('split').className = 'hidden';

	// unlocks wagers
	toggleWagers(true);

	// selects previously selected wager
	var wager = Players.last().wager;
	getID(wager).className = 'mgame wager selected';

	// Dealer and other player moves if there isn't a natural
	if (noNatural) {
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

	if (noNatural === false) {
		// sets the players augmented wager if they have a natural
		if (Players.last().natural()) {
			Players.last().wager = Players.last().wager * 1.5;
		}
	}

	if (noDouble === false) {
		// sets the players augmented wager if they click double
		Players.last().wager += Players.last().wager;
	}

	getID('winnings').innerHTML = Players.last().wager;
	getID('losings').innerHTML = Players.last().wager;

	// Settling
	for (let i = 1; i < Players.length; i++) {

		// if there is a natural
		if (noNatural === false) {
			// if the player has a natural
			if (Players[i].natural()) {
				// if the player is the user
				if (i === Players.length - 1) {
					Players[i].bank += Players[i].wager;
					getID('won').className = "center";
					continue;
				}
				Players[i].bank += Players[i].wager * 1.5;
			}
			// if dealer goes bust and player still standing
		} else if (Players[0].evaluate() > 21 && Players[i].evaluate() < 22) {
			Players[i].bank += Players[i].wager;

			if (i === Players.length - 1) {
				getID('won').className = "center";
			}

			// if player goes bust or less than dealer
		} else if (Players[i].evaluate() > 21 || Players[i].evaluate() < Players[0].evaluate()) {
			Players[i].bank -= Players[i].wager;

			if (i === Players.length - 1) {
				getID('loss').className = "center";
			}

			// if player is above dealer
		} else if (Players[i].evaluate() > Players[0].evaluate()) {
			Players[i].bank += Players[i].wager;

			if (i === Players.length - 1) {
				getID('won').className = "center";
			}
			// if they have the same value cards
		} else {
			if (i === Players.length - 1) {
				getID('tied').className = "center";
			}
		}
	}

	// resets augmented wager
	if (noNatural === false) {
		if (Players.last().natural()) {
			Players.last().wager = Players.last().wager / 1.5;
		}
	}

	// resets augmented wager
	if (noDouble === false) {
		Players.last().wager = Players.last().wager / 2;
	}

	// stores all players
	for (let i = 0; i < Players.length; i++) {
		Players[i].store(i);
	}

	deck.store();
}

function tournament(bank, handle) {
	// get last row value
	var table = getID('leaderboardTable');
	var lastRow = table.rows[5];
	var lastCellValue = lastRow.cells[2].innerHTML;
	var value = parseInt(lastCellValue.substr(1));

	PLAYING = false;
	getID('stand').className += " locked";
	getID('hit').className += " locked";
	toggleWagers(false);

	// if lastRval < bank, if someone has same value as last row they don't place
	if (value < bank) {

		var tempArr = [];
		tempArr.push(bank);
		// creating array of leaderboard to sort more easily
		for (let i = 1; i < 6; i++) {
			var rowVal = table.rows[i].cells[2].innerHTML;
			var Val = parseInt(rowVal.substr(1));
			tempArr.push(Val);
		}

		// finding position with bubble sort, only doing one pass
		var index, flag = true;
		for (let i = 0; i < 6; i++) {
			if (tempArr[i] < tempArr[i + 1]) {
				var tempVal = tempArr[i];
				tempArr[i] = tempArr[i + 1];
				tempArr[i + 1] = tempVal;
				index = i + 2;
				flag = false;
			}
		}

		if (flag) index = 1;

		var suffix = {
			'1': 'st',
			'2': 'nd',
			'3': 'rd',
			'4': 'th',
			'5': 'th'
		};

		// display well done
		getID('winTourn').className = 'tournamentFeedback';
		getID('place').innerHTML = index.toString() + suffix[index];

		// remove last row
		table.deleteRow(5);

		// add to table
		var newRow = table.insertRow(index);

		// Create a text node with user data
		var col1 = document.createTextNode(index);
		var col2 = document.createTextNode(handle);
		var col3 = document.createTextNode('£' + bank);

		// Insert a cell in the row at the specified index
		// and append respective data
		var newCol1 = newRow.insertCell(0).appendChild(col1);
		var newCol2 = newRow.insertCell(1).appendChild(col2);
		var newCol3 = newRow.insertCell(2).appendChild(col3);

		// need to reindex other rows
		for (let i = index + 1; i < 6; i++) {
			table.rows[i].cells[0].innerHTML = i;
		}
	} else {
		getID('loseTour').className = 'tournamentFeedback';
	}
}

function splitCards() {
	// styles the split cards
	getID('split').className = 'hidden';
	getID('player').className = '';
	styleID('splitCards').marginLeft = '50px';
}

function loadGame() {
	// hides other screens, displays main game
	play();

	styleID('dealer').marginTop = "0px";
	styleID('dealer').marginLeft = "100px";

	toggleWagers(true);

	// parsing string as a boolean
	var bool = {
		'true': true,
		'false': false
	};

	var boolean = bool[localStorage.getItem('playing')];
	PLAYING = boolean;
	toggleWagers(!boolean);

	// creates player array globally
	window.Players = [];
	// adds dealer to array
	Players.push(new Dealer());

	// creates new deck globally
	window.deck = new Deck();

	// Function to map CSV to 2d array
	parse2D(deck.availableCards, 'availableCards');
	parse2D(deck.cutCards, 'cutCards');
	parse2D(deck.spentCards, 'spentCards');

	deck.players = parseInt(localStorage.getItem('players'));

	for (let i = 1; i < deck.players; i++) {
		// adds AI Players to array
		Players.push(new VirtualHand());
	}

	// adds player to array
	Players.push(new PlayerHand());

	// Function to map CSV to 2d array
	parse2D(Players[0].cards, 'cards');

	Players[0].turn = localStorage.getItem('turn');
	Players[0].cardBalance = localStorage.getItem('cardBalance');

	for (let j = 1; j < deck.players + 1; j++) {
		// Function to map CSV to 2d array
		parse2D(Players[j].cards, j + 'cards');

		Players[j].bank = parseInt(localStorage.getItem(j + 'bank'));
		Players[j].wager = parseInt(localStorage.getItem(j + 'wager'));
		Players[j].turn = localStorage.getItem(j + 'turn');
		Players[j].cardBalance = parseInt(localStorage.getItem(j + 'cardBalance'));

		if (j == deck.players) {
			Players[j].splitCards = localStorage.getItem(j + 'splitCards');
			Players[j].handle = localStorage.getItem(j + 'handle');
			Players[j].handle = localStorage.getItem(j + 'rounds');
		} else {
			Players[j].wagerBalance = parseInt(localStorage.getItem(j + 'wagerBalance'));
		}
	}

	// selects default wager
	var wager = Players.last().wager;
	getID(wager).className = 'mgame wager selected';

	if (Players.last().rounds) {
		getID('roundText').className = "inline";
	} else {
		// ensures that 'the round 1 of 10" text is not displayed
		getID("roundText").className = "hidden";
	}
}

function clearNode(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function displayNode(node, object, i) {
	// for each card in their hand
	for (let Cd = i; Cd < object.cards.length; Cd++) {
		// select the card at the index
		var card = object.cards[Cd];
		// get the unicode character of the card
		var unicard = object.display(card)[0];
		// create a text node of the unicode card
		var content = document.createTextNode(unicard);
		// create a span element
		var span = document.createElement("span");
		// style the span
		span.className = "card";
		// append the text node to the span
		span.appendChild(content);
		// colour the card accordingly
		span.style.color = object.display(card)[1];
		//append the span element to the hand
		node.appendChild(span);
	}
}

function display() {

	// for (let i = 0; i < Players.length - 1; i++) {
	// update the players bank to
	getID("total").innerHTML = Players.last().bank;
	// }

	var dealerNode = getID("dealer");
	var dealer = Players[0];

	// clearing dealer
	clearNode(dealerNode);

	// for showing back of card if no cards
	// same code as displyNode but function does not support card = [0,-1]
	if (dealer.cards.length === 0 || PLAYING === true) {
		let card = [0, -1];
		let content = document.createTextNode(dealer.display(card)[0]);
		let span = document.createElement("span");
		span.className = "card";
		span.appendChild(content);
		if (PLAYING) {
			span.style.color = dealer.display(dealer.cards[0])[1];
		}
		dealerNode.appendChild(span);
	}

	// if playing is true set iterator to 1, else 0
	// this is needed to hide the dealers card when game is in play
	let Cd = (PLAYING) ? 1 : 0;

	// displays dealer cards
	displayNode(dealerNode, dealer, Cd);

	// clearing ai players
	for (let x = 1; x < 5; x++) {
		clearNode(getID("ai" + x));
	}

	// if there are ai players
	if (Players.length > 2) {
		// for each player
		for (let Pl = 1; Pl < deck.players; Pl++) {
			let aiNode = getID("ai" + (Pl));

			// for each card in their hand
			displayNode(aiNode, Players[Pl], 0);
		}
	}

	var playerNode = getID('player');
	var player = Players.last();

	// clearing player
	clearNode(playerNode);

	// for each card in their hand
	displayNode(playerNode, player, 0);

	var splitNode = getID('splitCards');

	// clearing player
	clearNode(splitNode);

	if (player.splitCards.length > 0) {
		// this is the same code as the display node code but module doesn't support splitcards
		// see above for comments
		for (let Cd = 0; Cd < Players.last().splitCards.length; Cd++) {
			let card = Players.last().splitCards[Cd];
			var content = document.createTextNode(Players.last().display(card)[0]);
			var span = document.createElement("span");
			span.className = "card";
			span.appendChild(content);
			span.style.color = Players.last().display(card)[1];
			getID('splitCards').appendChild(span);
		}
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
		// select all screens
		var x = document.querySelectorAll(".screen");
		// hides them
		for (let i = 0; i < x.length; i++) {
			x[i].className = 'screen hidden';
		}
		// except the chosen screen
		getID(Button).className = 'screen';
	};
}

function makeWager(Button) {
	return function () {
		if (PLAYING === false) {
			//sets player wager
			Players.last().wager = parseInt(Button);
			// select all wagers and unselect them
			toggleWagers(true);
			// add the class selected to the clicked wager
			getID(Button).className = 'mgame wager selected';
		}
	};
}

// select all return buttons
var y = document.querySelectorAll(".return");
for (let k = 0; k < y.length; k++) {
	// set the onclick to main
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

	styleID('dealer').marginTop = "0px";
	styleID('dealer').marginLeft = "100px";

	switch (deck.players) {
		// sets the margins based on the number of players
		// so that the action/wager buttons are always at bottom
	case 1:
		styleID('rightBlock').marginTop = "300px";
		styleID('selectWager').marginTop = "-50px";
		break;
	case 2:
		styleID('rightBlock').marginTop = "220px";
		styleID('selectWager').marginTop = "65px";
		break;
	case 3:
	case 4:
	case 5:
		styleID('rightBlock').marginTop = "100px";
		styleID('selectWager').marginTop = "195px";
		break;
	}

	newGame(deck.players);
};

getID('previous').onclick = function () {
	loadGame();
};

getID('tournament').onclick = function () {
	getID('roundText').className = "inline";

	styleID('dealer').marginTop = "-50px";
	styleID('dealer').marginLeft = "100px";
	styleID('rightBlock').marginTop = "300px";
	styleID('selectWager').marginTop = "-27px";

	newGame(1);

	Players.last().rounds = 1;
	Players.last().handle = prompt('Enter a handle for leaderboard: ');
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
	Players.last().hit();
	settlement(true, false);
};

getID('split').onclick = function () {
	Players.last().splitTheCards();
	getID('split').className = 'hidden';
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

	if (PLAYING) {
		let user = Players.last();

		// if the user goes bust
		if (user.evaluate() > 21) settlement(true, true);


		if (user.cards.length === 2) {
			if (user.evaluate() > 8 && user.evaluate() < 12) {
				getID('double').className = "mgame action inline";
			} else {
				getID('double').className = "hidden";
			}

			/*if (user.splitCardsCheck()) {
				getID('split').className = "mgame action inline";
			} else {
				getID('split').className = "hidden";
			}*/
		} else {
			getID('double').className = "hidden";
		}
	}

	if (Players.last().rounds) {
		getID('rounds').innerHTML = Players.last().rounds - 1;
	}
}, 100);
