import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CorporateService } from '../../../core/services/corporate.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, CorporateClient, GroupPolicy } from '../../../shared/models';

@Component({
  selector: 'app-hr-employee-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.css'})
export class HrEmployeeManagementComponent implements OnInit {
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  corporate = signal<CorporateClient | null>(null);
  policies = signal<GroupPolicy[]>([]);
  employees = signal<Employee[]>([]);
  loadingEmps = signal(true);
  createdCreds = signal<{ username: string; password: string } | null>(null);
  form: FormGroup;
  columns = ['name', 'department', 'designation', 'status'];

  constructor(
    private corporateService: CorporateService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      department: ['', Validators.required],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      joinDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
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
      next: (data) => { this.employees.set(data); this.loadingEmps.set(false); },
      error: () => { this.loadingEmps.set(false); }
    });
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
        this.snackBar.open('Employee added successfully!', 'OK', { duration: 3000 });
        this.selectedFile = null;
        if (this.formDirective) {
          this.formDirective.resetForm();
        } else {
          this.form.reset();
        }
        this.loadEmployees();
      },
      error: () => { this.snackBar.open('Failed to add employee', 'OK', { duration: 3000 }); }
    });
  }
}
