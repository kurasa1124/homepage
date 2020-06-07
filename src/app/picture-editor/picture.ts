import { fromEvent } from "rxjs";
import { filter, map, mergeMap, takeUntil, tap } from "rxjs/operators";
import { deepClone } from "../shared/deepClone";
import { Cursor, findCursor } from "./cursor";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Picture {
  public isSelect: boolean = false;
  public start: Rect;
  public rect: Rect;
  constructor(public canvas: HTMLCanvasElement, public img: HTMLImageElement) {
    this._dragEvent();
  }

  private _dragEvent() {
    fromEvent(this.canvas, "mousedown")
      .pipe(
        filter(
          (event: MouseEvent) =>
            this.isSelect &&
            event.button == 0 &&
            findCursor(event.offsetX, event.offsetY, this.rect) != "default"
        ),
        tap(() => (this.start = deepClone(this.rect))),
        mergeMap((start: MouseEvent) =>
          fromEvent(document, "mousemove").pipe(
            takeUntil(fromEvent(document, "mouseup")),
            map((move: MouseEvent) => ({
              x: start.offsetX,
              y: start.offsetY,
              w: move.offsetX - start.offsetX,
              h: move.offsetY - start.offsetY,
              cursor: findCursor(start.offsetX, start.offsetY, this.start),
            }))
          )
        )
      )
      .subscribe((move) => {
        if (move.cursor == "move") this._move(move);
        else this._resize(move);
      });
  }

  private _move(move) {
    this.rect.x = this.start.x + move.w;
    this.rect.y = this.start.y + move.h;
  }

  private _resize(move) {
    let cursor = move.cursor as Cursor;
    switch (cursor) {
      case "ew-resize":
        this._ewResize(move);
        break;

      case "ns-resize":
        this._nsResize(move);
        break;

      default:
        this._ewResize(move);
        this._nsResize(move);
    }
  }

  private _ewResize(move) {
    let isRight = move.x > this.start.x + this.start.width / 2;
    if (isRight) this.rect.width = this.start.width + move.w;
    else {
      this.rect.width = this.start.width - move.w;
      this.rect.x = this.start.x + move.w;
    }
  }

  private _nsResize(move) {
    let isBottom = move.y > this.start.y + this.start.height / 2;
    if (isBottom) this.rect.height = this.start.height + move.h;
    else {
      this.rect.height = this.start.height - move.h;
      this.rect.y = this.start.y + move.h;
    }
  }
}
