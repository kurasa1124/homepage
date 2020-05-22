import {
  Component,
  Directive,
  Input,
  TemplateRef,
  ElementRef,
  Output,
  EventEmitter,
  Renderer2
} from "@angular/core";

import { NodeData } from "./node-data";
import { delay } from "bluebird";

@Component({
  selector: "mat-tree-picker-node",
  template: `
    <ng-content></ng-content>
  `,
  host: {
    "(click)": "select($event)",
    "(mousemove)": "hover()"
  }
})
export class MatTreePickerNode<T extends NodeData> {
  static mostRecentTreeNode: MatTreePickerNode<NodeData>;

  public _node: T;

  @Input()
  public set node(node: T) {
    this._node = node;
    this._node.nodeDirective = this;
    new Promise((resolve, reject) =>
      resolve(this.node.hasChildren ? this.node.hasChildren() : false)
    ).then(hasChildren => {
      if (hasChildren) {
        this.renderer.addClass(this.element.nativeElement, "has-children");
      } else {
        this.renderer.removeClass(this.element.nativeElement, "has-children");
      }
    });
  }

  public get node(): T {
    return this._node;
  }

  @Output()
  public selected = new EventEmitter<T>();

  public async select($event: MouseEvent) {
    if ($event) {
      $event.stopPropagation();
    }
    await delay(1);
    this.selected.next(this.node);
  }

  public hover() {
    this.node.nodeListDirective.hovered = this.node;
    if (this.node.nodeListDirective.expanded) {
      if (this.node.nodeListDirective.expanded.parent !== this.node) {
        this.node.nodeListDirective.closePanel();
        this.node.nodeListDirective.expanded = null;
      }
    } else {
      this.node.nodeListDirective.selectNextLevel();
    }
  }

  public constructor(
    public element: ElementRef<HTMLElement>,
    public renderer: Renderer2
  ) {
    MatTreePickerNode.mostRecentTreeNode = this;
  }
}

@Directive({
  selector: "[matTreePickerNodeDef]"
})
export class MatTreePickerNodeDef<T> {
  public constructor(public template: TemplateRef<any>) {}
}
