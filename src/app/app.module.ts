import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from '../welcome/welcome.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from '../core/core.module';
import { AuthComponent } from '../auth/auth.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    // pathMatch: 'full'
  },
  // {
  //   path: '',
  //   redirectTo: '/login',
  //   pathMatch: 'full'
  // },
  // {
  //   path: 'welcome',
  //   component: WelcomeComponent,
  // },
];
@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    CoreModule,
    RouterModule.forRoot(routes, { enableTracing: true })
    // AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
