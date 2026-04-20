import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';
import { tap } from 'rxjs';

export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startedAt = Date.now();

  console.log('[HTTP REQUEST]', {
    method: req.method,
    url: req.urlWithParams,
    body: req.body,
    params: req.params.keys().reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = req.params.get(key);
      return acc;
    }, {}),
    headers: req.headers.keys().reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = req.headers.get(key);
      return acc;
    }, {})
  });

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          console.log('[HTTP RESPONSE]', {
            method: req.method,
            url: req.urlWithParams,
            status: event.status,
            statusText: event.statusText,
            durationMs: Date.now() - startedAt,
            body: event.body
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('[HTTP ERROR RESPONSE]', {
          method: req.method,
          url: req.urlWithParams,
          status: error.status,
          message: error.message,
          durationMs: Date.now() - startedAt,
          error: error.error
        });
      }
    })
  );
};