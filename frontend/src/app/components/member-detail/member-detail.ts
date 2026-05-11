import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Member, Loan } from '../../models/models';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-detail.html',
})
export class MemberDetailComponent implements OnInit {
  member = signal<Member | null>(null);
  loans = signal<Loan[]>([]);
  loading = signal(false);

  typeLabels: Record<string, string> = {
    book: 'Könyv', cd: 'CD', cassette: 'Kazetta', sheet_music: 'Kotta',
  };

  constructor(
    private memberService: MemberService,
    private loanService: LoanService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.memberService.getMember(id).subscribe({
      next: (m) => {
        this.member.set(m);

        this.loadLoans(id);
      },
      error: () => {
        this.loading.set(false);
        this.member.set(null);
      },
    });
  }

  loadLoans(memberId: number): void {
    this.loanService.getMemberLoans(memberId).subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  returnLoan(loan: Loan): void {
    this.loanService.returnLoan(loan.id).subscribe({
      next: () => {
        this.loadData();
        this.toastService.success(`"${loan.item.title}" sikeresen visszavéve`);
      },
      error: (err) => this.toastService.error(err.error?.message || 'Hiba történt'),
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'book': return 'bg-primary';
      case 'cd': return 'bg-info';
      case 'cassette': return 'bg-purple';
      case 'sheet_music': return 'bg-teal';
      default: return 'bg-secondary';
    }
  }
}
