import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-nav',
  imports: [
    RouterLink
  ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss'
})
export class NavComponent {
  constructor(private userService: UserService) {
  }

  getInitials() {
    const currentUser = this.userService.currentUser;
    const firstName = currentUser ? currentUser.nameFull.split(' ')[0] : '';
    const lastName = currentUser ? currentUser.nameFull.split(' ')[1] : '';
    return this.userService.getInitials(firstName, lastName);
  }
  getUserName(name: 'first' | 'last') {
    const currentUser = this.userService.currentUser;
    return currentUser ? currentUser.nameFull.split(' ')[name === 'first' ? 0 : 1] : '';
  }
  get isLoggedIn() {
    return this.userService.loggedIn;
  }
  logIn() {
    this.userService.login();
  }
  logout() {
    this.userService.logout();
  }
}
