export default class DraggableWord {
  constructor(scene, x, y, text) {
    this.scene = scene;

    this.startDragX = 0; // Position initiale du drag
    this.startDragY = 0;
    this.previousVelocityX = 0; // Stocker la vélocité avant le drag
    this.previousVelocityY = 0;

    // Créer un texte interactif et l'ajouter à la scène avec une opacité initiale de 0 (invisible)
    this.text = scene.add
      .text(x, y, text, { font: "1.8rem 'Carter One'", fill: "#000" })
      .setInteractive({ useHandCursor: true }) // Permet l'interaction avec le curseur (utile pour tactile et souris)
      .setOrigin(0.5, 0.5)
      .setAlpha(0); // Commence avec une opacité de 0 (invisible)

    // Appliquer un effet de fade in sur 1 seconde pour faire apparaître progressivement le texte
    scene.tweens.add({
      targets: this.text,
      alpha: 1, // Augmenter l'opacité de 0 à 1
      duration: 1000, // Durée de l'animation (1 seconde)
      ease: "Power2", // Type de transition douce
    });

    // Activer la physique sur le texte
    scene.physics.add.existing(this.text);

    // Ajouter un corps physique à l'objet texte
    this.text.body.setCollideWorldBounds(true); // Rebondir sur les bords du canvas
    this.text.body.setBounce(1); // Le rebond est total (100%)
    this.text.body.setVelocity(
      Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(-80, 80)
    ); // Vitesse aléatoire

    this.text.locked = false;

    // Rendre le texte draggable pour les écrans tactiles et la souris
    this.scene.input.setDraggable(this.text);

    // Gérer le début du drag (capture de la position initiale)
    scene.input.on("dragstart", (pointer, gameObject) => {
      if (gameObject === this.text) {
        // Capturer la vélocité avant le drag
        this.previousVelocityX = gameObject.body.velocity.x;
        this.previousVelocityY = gameObject.body.velocity.y;

        // Capturer la position initiale de la souris ou du doigt
        this.startDragX = pointer.x;
        this.startDragY = pointer.y;

        // Arrêter le mouvement pendant le drag
        gameObject.body.setVelocity(0, 0);
      }
    });

    // Gérer le drag manuel (pour tactile et souris)
    scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.text) {
        // Déplacer l'objet manuellement pendant le drag
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    });

    // Relancer le mouvement après le drag en fonction de la direction de la souris ou du doigt
    scene.input.on("dragend", (pointer, gameObject) => {
      if (gameObject === this.text) {
        // Calculer la direction du mouvement de la souris ou du doigt
        const deltaX = pointer.x - this.startDragX;
        const deltaY = pointer.y - this.startDragY;

        // Calculer l'angle de la direction (en radians)
        const angle = Math.atan2(deltaY, deltaX);

        // Utiliser la vitesse avant le drag
        const currentSpeed = Math.sqrt(
          this.previousVelocityX ** 2 + this.previousVelocityY ** 2
        );

        // Appliquer la nouvelle direction tout en conservant la vitesse d'avant le drag
        const velocityX = currentSpeed * Math.cos(angle);
        const velocityY = currentSpeed * Math.sin(angle);

        // Appliquer la direction à la vitesse
        gameObject.body.setVelocity(velocityX, velocityY);
      }
    });
  }
}
