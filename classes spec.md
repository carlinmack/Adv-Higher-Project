Class Deck
==========

Available - 52 - 312 length - 2D array

Spent Cards - 40 - 260 length

Class Hand
==========

Cards - 1D Array

Methods:

Hit, Stand, Double, Split

 

Sub-class Dealer
================

Cards

Methods:

Hit, Stand

 

Deck Methods:
=============

Shuffle
-------

Fisher-Yates

Cut
---

Remove first 60 cards, either place null card [-1,-1] or split array

Hit
---

Receive a card

Stand
-----

End your turn

Split
-----

If cards are the same face value they can be played as 2 separate hands

Double
------

If 12 \> total \> 8, wager can be doubled to receive a single card
