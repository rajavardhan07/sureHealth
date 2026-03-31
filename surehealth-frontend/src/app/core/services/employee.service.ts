import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeCreateDTO } from '../../shared/models';

export interface BulkUploadResponse {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  credentials: { fullName: string; username: string; password: string }[];
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employee';

  constructor(private http: HttpClient) {}

  addEmployee(formData: FormData): Observable<{ username: string; password: string }> {
    return this.http.post<{ username: string; password: string }>(`${this.apiUrl}/add`, formData);
  }

  editEmployee(id: number, formData: FormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/edit/${id}`, formData);
  }

  bulkUploadEmployees(formData: FormData): Observable<BulkUploadResponse> {
    return this.http.post<BulkUploadResponse>(`${this.apiUrl}/bulk-upload`, formData);
  }

  downloadBulkUploadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/bulk-upload/template`, { responseType: 'blob' });
  }
  // what is blob?
  // blob is a binary large object, it is a raw data that can be used to store any type of data 
  // in the above code, we are using blob to store the excel file
  // why we are using blob?
  // because the excel file is a binary file and it is not a text file

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/me`);
  }

  getEmployeesByPolicy(policyId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/policy/${policyId}`);
  }

  downloadHealthReport(employeeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${employeeId}/health-report`, { responseType: 'blob' });
  }
}
