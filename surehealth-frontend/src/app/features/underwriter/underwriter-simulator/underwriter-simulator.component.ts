import { Component } from '@angular/core';
import { PremiumSimulatorComponent } from '../../shared/premium-simulator/premium-simulator.component';

@Component({
  selector: 'app-underwriter-simulator',
  standalone: true,
  imports: [PremiumSimulatorComponent],
  template: `<app-premium-simulator role="underwriter"></app-premium-simulator>`
})
export class UnderwriterSimulatorComponent {}
