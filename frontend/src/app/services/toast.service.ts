import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success'): void {
    const id = this.counter++;
    const toast: Toast = { message, type, id };
    this.toasts.update(t => [...t, toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'danger'); }
  info(message: string): void { this.show(message, 'info'); }
  warn(message: string): void { this.show(message, 'warning'); }
}
