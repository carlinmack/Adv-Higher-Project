var array = new Array();

function createDeck(decks) {
    decks *= 4
    for (j = 0; j < decks; j++) {
        array.push(new Array());
        for (i = 0; i < 13; i++) {
            array[j][i] = i;
        }
    }
    return array;
}

console.log(createDeck(6));