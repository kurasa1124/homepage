import { Directive, ViewContainerRef, ElementRef } from "@angular/core";

@Directive({
  selector: "[matTreePickerOutlet]"
})
export class MatTreePickerOutlet {
  constructor(
    public viewContainer: ViewContainerRef,
    public element: ElementRef<HTMLElement>
  ) {}
}
