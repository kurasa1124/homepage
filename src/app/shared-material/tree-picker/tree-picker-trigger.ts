import {
  DOWN_ARROW,
  ENTER,
  ESCAPE,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW
} from "@angular/cdk/keycodes";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { DOCUMENT } from "@angular/common";
import {
  Directive,
  ElementRef,
  Host,
  Inject,
  Input,
  Optional,
  ViewContainerRef
} from "@angular/core";
import { MatFormField } from "@angular/material";
import { fromEvent, merge, Observable, of as Of, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { ReadableError } from "../../../../util/readable-error";
import { NodeData } from "./node-data";
import { MAT_TREE_PICKER_SCROLL_STRATEGY } from "./scroll-strategy";
import { MatTreePicker } from "./tree-picker";
import { MatTreePickerNodeList } from "./tree-picker-node-list";

@Directive({
  selector: "[matTreePicker]",
  host: {
    autocomplete: "off",
    "(focusin)": "_onFocusIn($event)",
    "(keydown)": "_onKeydown($event)"
  }
})
export class MatTreePickerTrigger<T extends NodeData = NodeData> {
  public isOpen = false;
  private overlayRef: OverlayRef | null;
  private portal: TemplatePortal<MatTreePickerNodeList<NodeData>>;
  private manuallyFloatingLabel = false;
  public canClose = false;
  public timer = null;

  @Input()
  public matTreePicker: MatTreePicker<T>;

  private closingActionsSubscription: Subscription;

  public constructor(
    @Optional()
    @Host()
    private formField: MatFormField,
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
    private element: ElementRef<HTMLElement>,
    @Inject(MAT_TREE_PICKER_SCROLL_STRATEGY) private scrollStrategy,
    @Optional()
    @Inject(DOCUMENT)
    private _document: any
  ) {}

  public _onFocusIn($event: FocusEvent) {
    this.open();
  }

  public _onKeydown($event: KeyboardEvent) {
    switch ($event.keyCode) {
      case UP_ARROW:
        this.matTreePicker.selectPreviousNode();
        break;

      case DOWN_ARROW:
        this.matTreePicker.selectNextNode();
        break;

      case LEFT_ARROW:
        this.matTreePicker.selectPreviousLevel();
        break;

      case RIGHT_ARROW:
        this.matTreePicker.selectNextLevel();
        break;

      case ESCAPE:
        this.closePanel();
        break;

      case ENTER:
      case SPACE:
        this.matTreePicker.selectNode();
    }
  }

  public open() {
    if (this.isOpen) {
      return;
    }
    this.attachOverlay();
    this.floatLabel(true);
    this.canClose = false;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.canClose = true;
    }, 100);
  }

  private getConnectedElement(): ElementRef {
    return this.formField
      ? this.formField.getConnectedOverlayOrigin()
      : this.element;
  }

  private getPanelWidth(): number | string {
    return this.matTreePicker.panelWidth || this.getHostWidth();
  }

  private getHostWidth(): number {
    return this.getConnectedElement().nativeElement.getBoundingClientRect()
      .width;
  }

  private async attachOverlay() {
    if (!this.matTreePicker) {
      throw new ReadableError("屬性 matTreePicker 尚未設定");
    }

    if (!this.overlayRef) {
      this.portal = new TemplatePortal(
        this.matTreePicker.panel,
        this.viewContainerRef
      );
      this.overlayRef = this.overlay.create(this.getOverlayConfig());
    } else {
      this.overlayRef.updateSize({ width: this.getPanelWidth() });
    }

    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      this.overlayRef.attach(this.portal);
      this.closingActionsSubscription = this.getOutsideClickStream().subscribe(
        _ => this.closePanel()
      );
      if (this.matTreePicker.list) {
        this.matTreePicker.list.isOpen = true;
      }
    }

    this.isOpen = true;
  }

  private floatLabel(shouldAnimate = false): void {
    if (this.formField && this.formField.floatLabel === "auto") {
      if (shouldAnimate) {
        this.formField._animateAndLockLabel();
      } else {
        this.formField.floatLabel = "always";
      }

      this.manuallyFloatingLabel = true;
    }
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.getConnectedElement())
        .withPush(true)
        .withPositions([
          {
            originX: "start",
            originY: "bottom",
            overlayX: "start",
            overlayY: "top"
          },
          {
            originX: "end",
            originY: "center",
            overlayX: "start",
            overlayY: "center"
          }
        ]),
      hasBackdrop: false,
      scrollStrategy: this.scrollStrategy(),
      direction: "ltr"
    });
  }

  private getOutsideClickStream(): Observable<any> {
    if (!this._document) {
      return Of(null);
    }

    return merge(
      fromEvent<KeyboardEvent>(this._document, "keydown").pipe(
        filter(event => event.keyCode === ESCAPE)
      ),
      merge(
        fromEvent<MouseEvent>(this._document, "click"),
        fromEvent<TouchEvent>(this._document, "touchend")
      ).pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          const formField = this.getConnectedElement().nativeElement;
          return (
            this.isOpen &&
            clickTarget !== this.element.nativeElement &&
            (!formField || !formField.contains(clickTarget)) &&
            (!!this.overlayRef &&
              !this.overlayRef.overlayElement.contains(clickTarget))
          );
        })
      )
    );
  }

  private resetLabel(): void {
    if (this.manuallyFloatingLabel) {
      this.formField.floatLabel = "auto";
      this.manuallyFloatingLabel = false;
    }
  }

  public closePanel() {
    if (!this.canClose) {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.resetLabel();

    if (!this.isOpen) {
      return;
    }

    this.matTreePicker.closePanel();

    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
      this.closingActionsSubscription.unsubscribe();
    }

    this.isOpen = false;
  }
}
