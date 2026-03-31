import { Component } from '@angular/core';
import { PremiumSimulatorComponent } from '../../shared/premium-simulator/premium-simulator.component';

@Component({
  selector: 'app-hr-simulator',
  standalone: true,
  imports: [PremiumSimulatorComponent],
  template: `<app-premium-simulator role="hr"></app-premium-simulator>`
})
export class HrSimulatorComponent {}
