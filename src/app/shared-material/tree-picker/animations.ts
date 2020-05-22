import {
  animate,
  AnimationTriggerMetadata,
  sequence,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";

export const matTreePickerAnimations: {
  readonly transformList: AnimationTriggerMetadata;
} = {
  transformList: trigger("transformMenu", [
    state(
      "void",
      style({
        opacity: 0,
        transform: "scale(0.01, 0.01)"
      })
    ),
    transition(
      "void => enter",
      sequence([
        style({ opacity: 1 }),
        animate(
          "100ms linear",
          style({ opacity: 1, transform: "scale(1, 0.5)" })
        ),
        animate(
          "300ms cubic-bezier(0.25, 0.8, 0.25, 1)",
          style({ transform: "scale(1, 1)" })
        )
      ])
    ),
    transition("* => void", animate("150ms 50ms linear", style({ opacity: 0 })))
  ])
};
