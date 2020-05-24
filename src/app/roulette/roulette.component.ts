import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { sleep } from "../shared/sleep";
import { Roulette } from "./roulette";

@Component({
  selector: "app-roulette",
  templateUrl: "./roulette.component.html",
  styleUrls: ["./roulette.component.scss"],
})
export class RouletteComponent implements AfterViewInit {
  @ViewChild("roulette") roulette: ElementRef;
  public game: Roulette;
  public lights = new Array(44).fill(0).map((el, i) => i);

  constructor() {}

  async ngAfterViewInit() {
    await sleep(1);
    this.resetGame(5);
  }

  public resetGame(num: number) {
    if (!num) return;
    let start = Math.floor(Math.random() * 360);
    let speed = Math.random() * 3 * 10 + 35;
    this.game = new Roulette(
      this.roulette.nativeElement,
      num,
      speed,
      0,
      1000,
      false,
      start
    );
    this._fillSlices();
  }

  private async _fillSlices() {
    await this.game.fillSlices();
    let el = this.roulette.nativeElement as HTMLElement;
    let bg = this.game.slices.map((slice, i) => {
      let angle = (100 / this.game.slices.length) * (i + 1);
      return `${slice.color} 0 ${angle}%`;
    });
    el.style.backgroundImage = `conic-gradient(${bg.join(",")})`;
  }

  public setLight(lights: number[], i: number) {
    let angle = 360 / lights.length;
    let offset = angle / 2;
    return `translate(-50%,-50%) rotate(${angle * i + offset}deg)`;
  }

  public lightOn(i: number) {
    if (!this.game.isRolling) return 1;
    let length = this.lights.length;
    let angle = Math.floor(this.game.angle / length) % length;
    let idx = length - i;
    if (angle == idx - 1) return 1;
    if (angle == idx || (idx == length && angle == 0)) return 0.8;
    if (
      angle == idx + 1 ||
      (idx == length - 1 && angle == 0) ||
      (idx == length && angle == 1)
    )
      return 0.5;
    return 0.3;
  }
}
