import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FileClaimComponent } from './file-claim.component';
import { ClaimService } from '../../../core/services/claim.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FileClaimComponent', () => {
  let component: FileClaimComponent;
  let fixture: ComponentFixture<FileClaimComponent>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;

  const mockProfile = { id: 1, fullName: 'Jane Doe', groupPolicy: { id: 5 } };

  beforeEach(async () => {
    mockClaimService = jasmine.createSpyObj('ClaimService', ['fileClaim']);
    mockEmployeeService = jasmine.createSpyObj('EmployeeService', ['getMyProfile']);

    mockEmployeeService.getMyProfile.and.returnValue(of(mockProfile as any));
    mockClaimService.fileClaim.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [
        FileClaimComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ClaimService, useValue: mockClaimService },
        { provide: EmployeeService, useValue: mockEmployeeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileClaimComponent);
    component = fixture.componentInstance;
    // Spy on the component's own snackBar instance
    spyOn((component as any).snackBar, 'open').and.callThrough();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('onFileSelected() should reject files larger than 5 MB', () => {
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.pdf');
    const event = { target: { files: [bigFile] } };
    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
    expect((component as any).snackBar.open).toHaveBeenCalledWith(
      'File size exceeds 5MB limit', 'OK', { duration: 3000 }
    );
  });

  it('onFileSelected() should accept files within 5 MB', () => {
    const validFile = new File(['valid content'], 'report.pdf');
    const event = { target: { files: [validFile] } };
    component.onFileSelected(event);
    expect(component.selectedFile).toEqual(validFile);
  });

  it('submit() should show snackbar when no file is attached', () => {
    component.selectedFile = null;
    component.form.setValue({
      hospitalName: 'City Hospital',
      diagnosis: 'Flu',
      billAmount: 500,
      billNumber: 'B001',
      treatmentDate: '2024-01-01'
    });
    component.submit();
    expect((component as any).snackBar.open).toHaveBeenCalledWith(
      'Please attach a medical report', 'OK', { duration: 3000 }
    );
  });

  it('submit() should call fileClaim() when form is valid and file is selected', () => {
    const file = new File(['data'], 'report.pdf');
    component.selectedFile = file;
    component.profile.set(mockProfile as any);
    component.form.setValue({
      hospitalName: 'City Hospital',
      diagnosis: 'Flu',
      billAmount: 500,
      billNumber: 'B001',
      treatmentDate: '2024-01-01'
    });
    component.submit();
    expect(mockClaimService.fileClaim).toHaveBeenCalled();
  });
});
