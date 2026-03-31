import { Injectable } from '@angular/core';
import { GroupPolicy, InsurancePlan, Employee } from '../../shared/models';

declare const window: any;

export interface AiAnalysisResult {
  riskScore:          string;
  recommendedPremium: string;
  summary:            string;
  decision:           string;
  reasons:            string[];
  raw:                string;
}

@Injectable({ providedIn: 'root' })
export class AiRiskAnalyzerService {

  isPuterLoaded(): boolean { return !!window.puter; }

  // ── Same actuarial formula as the Premium Simulator ─────────────────────
  computeActuarialPremium(
    coverageAmount: number,
    avgAge:         number,
    employeeCount:  number,
    industry:       string
  ): number {
    const INDUSTRY_MULT: Record<string, number> = {
      LOW:       1.00,
      MEDIUM:    1.25,
      HIGH:      1.55,
      VERY_HIGH: 1.85,
    };

    const riskBand = this.industryToRiskBand(industry);
    const baseRate = 0.015;                                          // 1.5% of coverage
    const ageMult  = 1 + Math.max(0, (avgAge - 25)) * 0.020;        // +2% per year above 25
    const clamped  = Math.min(Math.max(employeeCount, 50), 2000);
    const logRatio = Math.log10(clamped / 50) / Math.log10(2000 / 50);
    const sizeMult = 1.0 - 0.20 * logRatio;                         // 0% → 20% group discount

    const raw = coverageAmount * baseRate * ageMult * INDUSTRY_MULT[riskBand] * sizeMult;
    return Math.max(500, Math.round(raw / 500) * 500);
  }

  private industryToRiskBand(industry: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    const low  = ['it', 'technology', 'software', 'tech', 'fintech'];
    const high = ['manufacturing', 'construction', 'mining', 'logistics', 'transport',
                  'chemical', 'pharmaceutical', 'agriculture'];
    const vhigh = ['oil', 'gas', 'petroleum', 'defence', 'defense', 'aviation'];
    const s = (industry || '').toLowerCase();
    if (vhigh.some(k => s.includes(k)))  return 'VERY_HIGH';
    if (high.some(k  => s.includes(k)))  return 'HIGH';
    if (low.some(k   => s.includes(k)))  return 'LOW';
    return 'MEDIUM'; // banking, finance, healthcare, retail, general, etc.
  }

  buildPrompt(
    policy:    GroupPolicy,
    employees: Employee[],
    allPlans:  InsurancePlan[]
  ): string {
    const avgAge = employees.length > 0
      ? Math.round(employees.reduce((s, e) => s + (e.age || 30), 0) / employees.length)
      : 30;

    const companyName    = policy.corporateClient?.companyName || 'Unknown';
    const employeeCount  = employees.length;
    const industry       = policy.corporateClient?.industryType || 'General';
    const coverageAmount = policy.insurancePlan?.coverageAmount || 500000;

    // ── Compute premium deterministically (same formula as Premium Simulator) ──
    const computedPremium = this.computeActuarialPremium(
      coverageAmount, avgAge, employeeCount, industry
    );
    const riskBand = this.industryToRiskBand(industry);

    const plansTable = allPlans
      .map(p => `${p.id}\t${p.active ? 'TRUE' : 'FALSE'}\t${p.coverageAmount}\t${p.planName}\t${p.premiumPerEmployee}`)
      .join('\n');

    return `You are a senior insurance underwriting analyst in India.

Company Details:
- Company: ${companyName}
- Employees: ${employeeCount}
- Average Age: ${avgAge} years
- Industry: ${industry} (Risk Band: ${riskBand})
- Requested Plan: ${policy.insurancePlan?.planName || 'N/A'}
- Coverage Per Employee: ₹${coverageAmount.toLocaleString('en-IN')}
- Waiting Period: ${policy.insurancePlan?.waitingPeriodDays || 0} days

Actuarial Premium Computed (using industry-standard 1.5% base rate × age × industry × group-size):
  ₹${computedPremium.toLocaleString('en-IN')} per employee/year

Available Plans:
ID\tACTIVE\tCOVERAGE\tPLAN_NAME\tBASE_PREMIUM
${plansTable}

Instructions:
1. Risk Score: Give a score 2–8 (2=Low, 8=High) based on age, industry, and group size.
2. Recommended Premium: Use the actuarially computed value of ₹${computedPremium.toLocaleString('en-IN')}. You may adjust ±10% based on specific risk factors but MUST stay within that range.
3. Summary: 2–3 sentences about risk profile.
4. Decision: Choose one — Approve / Reject / Approve with Higher Premium
5. Reasons: 2–3 short bullet points.

Output Format (exact):
Risk Score: <X>/10

Recommended Premium: ₹<amount> per employee/year

Summary:
<2-3 lines>

Decision: <Approve / Reject / Approve with Higher Premium>

Reason:
- <reason 1>
- <reason 2>
- <reason 3 optional>`;
  }

  async analyze(prompt: string): Promise<string> {
    const response = await window.puter.ai.chat(prompt);
    return response?.message?.content || '';
  }

  parseResponse(text: string): AiAnalysisResult {
    const riskMatch     = text.match(/Risk\s*Score:\s*([\d.]+\s*\/\s*10)/i);
    const premiumMatch  = text.match(/Recommended\s*Premium:\s*(₹[\d,.]+ per employee\/year)/i);
    const summaryMatch  = text.match(/Summary:\s*\n([\s\S]*?)(?=\nDecision:|$)/i);
    const decisionMatch = text.match(/Decision:\s*(Approve|Reject|Approve with Higher Premium)/i);
    const reasonsMatch  = text.match(/Reason[s]?:\s*\n([\s\S]*?)$/i);

    let reasons: string[] = [];
    if (reasonsMatch) {
      reasons = reasonsMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s*-\s*/, '').trim())
        .filter(l => l.length > 0);
    }

    return {
      riskScore:          riskMatch     ? riskMatch[1].trim()     : 'N/A',
      recommendedPremium: premiumMatch  ? premiumMatch[1].trim()  : 'N/A',
      summary:            summaryMatch  ? summaryMatch[1].trim()  : 'N/A',
      decision:           decisionMatch ? decisionMatch[1].trim() : 'N/A',
      reasons,
      raw: text,
    };
  }
}
