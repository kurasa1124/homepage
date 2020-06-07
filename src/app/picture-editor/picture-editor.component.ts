import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { concat, fromEvent, Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { sleep } from "../shared/sleep";
import { toBase64 } from "../shared/toBase64";
import { Cursor, findCursor } from "./cursor";
import { Picture } from "./picture";

@Component({
  selector: "app-picture-editor",
  templateUrl: "./picture-editor.component.html",
  styleUrls: ["./picture-editor.component.scss"],
})
export class PictureEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvas") canvas: ElementRef;

  private _destroy$ = new Subject();
  public pictures: Picture[] = [];
  private _selectPic: Picture;
  public cursor: Cursor = "default";

  constructor(public element: ElementRef) {}

  ngAfterViewInit(): void {
    fromEvent(window, "resize")
      .pipe(debounceTime(300))
      .subscribe((event) => {
        this._drawCanvas();
      });
    this._dragEvent();
    this._mouseEvent();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _mouseEvent() {
    let el = this.element.nativeElement as HTMLElement;
    fromEvent(el, "mousedown")
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: MouseEvent) => {
        this._unSelectAll();

        this._selectPic = this.pictures
          .reverse()
          .find(
            (pic) =>
              findCursor(event.offsetX, event.offsetY, pic.rect) != "default"
          );
        this.pictures.reverse();

        if (this._selectPic) this._selectPic.isSelect = true;
        else this._selectPic = null;
        this._drawCanvas();
      });

    fromEvent(el, "mousemove")
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: MouseEvent) => {
        let select = this.pictures.find((pic) => pic.isSelect);
        if (!select) this.cursor = "default";
        else {
          this.cursor = findCursor(event.offsetX, event.offsetY, select.rect);
          this._drawCanvas();
        }
      });
  }

  private _dragEvent() {
    let el = this.element.nativeElement as HTMLElement;
    concat(
      fromEvent(el, "dragover"),
      fromEvent(el, "dragenter"),
      fromEvent(el, "dragend"),
      fromEvent(el, "dragleave")
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe((event) => event.preventDefault());

    fromEvent(el, "drop")
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files) {
          let files: FileList = event.dataTransfer.files;
          this.uploadFiles(files);
        }
      });
  }

  public async uploadFiles(files: FileList) {
    let canvas = this.canvas.nativeElement as HTMLCanvasElement;
    let imgFiles = Array.from(files);
    await Promise.all(
      imgFiles.map(async (file, idx) => {
        const isImage = file.type.includes("image");
        if (!isImage) return;
        this._unSelectAll();
        let base64 = await toBase64(file);
        let img = new Image();
        img.src = base64;
        img.onload = () => {
          let width = 300;
          let height = (img.height / img.width) * 300;
          let x = canvas.offsetWidth / 2 - width / 2;
          let y = canvas.offsetHeight / 2 - height / 2;
          let pic = new Picture(canvas, img);
          pic.rect = { x, y, width, height };
          pic.isSelect = idx == imgFiles.length - 1;
          this.pictures.push(pic);
        };
      })
    );

    await sleep(100);
    this._drawCanvas();
  }

  private _drawCanvas() {
    requestAnimationFrame(() => {
      let canvas = this.canvas.nativeElement as HTMLCanvasElement;
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      this.pictures.forEach((pic) => {
        ctx.drawImage(
          pic.img,
          pic.rect.x,
          pic.rect.y,
          pic.rect.width,
          pic.rect.height
        );
        if (!pic.isSelect) return;
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 5;
        ctx.strokeRect(pic.rect.x, pic.rect.y, pic.rect.width, pic.rect.height);
      });
    });
  }

  private _unSelectAll() {
    this.pictures.forEach((pic) => (pic.isSelect = false));
  }
}
