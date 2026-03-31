import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent) },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'policies', loadComponent: () => import('./features/admin/policy-management/policy-management.component').then(m => m.PolicyManagementComponent) },
      { path: 'invoices', loadComponent: () => import('./features/admin/invoice-management/invoice-management.component').then(m => m.AdminInvoiceManagementComponent) },
      { path: 'plans', loadComponent: () => import('./features/admin/plan-management/plan-management.component').then(m => m.PlanManagementComponent) },
      { path: 'officers', loadComponent: () => import('./features/admin/officer-management/officer-management.component').then(m => m.OfficerManagementComponent) },
      { path: 'underwriters', loadComponent: () => import('./features/admin/underwriter-management/underwriter-management.component').then(m => m.UnderwriterManagementComponent) },
      { path: 'corporates', loadComponent: () => import('./features/admin/corporate-management/corporate-management.component').then(m => m.CorporateManagementComponent) },
      { path: 'claims', loadComponent: () => import('./features/admin/claim-management/claim-management.component').then(m => m.ClaimManagementComponent) }
    ]
  },

  {
    path: 'hr',
    loadComponent: () => import('./features/hr/hr-layout/hr-layout.component').then(m => m.HrLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'HR' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/hr/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent) },
      // { path: 'register', loadComponent: () => import('./features/hr/corporate-register/corporate-register.component').then(m => m.CorporateRegisterComponent) },
      { path: 'policies', loadComponent: () => import('./features/hr/policy-request/policy-request.component').then(m => m.HrPolicyRequestComponent) },
      { path: 'employees', loadComponent: () => import('./features/hr/employee-management/employee-management.component').then(m => m.HrEmployeeManagementComponent) },
      { path: 'claim-activity', loadComponent: () => import('./features/hr/claim-activity/claim-activity.component').then(m => m.HrClaimActivityComponent) },
      { path: 'invoices', loadComponent: () => import('./features/hr/invoice-management/invoice-management.component').then(m => m.HrInvoiceManagementComponent) },
      { path: 'simulator', loadComponent: () => import('./features/hr/hr-simulator/hr-simulator.component').then(m => m.HrSimulatorComponent) }
    ]
  },
  {
    path: 'employee',
    loadComponent: () => import('./features/employee/employee-layout/employee-layout.component').then(m => m.EmployeeLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'EMPLOYEE' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/employee/dashboard/dashboard.component').then(m => m.EmployeeDashboardComponent) },
      { path: 'file-claim', loadComponent: () => import('./features/employee/file-claim/file-claim.component').then(m => m.FileClaimComponent) },
      { path: 'my-claims', loadComponent: () => import('./features/employee/my-claims/my-claims.component').then(m => m.MyClaimsComponent) }
    ]
  },
  {
    path: 'claims-officer',
    loadComponent: () => import('./features/claims-officer/claims-officer-layout/claims-officer-layout.component').then(m => m.ClaimsOfficerLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'CLAIMS_OFFICER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/claims-officer/dashboard/dashboard.component').then(m => m.CODashboardComponent) },
      { path: 'queue', loadComponent: () => import('./features/claims-officer/review-queue/review-queue.component').then(m => m.ReviewQueueComponent) }
    ]
  },
  {
    path: 'underwriter',
    loadComponent: () => import('./features/underwriter/underwriter-layout/underwriter-layout.component').then(m => m.UnderwriterLayoutComponent),
    canActivate: [authGuard],
    data: { role: 'UNDERWRITER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/underwriter/underwriter-dashboard/underwriter-dashboard.component').then(m => m.UnderwriterDashboardComponent) },
      { path: 'simulator', loadComponent: () => import('./features/underwriter/underwriter-simulator/underwriter-simulator.component').then(m => m.UnderwriterSimulatorComponent) }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
