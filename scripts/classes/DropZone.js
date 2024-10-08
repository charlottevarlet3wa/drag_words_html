export default class DropZone {
  constructor(scene, x, y, zoneNumber, targetWord) {
    this.scene = scene;
    this.zoneNumber = zoneNumber;
    this.targetWord = targetWord; // Le mot cible à déposer
    this.isLocked = false;

    // Créer la zone de dépôt
    this.dropZone = scene.add.zone(x, y, 150, 50).setRectangleDropZone(150, 50);

    // Ajouter une bordure visible
    this.graphics = scene.add.graphics();
    this.graphics.lineStyle(2, 0x00ff00);

    // Utiliser strokeRoundedRect pour des coins arrondis
    const radius = 8; // Rayon d'arrondi
    this.graphics.strokeRoundedRect(
      this.dropZone.x - this.dropZone.input.hitArea.width / 2,
      this.dropZone.y - this.dropZone.input.hitArea.height / 2,
      this.dropZone.input.hitArea.width,
      this.dropZone.input.hitArea.height,
      radius // Rayon des coins
    );
  }

  isInBounds(gameObject) {
    return Phaser.Geom.Intersects.RectangleToRectangle(
      gameObject.getBounds(),
      this.dropZone.getBounds()
    );
  }

  checkCorrectWord(word) {
    return word === this.targetWord && !this.isLocked;
  }

  snapToZone(gameObject) {
    gameObject.x = this.dropZone.x;
    gameObject.y = this.dropZone.y;

    // Désactiver le corps physique pour rendre le mot immobile
    gameObject.body.setVelocity(0, 0);
    gameObject.body.moves = false; // Désactive les mouvements physiques

    // Verrouiller la zone et le mot
    this.lockZone(gameObject);
  }

  lockZone(gameObject) {
    // Verrouiller la zone, empêcher tout autre mot d'y être déposé
    this.isLocked = true;

    // Verrouiller le mot pour qu'il ne puisse plus être déplacé
    gameObject.locked = true;

    // Changer la couleur de fond en vert pour indiquer que la zone est verrouillée
    this.graphics.clear();
    this.graphics.fillStyle(0x00ff00);

    // Dessiner le rectangle avec coins arrondis
    const radius = 8;
    this.graphics.fillRoundedRect(
      this.dropZone.x - this.dropZone.input.hitArea.width / 2,
      this.dropZone.y - this.dropZone.input.hitArea.height / 2,
      this.dropZone.input.hitArea.width,
      this.dropZone.input.hitArea.height,
      radius
    );
  }
}
