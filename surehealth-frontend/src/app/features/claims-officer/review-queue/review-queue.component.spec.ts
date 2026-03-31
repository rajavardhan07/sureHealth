import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReviewQueueComponent } from './review-queue.component';
import { ClaimService } from '../../../core/services/claim.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('ReviewQueueComponent', () => {
  let component: ReviewQueueComponent;
  let fixture: ComponentFixture<ReviewQueueComponent>;
  let mockClaimService: jasmine.SpyObj<ClaimService>;
  let snackBar: MatSnackBar;

  const mockQueue = [
    {
      id: 1,
      status: 'SUBMITTED',
      claimNumber: 'CLM001',
      billAmount: 5000,
      hospitalName: 'Apollo',
      diagnosis: 'Flu',
      treatmentDate: '2024-01-01',
      employee: { fullName: 'John Doe' }
    },
    {
      id: 2,
      status: 'UNDER_REVIEW',
      claimNumber: 'CLM002',
      billAmount: 8000,
      hospitalName: 'Fortis',
      diagnosis: 'Fracture',
      treatmentDate: '2024-02-01',
      employee: { fullName: 'Jane Smith' }
    }
  ];

  beforeEach(async () => {
    mockClaimService = jasmine.createSpyObj('ClaimService', [
      'getReviewQueue', 'startReview', 'approveClaim', 'rejectClaim'
    ]);

    mockClaimService.getReviewQueue.and.returnValue(of(mockQueue as any));
    mockClaimService.startReview.and.returnValue(of(void 0));
    mockClaimService.approveClaim.and.returnValue(of(void 0));
    mockClaimService.rejectClaim.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [
        ReviewQueueComponent,
        MatIconModule,
        MatSnackBarModule,
        FormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ClaimService, useValue: mockClaimService }
      ]
    }).compileComponents();

    snackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(ReviewQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getReviewQueue() on init', () => {
    expect(mockClaimService.getReviewQueue).toHaveBeenCalled();
  });

  it('claims signal should hold the returned queue', () => {
    expect(component.claims().length).toBe(2);
  });

  it('approve() should NOT call approveClaim when approved amount is missing', () => {
    const claim = component.claims()[0] as any;
    component.approve(claim);
    expect(mockClaimService.approveClaim).not.toHaveBeenCalled();
  });

  it('approve() should call approveClaim when amount is set', () => {
    const claim = component.claims()[0] as any;
    component.approvedAmounts[claim.id] = 5000;
    component.approve(claim);
    expect(mockClaimService.approveClaim).toHaveBeenCalledWith(1, { approvedAmount: 5000 });
  });

  it('reject() should NOT call rejectClaim when reason is missing', () => {
    const claim = component.claims()[0] as any;
    component.reject(claim);
    expect(mockClaimService.rejectClaim).not.toHaveBeenCalled();
  });

  it('reject() should call rejectClaim when reason is provided', () => {
    const claim = component.claims()[0] as any;
    component.rejectionReasons[claim.id] = 'Insufficient docs';
    component.reject(claim);
    expect(mockClaimService.rejectClaim).toHaveBeenCalledWith(1, { rejectionReason: 'Insufficient docs' });
  });
});
