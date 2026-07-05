import { Injectable, signal } from '@angular/core';

export interface Toast {
  id:      string;
  type:    'success' | 'error' | 'warning' | 'info';
  title:   string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  success(title: string, message = '') { this.show('success', title, message); }
  error(title: string, message = '')   { this.show('error',   title, message); }
  warning(title: string, message = '') { this.show('warning', title, message); }
  info(title: string, message = '')    { this.show('info',    title, message); }

  private show(type: Toast['type'], title: string, message: string): void {
    const id = Date.now().toString();
    this.toasts.update(list => [...list, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
