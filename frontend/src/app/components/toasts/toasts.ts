import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2000">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast show align-items-center text-white border-0 mb-2" 
             [class]="'bg-' + toast.type" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi me-2" [ngClass]="{
                'bi-check-circle-fill': toast.type === 'success',
                'bi-exclamation-triangle-fill': toast.type === 'danger',
                'bi-info-circle-fill': toast.type === 'info',
                'bi-exclamation-circle-fill': toast.type === 'warning'
              }"></i>
              {{ toast.message }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    (click)="toastService.remove(toast.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast {
      min-width: 250px;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastsComponent {
  constructor(public toastService: ToastService) {}
}
