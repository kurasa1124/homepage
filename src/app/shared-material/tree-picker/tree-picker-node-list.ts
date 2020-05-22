import { CollectionViewer, ListRange } from "@angular/cdk/collections";
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { DataSource } from "@angular/cdk/table";
import { getTreeNoValidDataSourceError } from "@angular/cdk/tree";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  Renderer2,
  TrackByFunction,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { Observable, of as Of, Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { matTreePickerAnimations } from "./animations";
import { NodeData } from "./node-data";
import { MatTreePickerOutlet } from "./outlet";
import { MatTreePickerNode, MatTreePickerNodeDef } from "./tree-picker-node";

const rightPositions: ConnectedPosition[] = [
  {
    originX: "end",
    overlayX: "start",
    originY: "top",
    overlayY: "top",
    offsetY: -8
  },
  {
    originX: "end",
    overlayX: "start",
    originY: "bottom",
    overlayY: "bottom"
  }
];

const leftPosition: ConnectedPosition[] = [
  {
    originX: "start",
    overlayX: "end",
    originY: "top",
    overlayY: "top",
    offsetY: -8
  },
  {
    originX: "start",
    overlayX: "end",
    originY: "bottom",
    overlayY: "bottom"
  }
];

@Component({
  selector: "mat-tree-picker-node-list",
  template: `
    <div
      class="mat-tree-picker-node-list mat-elevation-z{{ 2 + depth }}"
      [ngClass]="classList"
      [@transformMenu]="panelAnimationState"
      (@transformMenu.start)="isAnimating = true"
      (@transformMenu.done)="onAnimationDone($event)"
    >
      <div class="mat-menu-content"><div matTreePickerOutlet></div></div>
    </div>
  `,
  animations: [matTreePickerAnimations.transformList]
})
export class MatTreePickerNodeList<T extends NodeData>
  implements OnDestroy, CollectionViewer {
  public viewChange: Observable<ListRange>;
  private dataSubscription: Subscription | null;
  private onDestroy = new Subject<void>();
  private _dataDiffer: IterableDiffer<T>;

  @Input()
  public classList;

  @ViewChild(MatTreePickerOutlet)
  public nodeOutlet: MatTreePickerOutlet;

  public panelAnimationState: "void" | "enter" = "enter";
  public animationDone = new Subject<AnimationEvent>();
  public isAnimating: boolean;

  private overlayRef: OverlayRef | null;
  private portal: ComponentPortal<MatTreePickerNodeList<NodeData>>;
  public positionStrategy: FlexibleConnectedPositionStrategy;
  public depth = 2;
  public isOpen: boolean = false;

  //#region nodes
  private _nodes: T[] | ReadonlyArray<T> = [];

  public get nodes(): T[] | ReadonlyArray<T> {
    return this._nodes;
  }

  public set nodes(nodes: T[] | ReadonlyArray<T>) {
    if (this._nodes === nodes) return;
    this._nodes = nodes;
    this.hovered = nodes[0];
  }
  //#endregion nodes

  //#region @Input() hovered
  private _hovered: T = null;

  @Input()
  get hovered(): T {
    return this._hovered;
  }

  set hovered(hovered: T) {
    if (this._hovered === hovered) return;
    this._hovered = hovered;
    this.ensureHoverClass();
    this.ensureScrollTop();
  }
  //#endregion @Input() hovered

  @Input()
  public nodeDef: MatTreePickerNodeDef<T>;

  @Input()
  public trackBy: TrackByFunction<T>;

  private _dataSource: DataSource<T> | Observable<T[]> | T[];

  @Input()
  public get dataSource(): DataSource<T> | Observable<T[]> | T[] {
    return this._dataSource;
  }

  public set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }

  public parent: NodeData;

  public expanded: MatTreePickerNodeList<NodeData>;

  @Input()
  public side = "right";

  public constructor(
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
    private element: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private _differs: IterableDiffers,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  public selectPreviousNode() {
    if (this.expanded) {
      this.expanded.selectPreviousNode();
    } else if (this.hovered) {
      let idx = this.nodes.indexOf(this.hovered) + this.nodes.length - 1;
      idx = idx % this.nodes.length;
      this.hovered = this.nodes[idx];
    } else {
      this.hovered = this.nodes[0];
    }
  }

  public selectNextNode() {
    if (this.expanded) {
      this.expanded.selectNextNode();
    } else if (this.hovered) {
      let idx = this.nodes.indexOf(this.hovered) + 1;
      idx = idx % this.nodes.length;
      this.hovered = this.nodes[idx];
    } else {
      this.hovered = this.nodes[0];
    }
  }

  public selectPreviousLevel() {
    if (this.expanded && this.expanded.expanded) {
      this.expanded.selectPreviousLevel();
    } else {
      this.closePanel();
      this.expanded = null;
    }
  }

  public selectNextLevel() {
    if (this.expanded) {
      this.expanded.selectNextLevel();
    } else {
      if (!this.hovered) {
        this.hovered = this.nodes[0];
      }
      if (this.hovered.hasChildren && this.hovered.hasChildren()) {
        this.openNextLevelt(this.hovered);
      }
    }
  }

  public selectNode() {
    if (this.expanded) {
      this.expanded.selectNode();
    } else {
      this.hovered.nodeDirective.select(null);
    }
  }

  public closePanel() {
    if (this.expanded) {
      this.expanded.closePanel();
    }

    if (!this.isOpen) {
      return;
    }

    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }

    this.isOpen = false;
  }

  private openNextLevelt(node: NodeData) {
    this.portal = new ComponentPortal(
      MatTreePickerNodeList,
      this.viewContainerRef
    );

    this.overlayRef = this.overlay.create(this.getOverlayConfig());

    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      let ref = this.overlayRef.attach(this.portal);
      ref.instance.nodeDef = this.nodeDef;
      ref.instance.dataSource = node.getChildren();
      ref.instance.depth = this.depth + 1;
      ref.instance.isOpen = true;
      ref.instance.side = this.side;
      ref.instance.classList = this.classList;
      ref.instance.parent = this.hovered;
      this.expanded = ref.instance;
      this.isOpen = true;
    }
  }

  private ensureScrollTop() {
    if (!this.hovered || !this.hovered.nodeDirective) return;
    let tElement = this.hovered.nodeDirective.element.nativeElement;
    let tTop = tElement.offsetTop;
    let tHeight = tElement.clientHeight;
    let sElement = this.element.nativeElement.querySelector(
      ".mat-menu-content"
    );
    let min = sElement.scrollTop;
    let max = sElement.scrollTop + sElement.clientHeight - tHeight;
    if (tTop < min) {
      sElement.scrollTop = tTop;
    } else if (tTop >= max) {
      sElement.scrollTop = tTop - sElement.clientHeight + tHeight;
    }
  }

  private getHostWidth(): number {
    return this.element.nativeElement.getBoundingClientRect().width;
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      // width: this.getHostWidth(),
      positionStrategy: this.getOverlayPosition(),
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  private getOverlayPosition(): PositionStrategy {
    this.positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.hovered.nodeDirective.element)
      .withPositions(
        this.side === "right"
          ? [...rightPositions, ...leftPosition]
          : [...leftPosition, ...rightPositions]
      );
    return this.positionStrategy;
  }

  public onAnimationDone(event: AnimationEvent) {
    this.animationDone.next(event);
    this.isAnimating = false;
  }

  public ngAfterViewInit() {
    this.ensureHoverClass();
  }

  private ensureHoverClass() {
    let nodeIdx = this.nodes.indexOf(this._hovered);
    let prevHovered = this.element.nativeElement.querySelector(".hover");
    if (prevHovered) this.renderer.removeClass(prevHovered, "hover");
    let hovered = this.element.nativeElement
      .querySelectorAll("mat-tree-picker-node")
      .item(nodeIdx);
    if (hovered) this.renderer.addClass(hovered, "hover");
  }

  private _switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
    if (
      this._dataSource &&
      typeof (this._dataSource as DataSource<T>).disconnect === "function"
    ) {
      (this.dataSource as DataSource<T>).disconnect(this);
    }

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
      this.dataSubscription = null;
    }

    if (!dataSource) {
      this.nodeOutlet.viewContainer.clear();
    }

    this._dataSource = dataSource;
    this._observeRenderChanges();
  }

  private _observeRenderChanges() {
    let dataStream: Observable<T[] | ReadonlyArray<T>> | undefined;

    if (typeof (this._dataSource as DataSource<T>).connect === "function") {
      dataStream = (this._dataSource as DataSource<T>).connect(this);
    } else if (this._dataSource instanceof Observable) {
      dataStream = this._dataSource;
    } else if (Array.isArray(this._dataSource)) {
      dataStream = Of(this._dataSource);
    }

    if (dataStream) {
      this.dataSubscription = dataStream
        .pipe(takeUntil(this.onDestroy))
        .subscribe(data => this.renderNodeChanges(data));
    } else {
      throw getTreeNoValidDataSourceError();
    }
  }

  public renderNodeChanges(
    data: T[] | ReadonlyArray<T>,
    viewContainer: ViewContainerRef = this.nodeOutlet.viewContainer,
    parentData?: T
  ) {
    if (this._dataDiffer === undefined) {
      this._dataDiffer = this._differs.find([]).create(this.trackBy);
    }
    const changes = this._dataDiffer.diff(data);

    if (!changes) {
      return;
    }

    changes.forEachOperation(
      (
        item: IterableChangeRecord<T>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null
      ) => {
        if (item.previousIndex == null) {
          this.insertNode(data[currentIndex!], currentIndex!, viewContainer);
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex!);
        } else {
          const view = viewContainer.get(adjustedPreviousIndex!);
          viewContainer.move(view!, currentIndex);
        }
      }
    );

    this.nodes = data;
    this._changeDetectorRef.detectChanges();
  }

  public ngOnDestroy() {
    this.nodeOutlet.viewContainer.clear();

    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private insertNode(node: T, index: number, viewContainer?: ViewContainerRef) {
    const context = {
      $implicit: node,
      index: index
    };

    const container = viewContainer
      ? viewContainer
      : this.nodeOutlet.viewContainer;

    container.createEmbeddedView(this.nodeDef.template, context, index);

    if (MatTreePickerNode.mostRecentTreeNode) {
      node.nodeListDirective;
      MatTreePickerNode.mostRecentTreeNode.node = node;
      node.nodeListDirective = this;
    }
  }
}
