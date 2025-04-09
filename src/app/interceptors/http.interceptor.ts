import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { API_URL } from '../app.config';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const ApiUrl = inject(API_URL);
  const token = inject(UserService).token;

  if (req.url.match(ApiUrl)) {
    if (token !== undefined) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token),
        withCredentials: true,
      });
      return next(authReq);
    } else {
      return next(req);
    }
  } else {
    return next(req);
  }
};
