import { Rect } from "./picture";

export type Cursor =
  | "default"
  | "move"
  | "ew-resize"
  | "ns-resize"
  | "nesw-resize"
  | "nwse-resize";

export function findCursor(x: number, y: number, rect: Rect) {
  let [left, right, top, bottom] = [
    rect.x,
    rect.x + rect.width,
    rect.y,
    rect.y + rect.height,
  ];
  let isMove = x > left - 5 && x < right + 5 && y > top - 5 && y < bottom + 5;
  let isEw = (x > left - 5 && x < left + 5) || (x < right + 5 && x > right - 5);
  let isNs = (y > top - 5 && y < top + 5) || (y < bottom + 5 && y > bottom - 5);
  let isNesw =
    (x < right + 5 && x > right - 5 && y > top - 5 && y < top + 5) ||
    (x > left - 5 && x < left + 5 && y < bottom + 5 && y > bottom - 5);
  let isNwse =
    (x < right + 5 && x > right - 5 && y < bottom + 5 && y > bottom - 5) ||
    (x > left - 5 && x < left + 5 && y > top - 5 && y < top + 5);
  switch (true) {
    case isMove && isNesw:
      return "nesw-resize";
    case isMove && isNwse:
      return "nwse-resize";
    case isMove && isEw:
      return "ew-resize";
    case isMove && isNs:
      return "ns-resize";
    case isMove:
      return "move";
    default:
      return "default";
  }
}
