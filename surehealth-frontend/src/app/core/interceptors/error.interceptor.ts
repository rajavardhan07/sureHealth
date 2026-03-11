import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';
      const isLoginRequest = req.url.includes('/api/auth/login');

      switch (error.status) {
        case 400:
          // Bad Request - validation errors
          message = error.error?.message || error.message || 'Invalid request data';
          break;
        case 401:
          if (isLoginRequest) {
            // Login failure - show backend error message
            message = error.error?.message || error.message || 'Invalid username or password';
          } else {
            // Session expired - clear storage and redirect
            message = 'Session expired. Please login again.';
            localStorage.clear();
            router.navigate(['/login']);
          }
          break;
        case 403:
          message = error.error?.message || error.message || 'You do not have permission to perform this action.';
          break;
        case 404:
          message = error.error?.message || error.message || 'The requested resource was not found.';
          break;
        case 409:
          // Conflict - duplicate resource
          message = error.error?.message || error.message || 'Resource already exists';
          break;
        case 500:
          message = error.error?.message || error.message || 'A server error occurred. Please try again later.';
          break;
        default:
          // For any other status code
          message = error.error?.message || error.message || 'An unexpected error occurred';
          break;
      }

      snackBar.open(message, 'Dismiss', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });

      return throwError(() => error);
    })
  );
};
