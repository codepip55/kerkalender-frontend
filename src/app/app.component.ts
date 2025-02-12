import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertComponent } from './components/alert/alert.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserService } from './services/user.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app-root',
    imports: [
      RouterOutlet,
      AlertComponent,
      SpinnerComponent,
      NavComponent,
      FooterComponent,
      NgIf,
      AsyncPipe,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Kerkalender';
  constructor(
    public userService: UserService
  ) {
  }
}
