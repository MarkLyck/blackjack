
function CardConstructor(value, suit) {
  this.suit = suit
  this.value = value
}


let cardAceOfClubs = CardConstructor(1, 'Clubs')
let card2OfSpades = CardConstructor(2, 'Spades')
// ETC.





function DeckofCards() {
  this.listOfCards = []
  this.buildDeck = () => {
    let cardNumber = 1
    let cardSuit = 'Clubs'

    while(this.listOfCards.length < 52) {
      console.log(this.listOfCards.length);
      if (cardNumber !== 14 || (cardNumber === 14 && cardSuit === 'Spades')) {
        let newCard = new CardConstructor(cardNumber, cardSuit)
        this.listOfCards.push(newCard)
        cardNumber++
      } else {
        cardNumber = 1
        if (cardSuit === 'Clubs') {
          cardSuit = 'Diamonds'
        } else if (cardSuit === 'Diamonds') {
          cardSuit = 'Hearts'
        } else {
          cardSuit = 'Spades'
        }
      }

    }
  }
}

let deck = new DeckofCards()
deck.buildDeck()
console.log(deck);
