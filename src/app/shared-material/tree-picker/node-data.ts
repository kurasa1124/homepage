import { MatTreePickerNode } from "./tree-picker-node";
import { DataSource } from "@angular/cdk/table";
import { MatTreePickerNodeList } from "./tree-picker-node-list";

export interface NodeData {
  nodeDirective?: MatTreePickerNode<any>;
  nodeListDirective?: MatTreePickerNodeList<any>;
  getChildren(): DataSource<NodeData>;
  hasChildren(): boolean | Promise<boolean>;
}
