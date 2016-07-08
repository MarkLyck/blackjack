function Die() {
  this.value = 1
  this.roll = () => {
    this.value = Math.ceil(Math.random()*6)
    // console.log(this.value);
    return this.value
  }
}

let dice = new Die()
dice.roll()

function getProbabilities() {
  let dice1 = new Die()
  let dice2 = new Die()
  let resultsArray = [0,0,0,0,0,0,0,0,0,0,0]
  for (var i = 0; i <= 1000; i++) {
    dice1.roll()
    dice2.roll()
    let sum = dice1.value + dice2.value
    let index = sum-2
    resultsArray[index] = resultsArray[index]+1
  }
  // console.log(resultsArray);
}

getProbabilities()


function CardConstructor(value, suit) {
  this.suit = suit
  this.value = value
}

// Adventurer mode
function DeckofCards() {
  this.listOfCards = []
  this.buildDeck = () => {
    this.listOfCards = [] // Empty the array.
    let cardNumber = 1
    let cardSuit = 'Clubs'

    while(this.listOfCards.length < 52) {
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
  this.shuffle = () => {
    // This code is Fisher-Yates Shuffle. Which is more random than Math.Random
    var currentIndex = this.listOfCards.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.listOfCards[currentIndex];
      this.listOfCards[currentIndex] = this.listOfCards[randomIndex];
      this.listOfCards[randomIndex] = temporaryValue;
    }
    return this.listOfCards;
  }
  this.draw = () => {
    let topCard = this.listOfCards[0]
    this.listOfCards.shift()
    return topCard
  }
}















// Epic mode

// deleteAll()

function deleteAll() {
  console.log('DELETING ALL PLAYERS');
  $.ajax({
    url: 'https://tiny-za-server.herokuapp.com/collections/blackjack-players',
    type: 'GET',
    contentType: 'application/json',
    success: response => {
      response.forEach((item) => {
        let idToDelete = item._id
        console.log(idToDelete);
        $.ajax({
          url: 'https://tiny-za-server.herokuapp.com/collections/blackjack-players/' + idToDelete,
          type: 'DELETE',
          contentType: 'application/json',
        })
      })
    }
  })
}

// array of cards in player's and dealer's hand
let $2Player = $('#2-player')
let $computer = $('#computer')
let $modalContainer = $('.modal-container')
let $modal = $('.modal')

let gameMode = ''

let apiURL = 'https://tiny-za-server.herokuapp.com/collections/blackjack-players/'

let startMoney = 100
let bet = 0
let dealerIdentified = false

let deck = new DeckofCards()

let $playerCards = $('#player').children('ul')
let $dealerCards = $('#dealer').children('ul')
let $betInput = $('#bet')
let $newGameBtn = $('#new-game')

let $hitme = $('#hit')
let $stand = $('#stand')

function Player(number) {
  this.hand = []
  this.number = number
  this.isWaiting = true
}

let player = new Player(1)
let opponent = new Player(2)

// deleteAll()

$2Player.on('click', () => {
  gameMode = '2Player'
  $modal.css('display', 'none')
  console.log('GETTING PLAYERS');
  $.ajax({
    url: apiURL,
    type: 'GET',
    success: response => {
      console.log('players: ', response);
      response.filter(foundPlayers => {
        if (player.isWaiting === true) {
          return true
        }
      })
      if (response.length > 0) {
        console.log('FOUND WAITING PLAYER');
        console.log(response[0]);
        player.number = 2
        player.opponent = response[0]._id
        player.isWaiting = false

        opponent = response[0]

        $modalContainer.css('display', 'none')
      } else {
        console.log('Added to waitlist');
        let searchingForPlayers = setInterval(function() {
          $.ajax({
            url: apiURL,
            type: 'GET',
            success: response => {
              console.log('TIME LOOP');
              response.filter(foundPlayers => {
                if (player.isWaiting === true) {
                  return true
                }
              })
              if (response.length > 1) {
                console.log('FOUND OTHER PLAYER')
                clearInterval(searchingForPlayers)
                player.opponent = response[1]._id
                player.isWaiting = false

                opponent = response[1]

                $modalContainer.css('display', 'none')
              }
            }
          })
        }, 5000)
      }
      postPlayer()
    }
  })
})

function postPlayer() {
  console.log('ADDING PLAYER');
  $.ajax({
    url: apiURL,
    type: 'POST',
    data: player,
    success: response => {
      console.log(response)
      player._id = response._id
    }
  })
}

function putPlayer() {
  console.log('UPDATING PLAYER');
  $.ajax({
    url: apiURL + player._id,
    type: 'PUT',
    data: player,
    success: response => {
      console.log(response)
    }
  })
}
function putOpponent() {
  console.log('UPDATING OPPONENT');
  $.ajax({
    url: apiURL + player.opponent,
    type: 'PUT',
    data: opponent,
    success: response => {
      console.log(response)
    }
  })
}

// This clearly doesn't work.
// TODO, figure out how to delete users when exiting game.
window.onbeforeunload = function(){
  $.ajax({
    url: apiURL + player._id,
    type: 'DELETE',
    success: response => {
      console.log(response)
    }
  })
}



$computer.on('click', () => {
  gameMode = 'computer'
  $modalContainer.css('display', 'none')
  $modal.css('display', 'none')
})


// deleteAll()

$newGameBtn.on('click', () => {
  console.clear()

  if (gameMode === '2Player') {
    if (player.number === 1) { // Only one player can run this function.
      // Assign dealer to a random person
      if (Math.random() <= 0.5) {
        player.isDealer = true
      } else {
        player.isDealer = false
      }
      putPlayer()
    } else {
      let waitingForPlayer1 = setInterval(function() {
        $.ajax({
          url: apiURL + player.opponent,
          type: 'GET',
          contentType: 'application/json',
          success: responseOpponent => {
            console.log(apiURL + player.opponent);
            console.log(responseOpponent);
            player.opponent = responseOpponent._id
            if (responseOpponent.isDealer) {
              console.log('DEALER IDENTIFIED')
              if (responseOpponent.isDealer === true) {
                player.isDealer = false
              } else {
                player.isDealer = true
              }
              dealerIdentified = true
              clearInterval(waitingForPlayer1)
            }
          }
        })
      }, 1000)
    }
  }


  bet = $betInput.val()
  playerCards = []
  dealerCards = []
  $playerCards.children('li').css('background', '#0c5933')
  $dealerCards.children('li').css('background', '#0c5933')
  if (player.number === 1) {
    deck.buildDeck()
    deck.shuffle()
    if (player.isDealer) {
      displayCard(deck.draw(), 'opponent', 'up')
      displayCard(deck.draw(), 'player', 'up')
      displayCard(deck.draw(), 'opponent', 'up')
      displayCard(deck.draw(), 'player', 'down')
      putPlayer()
      putOpponent()
    } else {
      displayCard(deck.draw(), 'player', 'up')
      displayCard(deck.draw(), 'opponent', 'up')
      displayCard(deck.draw(), 'player', 'up')
      displayCard(deck.draw(), 'opponent', 'down')
      if (gameMode === "2Player") {
        putPlayer()
        putOpponent()
      }
    }
  } else {
    let waitingForSetup = setInterval(function() {
      $.ajax({
        url: apiURL,
        type: 'GET',
        contentType: 'application/json',
        success: response => {
          if (dealerIdentified) {
            console.log('Waiting for setup response', response);
            response.forEach(item => {
              console.log('setup item: ', item);
              if (item._id === player._id || item._id === player.opponent) {
                if (item._id === player._id) {
                  console.log('Waiting for Setup - Found player');
                  if (item.hand !== player.hand) {
                    player = response
                    clearInterval(waitingForSetup)
                    if (player.hand === undefined) {
                      player.hand = []
                    }
                    player.hand.forEach((cardInHand, i) => {
                      if (i === 1 && player.isDealer) {
                        displayCard(cardInHand, 'player', 'down')
                      } else {
                        displayCard(cardInHand, 'player', 'up')
                      }
                    })
                  }
                } else {
                  console.log('Waiting for Setup - Found Opponent');
                  if (item.hand !== opponent.hand) {
                    opponent = response
                    clearInterval(waitingForSetup)
                    opponent.hand.forEach((cardInHand, i) => {
                      if (i === 1 && opponent.isDealer) {
                        displayCard(cardInHand, 'opponent', 'down')
                      } else {
                        displayCard(cardInHand, 'opponent', 'up')
                      }
                    })
                  }
                } // End IF/ELSE
              }
            }) // End forEach
          }

        }
      }) // End AJAX
    }, 1000) // End Interval
  }
  $hitme.attr('disabled', false)
  $stand.attr('disabled', false)
})


$hitme.on('click', () => {
  if (playerCards.length < 5) {
    displayCard(deck.draw(), 'player', 'up')
  } else {
    throw new Error('You can\'t get more than 5 cards per game')
  }

})

$stand.on('click', () => {
  $hitme.attr('disabled', true)
  $stand.attr('disabled', true)

  // Reveal facedown card.
  revealCard(dealerCards[1])

  let playerPoints = calcSum(playerCards)
  let dealerPoints = calcSum(dealerCards)
  if (playerPoints > 21 && dealerPoints <= 21) {
    console.log('YOU LOST');
  } else {
    while (dealerPoints < 16) { // Simple computer game rules.
      displayCard(deck.draw(), 'dealer', 'up')
      dealerPoints = calcSum(dealerCards)
    }
    if (playerPoints > dealerPoints) {
      console.log('YOU WON');
    } else if (playerPoints === dealerPoints) {
      console.log('It\'s a tie');
    } else {
      console.log('YOU LOST');
    }
  }
  console.log('Player: ', playerPoints)
  console.log('Dealer: ', dealerPoints)
})

function calcSum(arr) {
  let points = arr.reduce((sum, card) => {
    let returnVal = 0
    if (card.value === 1) {
      returnVal = 11
    } else if (card.value > 10) {
      returnVal = 10
    } else {
      returnVal = card.value
    }
    return sum + returnVal
  }, 0)
  return points
}


function displayCard(card, forPlayer, face) {
  if (player.hand === undefined) {
    player.hand = []
  }
  if (opponent.hand === undefined) {
    opponent.hand = []
  }
  if (forPlayer === 'player') {
    console.log(player.hand);
    nextCardHolder = $('#player').children('ul').children('li:nth-child(' + Number(player.hand.length + 1) + ')')
    player.hand.push(card)
  } else {
    console.log('opponent hand: ', opponent);
    nextCardHolder = $('#opponent').children('ul').children('li:nth-child(' + Number(opponent.hand.length + 1) + ')')
    opponent.hand.push(card)
  }
  if (face === 'up') {
    nextCardHolder.css('background', 'url("assets/images/cards/' + card.value + '_of_' + card.suit.toLowerCase() + '.svg")')
  } else {
    nextCardHolder.css('background', 'url("assets/images/cards/cardBack.png")')
  }
  nextCardHolder.css('background-size', 'cover')
}

function revealCard(card) {
  revealCardHolder = $('#opponent').children('ul').children('li:nth-child(2)')
  revealCardHolder.css('background', 'url("assets/images/cards/' + card.value + '_of_' + card.suit.toLowerCase() + '.svg")')
  revealCardHolder.css('background-size', 'cover')
}

// deleteAll()
