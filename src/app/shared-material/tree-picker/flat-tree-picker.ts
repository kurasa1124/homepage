import { Component, OnDestroy } from "@angular/core";

import { NodeData } from "./node-data";
import { MatTreePicker } from "./tree-picker";

@Component({
  selector: "mat-flat-tree-picker",
  template: `
    <div class="mat-tree-picker-panel" role="listbox">
      <mat-tree-picker-node-list
        #list
        [dataSource]="dataSource"
        [nodeDef]="matTreePickerNode"
        [side]="side"
      ></mat-tree-picker-node-list>
    </div>
    <ng-template #panel></ng-template>
  `,
  styleUrls: ["tree-picker.scss"],
  exportAs: "matFlatTreePicker",
  host: {
    class: "mat-flat-tree-picker",
    role: "tree"
  }
})
export class MatFlatTreePicker<T extends NodeData> extends MatTreePicker<T>
  implements OnDestroy {
  public ngOnDestroy() {
    this.list.closePanel();
  }
}
