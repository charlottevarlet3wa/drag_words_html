import DropZone from "./DropZone.js";

export default class GapText {
  constructor(scene, canvasWidth, y, textArray, targetWords) {
    this.scene = scene;
    this.dropZones = [];

    // Calculer la largeur totale du texte
    let totalWidth = 0;
    let sampleTextElement = scene.add.text(0, 0, "Sample", {
      font: "1.8rem 'Carter One'",
      fill: "#000",
    });
    const textHeight = sampleTextElement.height; // Hauteur estimée à partir de la taille de police
    sampleTextElement.destroy(); // Pas besoin de ce texte après avoir récupéré la hauteur

    textArray.forEach((element) => {
      if (element === "_") {
        totalWidth += 150; // Largeur approximative d'une zone de dépôt
      } else {
        const textElement = scene.add.text(0, 0, element, {
          font: "1.8rem 'Carter One'",
          fill: "#000",
        });
        totalWidth += textElement.width;
        textElement.destroy(); // On ne veut pas afficher ce texte temporaire
      }
    });

    // Calculer la position de départ pour centrer le texte
    let xPos = (canvasWidth - totalWidth) / 2;
    let yPos = (600 - textHeight) / 2;

    // Parcourir le texte et créer les zones de dépôt aux bons endroits
    let zoneIndex = 0;
    textArray.forEach((element, index) => {
      if (element === "_") {
        xPos += 150;
        const dropZone = new DropZone(
          this.scene,
          xPos - 75,
          yPos + textHeight / 2,
          index + 1,
          targetWords[zoneIndex]
        );
        this.dropZones.push(dropZone);
        zoneIndex++;
      } else {
        xPos += this.scene.add.text(xPos, yPos, element, {
          font: "1.8rem 'Carter One'",
          fill: "#000",
        }).width;
      }
    });
  }

  areAllZonesFilled() {
    return this.dropZones.every((zone) => zone.isLocked);
  }

  // Méthode pour vérifier les mots dans toutes les zones de dépôt
  checkWordInZones(gameObject) {
    let droppedInZone = false;

    this.dropZones.forEach((zone) => {
      if (zone.isInBounds(gameObject)) {
        if (zone.checkCorrectWord(gameObject.text)) {
          zone.snapToZone(gameObject);
          zone.lockZone(gameObject);
          droppedInZone = true;
        }
      }
    });

    // Si toutes les zones sont remplies correctement, passer à une autre question
    if (this.areAllZonesFilled()) {
      this.scene.time.delayedCall(500, () => {
        this.scene.loadNewQuestion();
      });
    }

    return droppedInZone;
  }
}
