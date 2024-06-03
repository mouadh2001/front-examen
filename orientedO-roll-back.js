// Classe Soldier représentant un soldat générique
class Soldier {
  constructor(cost, health, attack, img, compImg, type) {
    // Initialisation des propriétés du soldat
    this.cost = cost;
    this.health = health;
    this.attack = attack;
    this.img = img; // Image pour le joueur
    this.compImg = compImg; // Image pour l'ordinateur
    this.type = type; // Type de soldat
    this.position = 1; // Position initiale
  }

  // Méthode pour améliorer la santé du soldat
  upgradeHealth() {
    this.health += 10;
  }

  // Méthode pour améliorer l'attaque du soldat
  upgradeAttack() {
    this.attack += 5;
  }

  // Méthode pour déplacer le soldat sur le plateau
  move(step, maxSize) {
    this.position += step;
    // Vérifier les limites du plateau
    if (this.position >= maxSize) {
      this.position = maxSize - 1;
    }
    if (this.position < 0) {
      this.position = 0;
    }
  }
}

// Classes spécifiques pour différents types de soldats
class Knight extends Soldier {
  constructor() {
    super(1, 100, 10, "blueK.png", "redK.png", "k");
  }
}

class KnightLeader extends Soldier {
  constructor() {
    super(2, 100, 20, "blueA.png", "redA.png", "l");
  }
}

class Elve extends Soldier {
  constructor() {
    super(3, 100, 10, "blueM.png", "redM.png", "e");
  }
}

class ElveChief extends Soldier {
  constructor() {
    super(4, 100, 20, "blueG.png", "redG.png", "c");
  }
}

// Classe Player représentant un joueur
class Player {
  constructor() {
    this.soldiers = []; // Liste de soldats du joueur
    this.resources = 3; // Ressources initiales du joueur
    this.currentPlayer = true;
    this.upgradeMode = false; // Mode amélioration activé/désactivé
  }

  // Méthode pour acheter un soldat
  buySoldier() {
    if (this.soldiers.length < MAX_SOLDIERS && this.currentPlayer) {
      const choice = prompt(
        "Choose a soldier to buy: Knight (K), Knight Leader (L), Elve (E), or Elve Chief (C)"
      );
      const SoldierClass = SOLDIER_TYPES[choice];
      if (SoldierClass) {
        const soldier = new SoldierClass();
        if (this.resources >= soldier.cost) {
          this.resources -= soldier.cost;
          this.soldiers.push(soldier);
          this.updateResources();
          if (this.resources === 0) {
            game.endPlayerTurn();
          }
          this.updateInfo();
          this.updateBoard();
        }
      } else {
        alert("Invalid choice or insuffisant resources");
      }
    }
    return false;
  }

  // Méthode pour améliorer un soldat
  upgradeSoldier(index) {
    if (this.upgradeMode) {
      if (this.resources < 1) return false;
      const soldier = this.soldiers[index];
      if (!soldier) return false;
      this.resources -= 1;

      let type = "";
      while (type !== "h" && type !== "a") {
        type = prompt(`Upgrade health (H) or attack (A)?`);
        if (type === "h") {
          soldier.upgradeHealth();
        } else if (type === "a") {
          soldier.upgradeAttack();
        } else {
          alert("Invalid choice");
        }
      }

      // Gestion du mouvement du soldat après l'amélioration
      const soldierPosition = soldier.position;
      const rows = document.getElementById("ring-table").rows;
      const cellToClear =
        rows[this.soldiers.indexOf(soldier)].cells[soldierPosition];
      // Vider la cellule
      cellToClear.innerHTML = "";
      const message = "Fight started by the player";
      let step = 0;
      game.checkForFights(message);
      if (game.checkForFights(message)) {
        step = 0;
      } else {
        step = 1;
      }
      soldier.move(step, RING_SIZE);

      if (soldier.position === RING_SIZE - 1) {
        alert("Player win !!");
      }
      this.upgradeMode = false;
      this.updateResources();
      this.updateInfo();
      this.updateBoard();
      game.checkForFights(message);
      if (this.resources === 0) {
        game.endPlayerTurn();
      } else {
        alert("Invalid choice or insufficient resources.");
      }
    } else {
      alert("You can only upgrade once per round.");
    }
    return true;
  }

  // Méthode pour mettre à jour les ressources affichées
  updateResources() {
    document.getElementById("player-resources").innerText =
      "Resources: " + this.resources;
  }

  // Méthode pour mettre à jour la liste des soldats du joueur
  updateInfo() {
    const playerSoldiersList = document.getElementById("player-soldiers");
    playerSoldiersList.innerHTML = "";
    this.soldiers.forEach((soldier, index) => {
      const soldierListItem = document.createElement("li");
      const soldierImg = document.createElement("img");
      soldierImg.src = soldier.img;
      soldierImg.classList.add("soldier-img");
      soldierListItem.addEventListener("click", () =>
        this.upgradeSoldier(index)
      );
      soldierListItem.appendChild(
        document.createTextNode(` HP: ${soldier.health}, AD: ${soldier.attack}`)
      );
      soldierListItem.appendChild(soldierImg);
      playerSoldiersList.appendChild(soldierListItem);
    });
  }

  // Méthode pour mettre à jour le plateau avec la position des soldats
  updateBoard() {
    const rows = document.getElementById("ring-table").rows;
    this.soldiers.forEach((soldier, index) => {
      const playerPosition = soldier.position;
      const playerCell = rows[index].cells[playerPosition];
      const playerImg = document.createElement("img");
      playerImg.src = soldier.img;
      playerImg.alt = soldier.type;
      playerCell.innerHTML = "";
      playerImg.classList.add("soldier-img");
      playerCell.appendChild(playerImg);
    });
  }
}

// Classe Computer représentant le joueur contrôlé par l'ordinateur
class Computer extends Player {
  constructor() {
    super("computer");
    this.resources = 3;
  }

  // Méthode pour acheter un soldat automatiquement
  computerBuySoldier() {
    const affordableSoldiers = Object.keys(SOLDIER_TYPES).filter(
      (type) => new SOLDIER_TYPES[type]().cost <= this.resources
    );
    if (affordableSoldiers.length === 0) return;
    const choice =
      affordableSoldiers[Math.floor(Math.random() * affordableSoldiers.length)];
    const soldier = new SOLDIER_TYPES[choice]();
    // Position du soldat pour l'ordinateur
    soldier.position = RING_SIZE - 2;
    this.resources -= soldier.cost;
    this.soldiers.push(soldier);
  }

  // Méthode pour acheter des soldats jusqu'à épuisement des ressources
  autoBuySoldiers() {
    while (this.resources > 0 && this.soldiers.length < MAX_SOLDIERS) {
      this.computerBuySoldier();
    }
  }

  // Méthode pour améliorer automatiquement un soldat
  autoUpgradeSoldier() {
    if (this.resources < 1) return;
    const soldier = this.soldiers.reduce((prev, curr) =>
      prev.position < curr.position ? prev : curr
    );
    const upgradeType = Math.random() < 0.5 ? "h" : "a"; // 50% chance
    if (upgradeType === "h") {
      soldier.upgradeHealth();
    } else {
      soldier.upgradeAttack();
    }
    this.resources -= 1;
    const soldierPosition = soldier.position;
    const rows = document.getElementById("ring-table").rows;
    const cellToClear =
      rows[this.soldiers.indexOf(soldier)].cells[soldierPosition];
    // Vider la cellule
    cellToClear.innerHTML = "";
    let step = 0;
    const message = "Fight started by the computer";
    game.checkForFights(message);
    if (game.checkForFights(message)) {
      step = 0;
    } else {
      step = -1;
    }
    soldier.move(step, RING_SIZE);
    if (soldier.position === 0) {
      alert("Computer win !!");
      return;
    }
    // Vérifier les combats après le mouvement
    game.checkForFights(message);
  }

  // Méthode pour exécuter les actions du tour de l'ordinateur
  playTurn() {
    this.autoBuySoldiers();
    this.autoUpgradeSoldier();
    this.resources++;
  }

  // Méthode pour mettre à jour les ressources affichées de l'ordinateur
  updateResources() {
    document.getElementById("computer-resources").innerText =
      "Resources: " + this.resources;
  }

  // Méthode pour mettre à jour la liste des soldats de l'ordinateur
  updateInfo() {
    const computerSoldiersList = document.getElementById("computer-soldiers");
    computerSoldiersList.innerHTML = "";
    this.soldiers.forEach((soldier) => {
      const soldierListItem = document.createElement("li");
      const soldierImg = document.createElement("img");
      soldierImg.src = soldier.compImg;
      soldierImg.classList.add("soldier-img");
      soldierListItem.appendChild(soldierImg);
      soldierListItem.appendChild(
        document.createTextNode(` HP: ${soldier.health}, AD: ${soldier.attack}`)
      );
      computerSoldiersList.appendChild(soldierListItem);
    });
  }

  // Méthode pour mettre à jour le plateau avec la position des soldats de l'ordinateur
  updateBoard() {
    const rows = document.getElementById("ring-table").rows;
    this.soldiers.forEach((soldier, index) => {
      const computerPosition = soldier.position;
      const computerCell = rows[index].cells[computerPosition];
      const computerImg = document.createElement("img");
      computerImg.src = soldier.compImg;
      computerImg.alt = soldier.type;
      computerCell.innerHTML = "";
      computerImg.classList.add("soldier-img");
      computerCell.appendChild(computerImg);
    });
  }
}

// Classe Game pour gérer le déroulement du jeu
class Game {
  constructor() {
    this.player = new Player(); // Joueur humain
    this.computer = new Computer(); // Joueur contrôlé par l'ordinateur
    this.roundCount = 1;
  }

  // Méthode pour démarrer le jeu
  start() {
    alert("You have " + this.player.resources + " resources.");
    document
      .getElementById("buy-soldier")
      .addEventListener("click", () => this.player.buySoldier());
    document.getElementById("upgrade-soldier").addEventListener("click", () => {
      this.player.upgradeMode = true;
    });
    this.player.updateResources();
    this.computer.updateResources();
  }

  // Méthode pour terminer le tour du joueur et passer au tour de l'ordinateur
  endPlayerTurn() {
    this.player.currentPlayer = false;
    this.computer.playTurn();
    this.computer.updateBoard();
    this.computer.updateInfo();
    this.computer.updateResources();
    this.player.currentPlayer = true;
    this.player.resources++;
    this.player.updateResources();
    document.getElementById("buy-soldier").disabled = false;
  }

  // Méthode pour vérifier les combats entre les soldats du joueur et ceux de l'ordinateur
  checkForFights(message) {
    let isfight = false;
    let defeatedSoldiers1 = [];
    let defeatedSoldiers2 = [];
    let attacker = "Computer";

    this.player.soldiers.forEach((playerSoldier) => {
      this.computer.soldiers.forEach((computerSoldier) => {
        if (playerSoldier.position === computerSoldier.position) {
          isfight = true;
        }
      });
    });
    if (isfight) {
      console.log(message);
      defeatedSoldiers1 = defeatedSoldiers1.concat(
        this.fight(this.player.soldiers, this.computer.soldiers, attacker)
      );
      attacker = "Player";
      defeatedSoldiers2 = defeatedSoldiers2.concat(
        this.fight(this.computer.soldiers, this.player.soldiers, attacker)
      );
      alert("Fight started !!");
      console.log("Round " + this.roundCount + " ended!");
      console.log("-");
      console.log("-");
      console.log("-");
      console.log("-");
      console.log("-");
      this.removeDefeatedSoldiers(defeatedSoldiers1, defeatedSoldiers2);
      this.resetPositions();
      this.player.updateBoard();
      this.computer.updateBoard();
      this.player.updateInfo();
      this.computer.updateInfo();
      return true;
    }
  }

  fight(attacker, defender, message) {
    const defeatedSoldiers = [];
    let result = 0;
    console.log("-");
    console.log("-");
    console.log(message);
    for (let i = 0; i < attacker.length; i++) {
      // Calculate the defender index using modulo to wrap around if there are more attackers
      const defenderIndex = i % defender.length;
      for (let x = 0; x < attacker[i].attack; x++) {
        result += Math.floor(Math.random() * 3) + 1;
      }
      // Each attacker attacks the defender at the calculated index
      defender[defenderIndex].health = defender[defenderIndex].health - result;
      console.log(`Attacker ${i + 1} damage :${result}`);
      console.log(
        `Defender ${defenderIndex + 1} health : ${
          defender[defenderIndex].health
        }`
      );
      result = 0;
      // Check if the defender's health is below or equal to 0
      if (defender[defenderIndex].health <= 0) {
        // Add to defeated soldiers if not already included
        if (!defeatedSoldiers.includes(defender[defenderIndex])) {
          defeatedSoldiers.push(defender[defenderIndex]);
        }
      }
    }

    return defeatedSoldiers;
  }

  // Méthode pour retirer les soldats vaincus des listes de soldats du joueur et de l'ordinateur
  removeDefeatedSoldiers(defeatedSoldiers1, defeatedSoldiers2) {
    defeatedSoldiers1.forEach((soldier) => {
      const index = this.computer.soldiers.indexOf(soldier);
      if (index > -1) {
        this.computer.soldiers.splice(index, 1);
      }
    });
    defeatedSoldiers2.forEach((soldier) => {
      const index = this.player.soldiers.indexOf(soldier);
      if (index > -1) {
        this.player.soldiers.splice(index, 1);
      }
    });
  }

  // Méthode pour réinitialiser les positions des soldats au début d'un nouveau tour
  resetPositions() {
    this.roundCount++;
    console.log("Round " + this.roundCount + " started!");
    // Vider toutes les cellules avant de réinitialiser les positions
    const rows = document.getElementById("ring-table").rows;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].cells.length; j++) {
        rows[i].cells[j].innerHTML = "";
      }
    }
  }
}

// Initialisation du jeu
const game = new Game();
game.start();

const RING_SIZE = 10; // Taille de l'anneau
const MAX_SOLDIERS = 4; // Nombre maximum de soldats
const SOLDIER_TYPES = {
  k: Knight,
  l: KnightLeader,
  e: Elve,
  c: ElveChief,
};
