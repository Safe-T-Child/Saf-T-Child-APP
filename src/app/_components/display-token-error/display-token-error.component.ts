import { Component, Inject, Input } from '@angular/core';

Inject({ providedIn: 'root' });

@Component({
  selector: 'app-display-token-error',
  templateUrl: './display-token-error.component.html',
  styleUrl: './display-token-error.component.scss',
})
export class DisplayTokenErrorComponent {
  @Input() alertMessage: string = '';
  @Input() errorAction: string = '';
  @Input() routeTo: string = '';
  @Input() buttonLabel : string = '';
}
