import Game from "@controllers/./game.controller"
import GameObject from "@global/game-object.class";
import * as enemiesAssets from "@values/enemies.assets.json";

// import interfaces
import {IEnemy} from "@interfaces/enemies.interfaces";
// import constants
import {TEnemyType} from "@constants/enemies.types";
// import utils
import {collisionByPixel, getBetweenOrEqual, getCollision, Random} from "@utils/func.util";
import * as playerAssets from "@values/player.assets.json";


class Enemy extends GameObject {

  // dev triggers
  private unlimitedEnemies: boolean = true;
  private enemiesLimit: number = 6;
  // private values
  private interval: number;

  // public values
  public enemies: IEnemy[] = [];
  public minSeconds: number = 1;
  public maxSeconds: number = 2;

  /**
   * Return an random enemy type
   */
  private static randomEnemyType () : string {
    const enemyTypes: TEnemyType[] = ["groundbell", "motobug"];
    return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  }

  constructor() {
    super(enemiesAssets.path);
    this.setupEnemies(1000);
  }

  /**
   * Validate the position of layer, to detect some colision with the enemy
   * @param enemy
   */
  private handleCollider =  (enemy: IEnemy): void => {
    const player = Game.player;
    /* const collision: boolean = getCollision(
      enemy.x,
      enemy.y,
      enemy.w,
      enemy.h,
      player.x,
      player.y,
      player.w,
      player.h,
      3
    ); */

    const collisionPixel = collisionByPixel(this.canvas, player.canvas);

    if (collisionPixel) {
      Game.gameOver();
      Game.hud.showGameOver();
    }

  }; // handleCollider

  /**
   * Add an new enemy to the game scene
   * @param enemyType
   */
  public newEnemy = (enemyType: TEnemyType): void => {
    const enemyValues = enemiesAssets[enemyType];
    const enemy: IEnemy = {
      h: enemyValues.height,
      w: enemyValues.width,
      x: Game.width + (enemyValues.width * 2),
      y: (Game.floorPosition - enemyValues.height),
      frame: 0,
      type: enemyType
    };

    if (this.unlimitedEnemies || !this.unlimitedEnemies && this.enemies.length < this.enemiesLimit){
      this.enemies.push(enemy);
    }
  }; // newEnemy

  /**
   * Render all of enemies in the scene, usin the game speed to move enemy to left
   */
  public render = (): void => {
    this.ctx.clearRect(0, 0, Game.width, Game.height);

    const enemies: IEnemy[] = this.enemies.map((enemy: IEnemy) => {
      const enemyValues = enemiesAssets[enemy.type];
      const frameX = (enemy.frame * enemy.w);
      const frameY = enemyValues.offsetY;

      this.ctx.drawImage(
        this.asset,
        frameX,
        frameY,
        enemy.w,
        enemy.h,
        enemy.x,
        enemy.y,
        enemy.w,
        enemy.h
      );

      this.handleCollider(enemy);

      if (Game.showCollisors) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.rect(enemy.x, enemy.y, enemy.w, enemy.h);
        this.ctx.stroke();
      }

      enemy.frame = ((enemy.frame + 1) >= enemyValues.frames) ? enemyValues.repeatFrom : (enemy.frame + 1);
      enemy.x -= Game.miscSpeed;

      if (enemy.x + enemy.w < 0){ return null}
      return enemy;
    });

    this.enemies = enemies.filter((enemy: IEnemy) => !!enemy);;
  }; // renderEnemies

  private setupEnemies = (interval: number): void => {

    this.interval = setInterval(() => {
      clearInterval(this.interval);
      this.newEnemy(Enemy.randomEnemyType());
      const intervalTime = Random(this.minSeconds, this.maxSeconds);
      this.setupEnemies(intervalTime * 1000);
    }, interval);

  }; // setupEnemies
}

export default Enemy;
