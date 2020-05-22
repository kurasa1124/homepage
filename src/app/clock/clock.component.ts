import { AfterViewInit, Component } from "@angular/core";

@Component({
  selector: "app-clock",
  templateUrl: "./clock.component.html",
  styleUrls: ["./clock.component.scss"],
})
export class ClockComponent implements AfterViewInit {
  public numbers = new Array(12).fill(0).map((e, i) => i + 1);

  constructor() {}

  ngAfterViewInit() {
    this._rotateClock();
  }

  private _rotateClock() {
    let time = new Date();

    let sec = document.querySelector(".s") as HTMLElement;
    let sRotate = (360 / 60) * time.getSeconds();
    sec.style.transform = `rotate(${sRotate}deg)`;

    let min = document.querySelector(".m") as HTMLElement;
    let mRotate = (360 / 60) * time.getMinutes();
    min.style.transform = `rotate(${mRotate}deg)`;

    let hour = document.querySelector(".h") as HTMLElement;
    let hRotate = (((360 / 12) * time.getHours()) / 60) * time.getMinutes();
    hour.style.transform = `rotate(${hRotate}deg)`;

    window.requestAnimationFrame(() => this._rotateClock());
  }
}
