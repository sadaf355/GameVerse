# 🎮 GameVerse

GameVerse is a premium, offline-first web arcade platform featuring classic logic mini-games built with elegant Glassmorphism aesthetics and responsive vanilla web technologies.

## 🌟 Features

* **3 Classic Games**:
  * **Tic Tac Toe**: Outsmart your opponent in a classic local 2-player grid matchup.
  * **Connect Four**: Drop tokens into slots and connect four in a row horizontally, vertically, or diagonally.
  * **Memory Match**: Flip cards to pair matching symbols and complete the board in the minimum amount of moves and time.
* **Game Selection Wheel**: An interactive, animated physics-based spin wheel on the homepage that helps undecided players select their next challenge.
* **Sleek Aesthetics**: A gorgeous dark and light mode interface featuring translucent glass layouts, harmonic HSL colors, smooth gradients, hover micro-animations, and Outfit sans-serif typography.
* **Pure Stateless Engine**: Offline-first, fast, and completely stateless architecture using vanilla HTML5, CSS3, and ES6 JavaScript.

## 🚀 How to Run

GameVerse does not require any build tools, servers, or installations. 

To play locally:
1. Clone this repository:
   ```bash
   git clone https://github.com/sadaf355/GameVerse.git
   ```
2. Navigate to the project directory.
3. Open `index.html` directly in any modern web browser.

## 🛠️ Architecture

* **Frontend**: HTML5, Vanilla CSS3 (Custom design tokens & responsive flex layouts), ES6 Javascript.
* **Asset-free Audio**: Uses browser-native Web Audio API synthesizer for clicking/victory audio triggers (no media downloads needed).
* **Theme Storage**: Light/Dark mode state is persisted across page loads using local storage.
