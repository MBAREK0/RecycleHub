import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {UserService} from "../service/user.service";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Get token from storage
  const userId = localStorage.getItem('userId');
  console.log('guard', userId);

  if (!userId) {
    router.navigate(['/login']).then(r => console.log(r));
    return false;
  }

  // Decode token

  const requiredRoles: string[] = route.data['role'] || [];

  const userRole = localStorage.getItem('userRole');

  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    router.navigate(['/login']);
    return false;
  }


  return true;
};
