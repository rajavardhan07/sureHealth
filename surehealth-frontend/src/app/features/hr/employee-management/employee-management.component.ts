import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CorporateService } from '../../../core/services/corporate.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, CorporateClient, GroupPolicy } from '../../../shared/models';
import { BulkUploadDialogComponent } from '../bulk-upload-dialog/bulk-upload-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hr-employee-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.css'})
export class HrEmployeeManagementComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  corporate = signal<CorporateClient | null>(null);
  policies = signal<GroupPolicy[]>([]);
  employees = signal<Employee[]>([]);
  loadingEmps = signal(true);
  showAddForm = signal(false);
  createdCreds = signal<{ username: string; password: string } | null>(null);
  
  // Pagination & Filtering
  employeePage = signal(1);
  employeePageSize = 15;
  departmentFilter = signal('ALL');

  form: FormGroup;
  columns = ['name', 'department', 'designation', 'status'];
  todayDate: string;

  constructor(
    private corporateService: CorporateService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      department: ['', Validators.required],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      joinDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
    
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  selectedFile: File | null = null;
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  ngOnInit() {
    this.corporateService.getMyProfile().subscribe(c => this.corporate.set(c));
    this.corporateService.getMyPolicies().subscribe(p => this.policies.set(p.filter(pol => pol.status === 'APPROVED')));
    this.loadEmployees();
  }

  loadEmployees() {
    this.loadingEmps.set(true);
    this.corporateService.getMyEmployees().subscribe({
      next: (data) => { this.employees.set(data); 
        this.loadingEmps.set(false); },
      error: () => { this.loadingEmps.set(false); }
    });
  }

  get ageMetrics() {
    const emps = this.employees();
    if (emps.length === 0) return { under30: 0, thirties: 0, forties: 0, over50: 0 };
    return {
      under30: Math.round((emps.filter((e: any) => e.age && e.age < 30).length / emps.length) * 100),
      thirties: Math.round((emps.filter((e: any) => e.age && e.age >= 30 && e.age < 40).length / emps.length) * 100),
      forties: Math.round((emps.filter((e: any) => e.age && e.age >= 40 && e.age < 50).length / emps.length) * 100),
      over50: Math.round((emps.filter((e: any) => e.age && e.age >= 50).length / emps.length) * 100),
    };
  }

  get activeEmployees() {
    return this.employees().filter(e => e.employmentStatus === 'ACTIVE').length;
  }
  
  get inactiveEmployees() {
    return this.employees().length - this.activeEmployees;
  }

  get uniqueDepartments(): string[] {
    const depts = this.employees().map(e => (e as any).department).filter(d => Boolean(d));
    return Array.from(new Set(depts));
  }

  get departmentMetrics() {
    const emps = this.employees();
    if (emps.length === 0) return [];
    
    const countMap: any = {};
    emps.forEach(e => {
      const dept = (e as any).department || 'Unknown';
      countMap[dept] = (countMap[dept] || 0) + 1;
    });

    const metrics = Object.keys(countMap).map(k => ({
      name: k,
      count: countMap[k],
      percentage: Math.round((countMap[k] / emps.length) * 100)
    }));
    return metrics.sort((a, b) => b.count - a.count);
  }

  get filteredEmployees() {
    return this.employees().filter(e => {
      if (this.departmentFilter() === 'ALL') return true;
      return (e as any).department === this.departmentFilter();
    });
  }

  get paginatedEmployees() {
    const start = (this.employeePage() - 1) * this.employeePageSize;
    return this.filteredEmployees.slice(start, start + this.employeePageSize);
  }

  get employeeTotalPages() {
    return Math.ceil(this.filteredEmployees.length / this.employeePageSize) || 1;
  }

  getEmployeePageNumbers(): number[] {
    const total = this.employeeTotalPages;
    return Array.from({ length: Math.min(total, 5) }, (_, i) => {
      const startPage = Math.max(1, this.employeePage() - 2);
      if (startPage + 4 > total && total > 4) {
        return total - 4 + i;
      }
      return startPage + i;
    }).filter(p => p <= total);
  }

  getMathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  get agePieGradient(): string {
    const m = this.ageMetrics;
    const p1 = m.under30;
    const p2 = p1 + m.thirties + m.forties;
    // Blue for under 30, Blue-dark for 30-49, Gold for 50+
    return `conic-gradient(#2E5C9A 0% ${p1}%, #1B2A4A ${p1}% ${p2}%, #C8A951 ${p2}% 100%)`;
  }

  get deptPieGradient(): string {
    const metrics = this.departmentMetrics;
    if (!metrics.length) return 'conic-gradient(#E2E6EC 0% 100%)';
    
    const colors = ['#2E5C9A', '#C8A951', '#059669', '#1B2A4A', '#8B5CF6', '#F59E0B'];
    let gradientParts: string[] = [];
    let currentPercent = 0;
    
    metrics.forEach((m, i) => {
      const start = currentPercent;
      currentPercent += m.percentage;
      const color = colors[i % colors.length];
      gradientParts.push(`${color} ${start}% ${currentPercent}%`);
    });
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  }

  get deptChartColors(): string[] {
    return ['#2E5C9A', '#C8A951', '#059669', '#1B2A4A', '#8B5CF6', '#F59E0B'];
  }

  onDepartmentFilterChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.departmentFilter.set(selectElement.value);
    this.employeePage.set(1);
  }

  addEmployee() {
    if (this.form.invalid || !this.corporate()) return;
    
    const formData = new FormData();
    formData.append('fullName', this.form.get('fullName')?.value);
    formData.append('email', this.form.get('email')?.value);
    formData.append('phone', this.form.get('phone')?.value);
    formData.append('age', this.form.get('age')?.value);
    formData.append('department', this.form.get('department')?.value);
    formData.append('gender', this.form.get('gender')?.value);
    formData.append('designation', this.form.get('designation')?.value);
    
    const joinDateValue = this.form.get('joinDate')?.value;
    if (joinDateValue instanceof Date) {
      const year = joinDateValue.getFullYear();
      const month = String(joinDateValue.getMonth() + 1).padStart(2, '0');
      const day = String(joinDateValue.getDate()).padStart(2, '0');
      formData.append('joinDate', `${year}-${month}-${day}`);
    } else {
      formData.append('joinDate', joinDateValue);
    }
    
    formData.append('corporateId', this.corporate()!.id.toString());
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.employeeService.addEmployee(formData).subscribe({
      next: (creds) => {
        this.createdCreds.set(creds);
        this.snackBar.open('Employee added successfully!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
        this.selectedFile = null;
        if (this.formDirective) {
          this.formDirective.resetForm();
        } else {
          this.form.reset();
        }
        this.loadEmployees();
      },
      error: () => { this.snackBar.open('Failed to add employee', 'OK', { duration: 3000, panelClass: ['error-snackbar'] }); }
    });
  }

  openBulkUpload() {
    const corp = this.corporate();
    if (!corp) return;
    const dialogRef = this.dialog.open(BulkUploadDialogComponent, {
      data: { corporateId: corp.id },
      width: '660px',
      maxHeight: '85vh',
      panelClass: 'bulk-upload-panel'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  openEditEmployeeModal(employee: Employee) {
    let selectedHealthFile: File | null = null;
    
    Swal.fire({
      title: '',
      width: '640px',
      padding: '0',
      showCloseButton: true,
      html: `
        <div style="text-align:left;">
          <!-- Header -->
          <div style="padding:24px 32px 16px;border-bottom:1px solid #E2E6EC;background:#FAFBFC;">
            <h3 style="font-size:18px;font-weight:800;color:#1B2A4A;margin:0 0 4px;">Edit Employee Details</h3>
            <p style="font-size:12px;color:#5A6A7E;margin:0;">Update information for <strong>${employee.fullName}</strong></p>
          </div>

          <!-- Form Body -->
          <div style="padding:24px 32px;">
            <!-- Full Name -->
            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Full Name</label>
              <input id="swal-fullName" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${employee.fullName || ''}">
            </div>

            <!-- Phone + Age row -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Phone</label>
                <input id="swal-phone" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${employee.phone || ''}">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Age</label>
                <input type="number" id="swal-age" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${(employee as any).age || ''}">
              </div>
            </div>

            <!-- Department + Designation row -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Department</label>
                <input id="swal-department" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${(employee as any).department || ''}">
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Designation</label>
                <input id="swal-designation" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${(employee as any).designation || ''}">
              </div>
            </div>

            <!-- Gender + Join Date row -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Gender</label>
                <select id="swal-gender" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;background:white;box-sizing:border-box;">
                  <option value="Male" ${(employee as any).gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${(employee as any).gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option value="Other" ${(employee as any).gender === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Join Date</label>
                <input type="date" id="swal-joinDate" style="width:100%;padding:10px 14px;border:1px solid #D1D5DB;border-radius:8px;font-size:14px;color:#1B2A4A;outline:none;box-sizing:border-box;" value="${(employee as any).joinDate || ''}">
              </div>
            </div>

            <!-- Health Report Upload -->
            <div style="padding:16px;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:10px;">
              <label style="display:block;font-size:11px;font-weight:700;color:#5A6A7E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">📄 Upload Health Report (PDF / Image)</label>
              <input type="file" id="swal-health-file" accept=".pdf,.jpg,.jpeg,.png" style="font-size:13px;color:#5A6A7E;">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#2E5C9A',
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6B7280',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-100 overflow-hidden',
        confirmButton: 'rounded-lg px-6 py-2.5 text-sm font-bold',
        cancelButton: 'rounded-lg px-6 py-2.5 text-sm font-bold',
        actions: 'px-8 py-5 border-t border-gray-100 bg-gray-50'
      },
      didOpen: () => {
        const fileInput = document.getElementById('swal-health-file') as HTMLInputElement;
        fileInput.addEventListener('change', (e: any) => {
          if (e.target.files.length > 0) {
            selectedHealthFile = e.target.files[0];
          }
        });
      },
      preConfirm: () => {
        const fullName = (document.getElementById('swal-fullName') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
        const age = (document.getElementById('swal-age') as HTMLInputElement).value;
        const department = (document.getElementById('swal-department') as HTMLInputElement).value;
        const designation = (document.getElementById('swal-designation') as HTMLInputElement).value;
        const gender = (document.getElementById('swal-gender') as HTMLSelectElement).value;
        const joinDate = (document.getElementById('swal-joinDate') as HTMLInputElement).value;
        
        if (!fullName) {
          Swal.showValidationMessage('Employee name is required');
          return false;
        }

        const formData = new FormData();
        formData.append('fullName', fullName);
        if (phone) formData.append('phone', phone);
        if (age) formData.append('age', age);
        if (department) formData.append('department', department);
        if (designation) formData.append('designation', designation);
        if (gender) formData.append('gender', gender);
        if (joinDate) formData.append('joinDate', joinDate);
        
        if (selectedHealthFile) {
          formData.append('file', selectedHealthFile);
        }

        return formData;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.employeeService.editEmployee(employee.id, result.value).subscribe({
          next: () => {
            this.snackBar.open('Employee updated successfully', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
            this.loadEmployees();
          },
          error: (err) => {
            console.error('Edit employee error:', err);
            this.snackBar.open('Failed to update employee: ' + (err.error?.message || err.message || 'Unknown error'), 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }
}
