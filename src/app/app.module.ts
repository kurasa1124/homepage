import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ClockComponent } from "./clock/clock.component";
import { RouletteComponent } from "./roulette/roulette.component";
import { SharedMaterialModule } from "./shared-material/shared-material.module";

@NgModule({
  declarations: [AppComponent, ClockComponent, RouletteComponent],
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
