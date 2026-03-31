import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService, BulkUploadResponse } from '../../../core/services/employee.service';

@Component({
  selector: 'app-bulk-upload-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatSnackBarModule],
  templateUrl: './bulk-upload-dialog.component.html',
  styleUrl: './bulk-upload-dialog.component.css'
})
export class BulkUploadDialogComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadResult: BulkUploadResponse | null = null;
  dragOver = false;

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BulkUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { corporateId: number }
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    if (!file.name.endsWith('.xlsx')) {
      this.snackBar.open('Only .xlsx files are accepted', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
    this.selectedFile = file;
    this.uploadResult = null;
  }

  downloadTemplate() {
    this.employeeService.downloadBulkUploadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_bulk_upload_template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Failed to download template', 'OK', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('corporateId', this.data.corporateId.toString());

    this.employeeService.bulkUploadEmployees(formData).subscribe({
      next: (result) => {
        this.uploading = false;
        this.uploadResult = result;
        if (result.successCount > 0) {
          this.snackBar.open(`${result.successCount} employee(s) added successfully!`, 'OK', { duration: 4000, panelClass: ['success-snackbar'] });
        }
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open('Upload failed: ' + (err.error?.message || 'Unknown error'), 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadResult = null;
  }

  close() {
    this.dialogRef.close(this.uploadResult?.successCount ? true : false);
  }
}
