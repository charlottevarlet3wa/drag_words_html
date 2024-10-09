import DraggableWord from "./classes/DraggableWord.js";
import GapText from "./classes/GapText.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    key: "mainScene", // Nom de la scène
    preload: preload,
    create: create,
  },
  backgroundColor: "#ffffff",
  parent: "game",
};

let game = new Phaser.Game(config); // Créer le canvas immédiatement
let draggableWords = []; // Tableau pour stocker les mots draggables
let score = 0; // Initialiser le score à 0
let timer = 120; // Temps de départ du chrono
let highscore = localStorage.getItem("highscore") || 0; // highscore sauvegardé
let gameOver = false;
let timerEvent = null; // Stocker l'événement du timer

const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const gameOverPanel = document.getElementById("gameOverPanel");
const finalScoreText = document.getElementById("finalScore");
const highscoreText = document.getElementById("highscore");
const restartButton = document.getElementById("restartButton");
highscoreText.innerText = "Highscore : " + highscore;

const canvasWidth = 800;

// Fonction pour charger et utiliser la police avant de créer les textes
function loadFontAndStartGame() {
  WebFont.load({
    google: {
      families: ["Carter One"],
    },
    active: function () {
      // Appeler la fonction de démarrage des textes une fois la police chargée
      game.scene.scenes[0].startGameText();
    },
  });
}

function preload() {
  this.load.json("textsData", "data/gapTexts.json");
}

// Fonction pour arrêter le jeu et afficher le panneau de fin
function endGame() {
  gameOver = true;

  // Mettre à jour le highscore si le score actuel est supérieur
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("highscore", highscore);
  }

  // Afficher le panneau de fin avec le score final et le highscore
  // finalScoreText.innerText = `Score: ${score}`;
  highscoreText.innerText = `Highscore: ${highscore}`;
  gameOverPanel.style.display = "flex";

  restartButton.style.display = "block";

  timerEvent.remove();
}

function resetGame() {
  // Réinitialiser les variables globales du jeu
  score = 0;
  timer = 120;
  gameOver = false;

  // Réinitialiser l'affichage
  scoreDiv.innerText = `Score: ${score}`;
  timerDiv.innerText = `Time: ${timer}`;
  gameOverPanel.style.display = "none";

  // Nettoyer tous les objets précédents
  draggableWords.forEach((word) => word.text.destroy());
  draggableWords = [];

  // Annuler le timer précédent s'il existe
  if (timerEvent) {
    timerEvent.remove();
  }
}

function create() {
  this.startGameText = () => {
    const gapTextsJsonData = this.cache.json.get("textsData");
    const gapTexts = gapTextsJsonData.gapTexts;

    // Réinitialiser le jeu
    resetGame();

    // Lancer le décompte du chrono
    timerEvent = this.time.addEvent({
      delay: 1000, // Chaque seconde
      callback: () => {
        if (timer > 1 && !gameOver) {
          timer--;
          timerDiv.innerText = `Time: ${timer}`;
        } else if (timer === 1) {
          timer--;
          timerDiv.innerText = `Time: ${timer}`;
          endGame();
        }
      },
      loop: true,
    });

    this.loadNewQuestion = () => {
      if (gameOver) return;

      this.children.removeAll();

      const randomGapText = Phaser.Math.RND.pick(gapTexts);
      const textArray = randomGapText.textArray;
      const targetWords = randomGapText.targetWords;
      const otherWords = randomGapText.otherWords;

      draggableWords.forEach((word) => word.text.destroy());
      draggableWords = [];

      this.gapText = new GapText(this, 800, 100, textArray, targetWords);

      // Introduire un délai de 0,1s (100ms) entre la création des DraggableWords
      [...otherWords, ...targetWords].forEach((word, index) => {
        this.time.addEvent({
          delay: index * 50, // Délai de 50ms entre chaque mot
          callback: () => {
            const xPos = Phaser.Math.Between(100, 700);
            const yPos = Phaser.Math.Between(100, 500);
            const draggableWord = new DraggableWord(this, xPos, yPos, word);
            draggableWords.push(draggableWord);
          },
          callbackScope: this,
        });
      });

      this.physics.add.collider(draggableWords.map((word) => word.text));
    };

    this.loadNewQuestion();
  };
  this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    if (!gameObject.locked) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    }
  });

  this.input.on("dragend", (pointer, gameObject) => {
    let droppedInZone = this.gapText.checkWordInZones(gameObject);
    if (this.gapText.areAllZonesFilled()) {
      score += 1;
      scoreDiv.innerText = `Score: ${score}`;
    }

    if (!droppedInZone && !gameObject.locked) {
    }
  });
}

// Lancer la fonction de chargement de la police au clic sur "Start"
document.getElementById("startButton").addEventListener("click", function () {
  document.getElementById("startButton").style.display = "none"; // Masquer le bouton
  loadFontAndStartGame(); // Charger la police et démarrer les textes
});

// Bouton recommencer
restartButton.addEventListener("click", function () {
  gameOverPanel.style.display = "none"; // Masquer le panneau de fin

  // Réinitialiser manuellement le jeu
  resetGame();
  game.scene.scenes[0].startGameText(); // Relancer le texte du jeu après réinitialisation
});
