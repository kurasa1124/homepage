import * as randomcolor from "randomcolor";
import { requestAnimationFrame } from "request-animation-frame-polyfill";

export class Roulette {
  public _speed: number;
  public angle: number = this.startAngle;
  public isRolling: boolean = false;
  public isSlowdown: boolean = false;
  public slices: Slice[];

  public get pointAt(): Slice {
    if (!this.slices) return;
    let angle = this.angle % 360;
    let last = this.slices.length - 1;
    let pointAt = this.slices.find((slice, i) => {
      if (i == last) return angle >= slice.angle;
      return angle < this.slices[i + 1].angle && angle >= slice.angle;
    });
    return pointAt;
  }

  constructor(
    public element: HTMLElement,
    public sliceAmount: number,
    public speed: number = 30,
    public autoStart: number = 0,
    public autoStop: number = 0,
    public clockwise: boolean = true,
    public startAngle: number = 0
  ) {
    if (sliceAmount) this.fillSlices();
  }

  public async fillSlices() {
    this.element.style.transform = `rotate(${this.startAngle}deg)`;
    this.slices = await Promise.all(
      new Array(this.sliceAmount).fill(0).map((slice, i) => {
        let id = i + 1;
        let angle = (360 / this.sliceAmount) * i;
        let color = randomcolor({ luminosity: "light" });
        let word = id + "獎";
        return { id, angle, color, word };
      })
    );

    if (this.autoStart) setTimeout(() => this.start(), this.autoStart);
  }

  public start() {
    if (this.isRolling) return;
    this._speed = this.speed;
    this.isRolling = true;
    this._rolling();
    if (this.autoStop) setTimeout(() => this.slowdown(), this.autoStop);
  }

  private _rolling() {
    let clockwise = this.clockwise ? 1 : -1;
    requestAnimationFrame(() => {
      this.angle += this._speed;
      this.element.style.transform = `rotate(${this.angle * clockwise}deg)`;
      if (this.isRolling) this._rolling();
    });
  }

  public slowdown() {
    this.isSlowdown = true;
    requestAnimationFrame(() => {
      this._speed -= (this._speed / this.speed) * 2;
      if (this._speed <= 0.1) this.stop();
      if (this.isRolling) this.slowdown();
    });
  }

  public stop() {
    this._speed = 0;
    this.isSlowdown = false;
    this.isRolling = false;
    this.next();
    console.log(this.pointAt);
  }

  public next() {
    alert("恭喜獲得：" + this.pointAt.word);
  }
}

export interface Slice {
  id: number;
  angle: number;
  color: string;
  word: string;
}
