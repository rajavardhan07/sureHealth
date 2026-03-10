import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.parseUrl('/login');
    // parseUrl('/login'); is synchronous and returns the parsed URL 
    // navigate(['/login']); is asynchronous and returns a Promise
    return false;
  }

  const requiredRole = route.data?.['role'] as string;
  if (requiredRole && authService.getRole() !== requiredRole) {
    router.parseUrl(authService.getRoleRoute());
    return false;
  }

  return true;
};
