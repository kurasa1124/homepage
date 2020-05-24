import { Component, OnInit } from "@angular/core";
import { sleep } from "../shared/sleep";

@Component({
  selector: "app-tic-tac-toe",
  templateUrl: "./tic-tac-toe.component.html",
  styleUrls: ["./tic-tac-toe.component.scss"],
})
export class TicTacToeComponent implements OnInit {
  public isYou: boolean;
  public isWin: string;

  public ooxx: boolean[][];

  public get isPlaying() {
    let ooxx = this.ooxx.join(",").split(",");
    let hasOX = ooxx.find((ox) => !!ox);
    if (hasOX) return true;
    return false;
  }

  constructor() {
    this.reset();
  }

  ngOnInit(): void {}

  public reset() {
    this.ooxx = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
    this.isWin = null;
    this.isYou = true;
  }

  public select(num) {
    this.ooxx = this.ooxx.map((row, rowIdx) =>
      row.map((col, colIdx) => {
        let idx = rowIdx * 3 + colIdx;
        if (idx == num) col = true;
        return col;
      })
    );

    this.isWin = this._judgeWin(this.ooxx);
    if (this.isWin === null) this.computerTurn();
  }

  public async computerTurn() {
    this.isYou = false;
    if (this.isPlaying) await sleep(500);

    let ooxx = this.ooxx.join(",").split(",");
    let willWin = ooxx
      .map((x, idx) => this._findWillWin(idx, "false"))
      .find((d) => d !== null);
    let willFail = ooxx
      .map((o, idx) => this._findWillWin(idx, "true"))
      .find((d) => d !== null);

    if (typeof willWin == "number") this._resist(willWin);
    else if (typeof willFail == "number") this._resist(willFail);
    else this._goRandom();

    this.isWin = this._judgeWin(this.ooxx);
  }

  private _resist(num) {
    this.ooxx = this.ooxx.map((row, rowIdx) =>
      row.map((col, colIdx) => {
        let idx = rowIdx * 3 + colIdx;
        if (num !== idx) return col;
        col = false;
        return col;
      })
    );
    this.isYou = true;
  }

  private _goRandom() {
    let ooxx = this.ooxx.join(",").split(",");
    let empty = ooxx.map((ox, i) => (!ox ? i : null)).filter((i) => i !== null);
    let random = Math.floor(Math.random() * empty.length);
    let idx = empty[random];
    this._resist(idx);
  }

  private _findWillWin(idx, turn: string) {
    let ooxx = this.ooxx.join(",").split(",");
    if (ooxx[idx] !== "") return null;
    ooxx[idx] = turn;
    let res = this._judgeWin(ooxx);
    return res ? idx : null;
  }

  private _judgeWin(demo) {
    let ooxx = demo.join(",").split(",");
    let wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let isWin = wins.find(
      (win) =>
        !!ooxx[win[0]] &&
        ooxx[win[0]] == ooxx[win[1]] &&
        ooxx[win[1]] == ooxx[win[2]]
    );
    let isTie = !ooxx.some((tie) => !tie);
    if (isWin) return ooxx[isWin[0]];
    if (isTie) return "tie";
    return null;
  }
}
