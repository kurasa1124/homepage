import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClockComponent } from "./clock/clock.component";
import { PictureEditorComponent } from "./picture-editor/picture-editor.component";
import { RouletteComponent } from "./roulette/roulette.component";
import { TicTacToeComponent } from "./tic-tac-toe/tic-tac-toe.component";

const routes: Routes = [
  { path: "clock", component: ClockComponent },
  { path: "roulette", component: RouletteComponent },
  { path: "tic-tac-toe", component: TicTacToeComponent },
  { path: "pic-editor", component: PictureEditorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
