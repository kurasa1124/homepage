import { NgModule } from "@angular/core";
import { MatTreePicker } from "./tree-picker";
import { MatTreePickerTrigger } from "./tree-picker-trigger";
import { MatTreePickerNode, MatTreePickerNodeDef } from "./tree-picker-node";
import { MAT_TREE_PICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from "./scroll-strategy";
import { CommonModule } from "@angular/common";
import { MatTreePickerNodeList } from "./tree-picker-node-list";
import { MatTreePickerOutlet } from "./outlet";
import { MatFlatTreePicker } from "./flat-tree-picker";
import { MatRippleModule } from "@angular/material";

@NgModule({
  declarations: [
    MatTreePicker,
    MatFlatTreePicker,
    MatTreePickerTrigger,
    MatTreePickerNode,
    MatTreePickerNodeList,
    MatTreePickerNodeDef,
    MatTreePickerOutlet
  ],
  imports: [CommonModule, MatRippleModule],
  providers: [MAT_TREE_PICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
  exports: [
    MatTreePicker,
    MatFlatTreePicker,
    MatTreePickerTrigger,
    MatTreePickerNode,
    MatTreePickerNodeDef
  ],
  entryComponents: [MatTreePickerNodeList]
})
export class MatTreePickerModule {}
