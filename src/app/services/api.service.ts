import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private userService: UserService,
    private http: HttpClient
  ) { }

  // @ts-ignore
  private apiUrl = this.userService.apiUrl;

  getApiData(route: string) {
    const response = this.http.get(this.apiUrl + route)
    return lastValueFrom(response);
  }
}
