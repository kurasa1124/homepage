import { DataSource } from "@angular/cdk/table";
import {
  Component,
  ContentChild,
  Input,
  TemplateRef,
  ViewChild
} from "@angular/core";

import { NodeData } from "./node-data";
import { MatTreePickerNodeDef } from "./tree-picker-node";
import { MatTreePickerNodeList } from "./tree-picker-node-list";
import { MatMenu } from "@angular/material";

@Component({
  selector: "mat-tree-picker",
  template: `
    <ng-template #panel>
      <div class="mat-tree-picker-panel" [ngClass]="_classList" role="listbox">
        <mat-tree-picker-node-list
          #list
          [dataSource]="dataSource"
          [nodeDef]="matTreePickerNode"
          [side]="side"
          [classList]="_classList"
        ></mat-tree-picker-node-list>
      </div>
    </ng-template>
  `,
  styleUrls: ["tree-picker.scss"],
  exportAs: "matTreePicker",
  host: {
    class: "mat-tree-picker",
    role: "tree"
  }
})
export class MatTreePicker<T extends NodeData = NodeData> extends MatMenu {
  @Input()
  public dataSource: DataSource<T>;

  @ViewChild("panel")
  public panel: TemplateRef<any>;

  @Input()
  public panelWidth: number;

  @ContentChild(MatTreePickerNodeDef)
  public matTreePickerNode: MatTreePickerNodeDef<T>;

  @ViewChild(MatTreePickerNodeList)
  public list: MatTreePickerNodeList<T>;

  @Input()
  public side: string = "right";

  public closePanel() {
    this.list.closePanel();
  }

  public selectPreviousNode() {
    this.list.selectPreviousNode();
  }

  public selectNextNode() {
    this.list.selectNextNode();
  }

  public selectPreviousLevel() {
    this.list.selectPreviousLevel();
  }

  public selectNextLevel() {
    this.list.selectNextLevel();
  }

  public selectNode() {
    this.list.selectNode();
  }
}
