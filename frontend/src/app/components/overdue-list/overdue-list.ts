import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Loan } from '../../models/models';

@Component({
  selector: 'app-overdue-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overdue-list.html',
})
export class OverdueListComponent implements OnInit {
  overdueLoans = signal<Loan[]>([]);
  loading = signal(false);

  constructor(
    private loanService: LoanService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.loanService.getOverdueLoans().subscribe({
      next: (data) => {
        this.overdueLoans.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  returnLoan(loan: Loan): void {
    this.loading.set(true);
    this.loanService.returnLoan(loan.id).subscribe({
      next: () => {
        this.toastService.success(`"${loan.item.title}" visszavéve`);
        this.ngOnInit();
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt a visszavétel során');
      }
    });
  }
}
