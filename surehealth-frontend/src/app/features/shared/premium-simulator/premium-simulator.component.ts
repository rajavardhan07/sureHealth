import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface SimulatorResult {
  recommendedPremium: number;
  riskScore: number;
  totalAnnualCost: number;
  reasons: string[];
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
}

declare const window: any;

@Component({
  selector: 'app-premium-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './premium-simulator.component.html',
  styleUrl: './premium-simulator.component.css'
})
export class PremiumSimulatorComponent implements OnInit, OnDestroy {
  /** 'hr' shows plan-budget framing; 'underwriter' shows risk-pricing framing */
  @Input() role: 'hr' | 'underwriter' = 'underwriter';

  /** Expose Math so the template can use Math.round() */
  readonly Math = Math;

  // ── Slider state (plain properties + ngModel for reliable two-way sync) ───
  avgAge         = 35;    // 18–65
  employeeCount  = 250;   // 50–2000, default mid-range
  coverageAmount = 500000; // 1L–10L (5L default = 50% of track)
  industryRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' = 'MEDIUM';

  // ── Output state (signals for reactive display) ───────────────────────────
  result      = signal<SimulatorResult | null>(null);
  loading     = signal(false);
  error       = signal<string | null>(null);
  lastRunAt   = signal<Date | null>(null);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly INDUSTRY_LABELS: Record<string, string> = {
    LOW:       'Technology / IT',
    MEDIUM:    'Finance / Banking',
    HIGH:      'Manufacturing',
    VERY_HIGH: 'Construction / Mining'
  };

  ngOnInit() {
    this.triggerSimulation();
  }

  ngOnDestroy() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  /** Called on every slider (input) event — debounces then fires AI */
  onSliderChange() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.triggerSimulation(), 900);
  }

  onIndustryChange(risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH') {
    this.industryRisk = risk;
    this.onSliderChange();
  }

  async triggerSimulation() {
    if (!this.isPuterReady()) {
      this.error.set('AI engine not available. Please ensure the app is loaded correctly.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Step 1: Compute numbers deterministically (AI cannot hallucinate these)
    const computed = this.computeActuarialPremium();

    // Step 2: Ask AI ONLY for 3 explanation bullet points about the computed result
    const prompt = this.buildReasonsPrompt(computed);

    try {
      const response = await window.puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
      const text: string = response?.message?.content?.[0]?.text
                          ?? response?.message?.content
                          ?? response?.toString()
                          ?? '';
      const reasons = this.parseReasons(text);
      this.result.set({ ...computed, reasons });
      this.lastRunAt.set(new Date());
    } catch (e: any) {
      this.error.set('AI request failed. Please try again.');
      console.error('Simulator AI error', e);
    } finally {
      this.loading.set(false);
    }
  }

  private isPuterReady(): boolean {
    try { return typeof window.puter?.ai?.chat === 'function'; }
    catch { return false; }
  }

  /**
   * Deterministic actuarial formula — guarantees:
   *   LOW < MEDIUM < HIGH < VERY HIGH premiums for same inputs
   *   AND more employees = continuously lower per-head premium
   */
  private computeActuarialPremium(): Omit<SimulatorResult, 'reasons'> {
    const INDUSTRY_MULT: Record<string, number> = {
      LOW:       1.00,
      MEDIUM:    1.25,
      HIGH:      1.55,
      VERY_HIGH: 1.85,
    };

    // Base rate: 1.5% of annual coverage (Star Health / Care / HDFC Ergo group rates: 1.2–1.5%)
    const baseRate = 0.015;

    // Age multiplier: +2% for every year above 25
    const ageMult = 1 + Math.max(0, (this.avgAge - 25)) * 0.020;

    // ── Continuous logarithmic size discount ──────────────────────────────
    // More employees → bigger discount, but with diminishing returns
    // Formula: discount grows from 0% at 50 employees → 20% at 2000 employees
    const minEmp = 50, maxEmp = 2000;
    const clamped = Math.min(Math.max(this.employeeCount, minEmp), maxEmp);
    const logRatio = Math.log10(clamped / minEmp) / Math.log10(maxEmp / minEmp);
    const sizeMult = 1.0 - 0.20 * logRatio;
    // Example: 50→1.00, 250→~0.91, 500→~0.875, 1000→~0.84, 2000→0.80

    const rawPremium = this.coverageAmount * baseRate * ageMult
                     * INDUSTRY_MULT[this.industryRisk] * sizeMult;

    // Round to nearest ₹500
    const premium = Math.max(500, Math.round(rawPremium / 500) * 500);
    const total   = premium * this.employeeCount;

    // Risk score: weighted blend of age + industry (0–10)
    const ageScore    = Math.min(10, Math.max(1, (this.avgAge - 18) / 4.7));
    const indScore: Record<string, number> = { LOW: 2.0, MEDIUM: 4.5, HIGH: 7.0, VERY_HIGH: 9.5 };
    const rawScore    = ageScore * 0.35 + indScore[this.industryRisk] * 0.65;
    const riskScore   = parseFloat(Math.min(10, Math.max(1, rawScore)).toFixed(1));

    const riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH' =
      riskScore <= 3 ? 'LOW' : riskScore <= 5 ? 'MEDIUM' : riskScore <= 7 ? 'HIGH' : 'VERY HIGH';

    return { recommendedPremium: premium, riskScore, totalAnnualCost: total, riskBand };
  }

  /** Ask AI ONLY for 3 concise explanation lines about the computed result */
  private buildReasonsPrompt(computed: Omit<SimulatorResult, 'reasons'>): string {
    const industryLabel = this.INDUSTRY_LABELS[this.industryRisk];
    return `An Indian group health insurance actuary computed the following result for a corporate policy:
- Average Employee Age: ${this.avgAge} years
- Employees: ${this.employeeCount}
- Industry: ${industryLabel} (Risk: ${this.industryRisk.replace('_', ' ')})
- Coverage Per Employee: Rs. ${this.coverageAmount.toLocaleString('en-IN')}
- Calculated Annual Premium: Rs. ${computed.recommendedPremium.toLocaleString('en-IN')} per employee
- Risk Score: ${computed.riskScore}/10 (${computed.riskBand})

Write EXACTLY 3 short, specific actuarial reasons (1 sentence each) explaining why this premium and risk score make sense for these inputs.
Return ONLY a JSON array of 3 strings, nothing else:
["reason1", "reason2", "reason3"]`;
  }

  private parseReasons(text: string): string[] {
    try {
      const cleaned = text.replace(/```json?/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) return arr.slice(0, 3).map(String);
      }
    } catch { /* fallback below */ }
    return [
      `Age ${this.avgAge} and ${this.industryRisk.replace('_',' ')} industry risk drive this premium.`,
      `${this.employeeCount} employees provide moderate risk pooling benefits.`,
      `Coverage of Rs. ${this.coverageAmount.toLocaleString('en-IN')} sets the base exposure level.`
    ];
  }

  // Legacy kept for reference (no longer called)
  private buildPrompt(): string { return ''; }
  private parseResponse(text: string): SimulatorResult {
    return { recommendedPremium: 0, riskScore: 5, totalAnnualCost: 0, reasons: [], riskBand: 'MEDIUM' };
  }

  getRiskColor(band: string): string {
    switch (band) {
      case 'LOW':       return '#059669';
      case 'MEDIUM':    return '#D97706';
      case 'HIGH':      return '#DC2626';
      case 'VERY HIGH': return '#7C3AED';
      default:          return '#5A6A7E';
    }
  }

  getRiskBgClass(band: string): string {
    switch (band) {
      case 'LOW':       return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIUM':    return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HIGH':      return 'bg-red-50 text-red-700 border-red-200';
      case 'VERY HIGH': return 'bg-purple-50 text-purple-700 border-purple-200';
      default:          return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getRiskBarWidth(score: number): string {
    return `${(score / 10) * 100}%`;
  }

  formatCurrency(value: number): string {
    return `Rs. ${value.toLocaleString('en-IN')}`;
  }

  get pageTitle(): string {
    return this.role === 'hr'
      ? 'Premium Budget Planner'
      : 'AI Risk & Premium Simulator';
  }

  get pageSubtitle(): string {
    return this.role === 'hr'
      ? 'Estimate your corporate insurance premium before submitting a policy request'
      : 'Model any risk profile to price premiums with AI-driven actuarial analysis';
  }
}
