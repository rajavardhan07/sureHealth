import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InsurancePlan } from '../../../shared/models';

declare const window: any;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-hr-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './hr-chatbot.component.html',
  styleUrl: './hr-chatbot.component.css'
})
export class HrChatbotComponent implements OnInit {
  
  // Phase 1: Context Gathering, Phase 2: Chatting
  phase = signal<'context' | 'chat'>('context');
  
  // Context Form Data
  contextData = {
    employeeCount: 0,
    avgAge: 32,
    totalClaims: 500000,
    avgClaim: 25000,
    commonClaims: 'Fever, Maternity, Accidents',
    budget: 'Medium'
  };

  availablePlans: InsurancePlan[] = [];

  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isThinking = signal(false);

  constructor(
    public dialogRef: MatDialogRef<HrChatbotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employeeCount: number, plans: InsurancePlan[] }
  ) {
    this.contextData.employeeCount = data.employeeCount || 0;
    this.availablePlans = data.plans || [];
  }

  ngOnInit() {
    this.startConsultation();
  }

  editContext() {
    this.phase.set('context');
  }

  startConsultation() {
    this.phase.set('chat');
    
    // Construct the specialized conversational prompt
    const plansContext = this.availablePlans.map((p, i) => 
      `${i + 1}. ${p.planName} - ₹${p.coverageAmount.toLocaleString('en-IN')} coverage limit, ₹${p.premiumPerEmployee.toLocaleString('en-IN')}/yr premium per employee. Waiting Period: ${p.waitingPeriodDays} days. Features: ${p.description}`
    ).join('\n');

    const systemPrompt = `You are the SureHealth AI Advisor, an expert corporate health insurance consultant for HR Managers.

Your goal is to recommend the best group health insurance plan from the 'Available Plans' list below.

**CRITICAL RULES:**
1. If the user just says hello or greets you, simply greet them back and ask how you can help. DO NOT ask any of the required questions below yet.
2. Be EXTREMELY CONCISE and quick. No long paragraphs. Maximum 1-2 sentences.
3. When the user indicates they want an insurance recommendation, explicitly PROBE for missing details.
4. Ask exactly ONE question at a time. Do not overwhelm the user.
5. Gather the necessary data points before making a formal recommendation.

**Required questions to ask ONLY when needed (ask exactly ONE per turn, skip any already known):**
1) What industry is your company in? (e.g., IT, Manufacturing, Healthcare, Retail, etc.)
2) What’s your budget preference per employee per year? (Low / Medium / High)
3) What is the average age of employees?
4) How important is zero or low waiting period (0–30 days) for your plan? (Critical / Flexible)

**When you have enough info, present your recommendation in this exact structure:**

**Recommended Plan:** <Plan Name>

**Coverage:** <amount>

**Expected Annual Cost:** ₹<Number of Employees × Premium Per Employee>/year

**Why This Plan:**
- <reason 1 tied to their answers>
- <reason 2>
- <reason 3>

**Alternative Option:** <second-best plan name and one-line reason>

---
Available Plans:
${plansContext || 'No specific plans provided. Advise generally.'}

Company Context (already known — do NOT ask these again):
- Number of Employees: ${this.contextData.employeeCount}
`;

    this.messages.set([
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: "Hello! Welcome to SureHealth. 👋\n\nI'm your dedicated insurance advisor, here to help find the perfect group health plan for your team of **" + this.contextData.employeeCount + " employees**.\n\nHow can I assist you today?" }
    ]);
  }

  async callPuterAI() {
    if (!window.puter) {
      this.messages.update(m => [...m, { role: 'assistant', content: 'Hold on! Puter.js is not loaded. Please ensure you are connected to the internet.'}]);
      return;
    }

    this.isThinking.set(true);
    
    try {
      // call Puter.js chat
      const response = await window.puter.ai.chat(this.messages());
      const aiMessageContent = response?.message?.content || 'I am sorry, I could not process that request.';
      
      this.messages.update(m => [...m, { role: 'assistant', content: aiMessageContent }]);
    } catch (error) {
      console.error(error);
      this.messages.update(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      this.isThinking.set(false);
      this.scrollToBottom();
    }
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isThinking()) return;

    // Add user message to UI immediately
    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.userInput.set('');
    this.scrollToBottom();

    await this.callPuterAI();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-scroll-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  formatMarkdown(text: string): string {
    if (!text) return '';
    
    // 1. Convert actual newlines to <br>
    let html = text.replace(/\n/g, '<br>');
    
    // 2. Convert Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1B2A4A]">$1</strong>');
    
    // 3. Convert Bullet Points
    // Matches `<br>- text` and converts to nicely padded bullet points
    html = html.replace(/<br>\s*-\s*(.*?)(?=<br>|$)/g, '<br><span class="inline-block w-full pl-3 relative before:content-[\'•\'] before:absolute before:left-0 before:text-blue-500">$1</span>');
    
    // 4. Convert headers (e.g. ### Header)
    html = html.replace(/(?:^|<br>)#+\s*(.*?)(?=<br>|$)/g, '<br><span class="block mt-2 mb-1 text-lg font-bold text-[#1B2A4A]">$1</span>');

    return html;
  }
}
