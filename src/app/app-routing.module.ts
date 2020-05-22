import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClockComponent } from "./clock/clock.component";

const routes: Routes = [{ path: "clock", component: ClockComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
