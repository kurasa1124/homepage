import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ClockComponent } from "./clock/clock.component";
import { PictureEditorComponent } from "./picture-editor/picture-editor.component";
import { RouletteComponent } from "./roulette/roulette.component";
import { SharedMaterialModule } from "./shared-material/shared-material.module";
import { TicTacToeComponent } from "./tic-tac-toe/tic-tac-toe.component";

@NgModule({
  declarations: [
    AppComponent,
    ClockComponent,
    RouletteComponent,
    TicTacToeComponent,
    PictureEditorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedMaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
