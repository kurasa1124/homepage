import { Component } from "@angular/core";

type Menu = { text: string; router: string };

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "homepage";

  public mainMenu: Menu[] = [
    { text: "CLOCK", router: "clock" },
    { text: "ROULETTE", router: "roulette" },
  ];
}
