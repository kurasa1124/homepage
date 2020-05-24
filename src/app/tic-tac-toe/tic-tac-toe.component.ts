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

    if (this.isWin === null) this._computerTurn(num);
  }

  private async _computerTurn(num) {
    this.isYou = false;

    await sleep(500);

    let ooxx = this.ooxx.join(",").split(",");
    let willWin = ooxx
      .map((n, idx) => this._findWillWin(idx, "false"))
      .find((d) => d !== null);
    let willFail = ooxx
      .map((n, idx) => this._findWillWin(idx, "true"))
      .find((d) => d !== null);

    if (willWin) this._resist(willWin);
    else if (willFail) this._resist(willFail);
    else this._goNext();

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

  private _goNext() {
    this.ooxx = this.ooxx.map((row, rowIdx) =>
      row.map((col, colIdx) => {
        let idx = rowIdx * 3 + colIdx;
        if (col !== null || this.isYou) return col;
        col = false;
        this.isYou = true;
        return col;
      })
    );
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
