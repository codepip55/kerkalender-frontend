import { HttpInterceptorFn } from '@angular/common/http';
import { inject} from '@angular/core';
import { UserService } from '../services/user.service';
import { API_URL } from '../app.config';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const CsrfHeaderName = 'X-XSRF-TOKEN';
  const CsrfCookieName = 'X-XSRF-TOKEN';
  const ApiUrl = inject(API_URL);
  const token = inject(UserService).token;

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(CsrfCookieName + '=')) as string;
    if (token !== null && !req.headers.has(CsrfHeaderName)) {
      req = req.clone({ headers: req.headers.set(CsrfHeaderName, cookie )});
    }
  }

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
