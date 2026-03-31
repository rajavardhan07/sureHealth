import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupPolicy, InsurancePlan } from '../../../shared/models';
import { EmployeeService } from '../../../core/services/employee.service';
import { AiRiskAnalyzerService, AiAnalysisResult } from '../../../core/services/ai-risk-analyzer.service';

@Component({
  selector: 'app-ai-risk-analyzer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './ai-risk-analyzer.component.html',
})
export class AiRiskAnalyzerComponent implements OnInit {
  @Input({ required: true }) policy!: GroupPolicy;
  @Input() allPlans: InsurancePlan[] = [];

  /** Emits the numeric premium value when user clicks "Apply & Send Quote" */
  @Output() applyPremium = new EventEmitter<number>();
  /** Emits when the modal should be closed */
  @Output() closed = new EventEmitter<void>();

  analyzing = signal(false);
  result = signal<AiAnalysisResult | null>(null);
  parseFloat = parseFloat;

  constructor(
    private aiService: AiRiskAnalyzerService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.runAnalysis();
  }

  runAnalysis() {
    if (!this.aiService.isPuterLoaded()) {
      this.snackBar.open('Puter.js is not loaded. Please connect to the internet.', 'OK', { duration: 4000 });
      this.closed.emit();
      return;
    }

    this.analyzing.set(true);
    this.result.set(null);

    this.employeeService.getEmployeesByPolicy(this.policy.id).subscribe({
      next: async (emps) => {
        try {
          const prompt = this.aiService.buildPrompt(this.policy, emps, this.allPlans);
          const text = await this.aiService.analyze(prompt);
          this.result.set(this.aiService.parseResponse(text));
        } catch (err) {
          console.error('AI Analysis error:', err);
          this.snackBar.open('AI analysis failed. Please try again.', 'OK', { duration: 4000 });
          this.closed.emit();
        } finally {
          this.analyzing.set(false);
        }
      },
      error: () => {
        this.snackBar.open('Failed to load employee data for analysis.', 'OK', { duration: 3000 });
        this.analyzing.set(false);
        this.closed.emit();
      }
    });
  }

  applyAndSendQuote() {
    const res = this.result();
    if (!res) return;
    const numMatch = res.recommendedPremium.match(/[\d,]+/);
    if (numMatch) {
      const premium = parseFloat(numMatch[0].replace(/,/g, ''));
      this.applyPremium.emit(premium);
    }
  }

  close() {
    this.closed.emit();
  }

  getDecisionColor(decision: string): string {
    const d = decision.toLowerCase();
    if (d === 'approve') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (d === 'reject') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  }

  getDecisionIcon(decision: string): string {
    const d = decision.toLowerCase();
    if (d === 'approve') return 'check_circle';
    if (d === 'reject') return 'cancel';
    return 'warning';
  }

  getRiskColor(score: string): string {
    const num = parseFloat(score);
    if (num <= 4) return 'text-emerald-600';
    if (num <= 6) return 'text-amber-600';
    return 'text-red-600';
  }

  getRiskBg(score: string): string {
    const num = parseFloat(score);
    if (num <= 4) return 'from-emerald-500 to-emerald-600';
    if (num <= 6) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  }
}
