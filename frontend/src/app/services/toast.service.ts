import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  id: number;
  closing?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success'): void {
    const id = this.counter++;
    const toast: Toast = { message, type, id };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: number): void {
    const current = this.toasts();
    const index = current.findIndex(t => t.id === id);
    if (index === -1 || current[index].closing) return;

    this.toasts.update(t => t.map(toast => 
      toast.id === id ? { ...toast, closing: true } : toast
    ));

    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 300);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'danger'); }
  info(message: string): void { this.show(message, 'info'); }
  warn(message: string): void { this.show(message, 'warning'); }
}
