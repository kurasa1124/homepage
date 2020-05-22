import { Overlay, ScrollStrategy } from "@angular/cdk/overlay";
import { InjectionToken } from "@angular/core";

export const MAT_TREE_PICKER_SCROLL_STRATEGY = new InjectionToken<
  () => ScrollStrategy
>("mat-tree-picker-scroll-strategy");

export function MAT_TREE_PICKER_SCROLL_STRATEGY_FACTORY(
  overlay: Overlay
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

export const MAT_TREE_PICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: MAT_TREE_PICKER_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_TREE_PICKER_SCROLL_STRATEGY_FACTORY
};
