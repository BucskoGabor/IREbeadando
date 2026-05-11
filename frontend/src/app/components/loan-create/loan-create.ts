import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { ItemService } from '../../services/item.service';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Member, Item, Loan } from '../../models/models';

@Component({
  selector: 'app-loan-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './loan-create.html',
})
export class LoanCreateComponent implements OnInit {
  memberSearch = '';
  itemSearch = '';
  members = signal<Member[]>([]);
  items = signal<Item[]>([]);
  selectedMember = signal<Member | null>(null);
  memberLoans = signal<Loan[]>([]);
  loading = signal(false);
  memberLoading = signal(false);
  itemLoading = signal(false);

  typeLabels: Record<string, string> = { book: 'Könyv', cd: 'CD', cassette: 'Kazetta', sheet_music: 'Kotta' };

  constructor(
    private memberService: MemberService,
    private itemService: ItemService,
    private loanService: LoanService,
    private toastService: ToastService
  ) {}

  private memberSearchTimeout: any;
  private itemSearchTimeout: any;

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.memberLoading.set(true);
    this.itemLoading.set(true);
    
    this.memberService.getMembers().subscribe({
      next: (data) => {
        this.members.set(data);
        this.memberLoading.set(false);
      },
      error: () => this.memberLoading.set(false)
    });

    this.itemService.getItems(undefined, undefined, "available").subscribe({
      next: (data) => {
        this.items.set(data);
        this.itemLoading.set(false);
      },
      error: () => this.itemLoading.set(false)
    });
  }

  onMemberSearch(): void {
    if (this.memberSearchTimeout) clearTimeout(this.memberSearchTimeout);
    this.memberSearchTimeout = setTimeout(() => {
      this.searchMembers();
    }, 300);
  }

  searchMembers(): void {
    this.memberLoading.set(true);
    this.memberService.getMembers(this.memberSearch || undefined).subscribe({
      next: (data) => {
        this.members.set(data);
        this.memberLoading.set(false);
      },
      error: () => {
        this.memberLoading.set(false);
      },
    });
  }

  selectMember(member: Member): void {
    this.selectedMember.set(member);
    this.members.set([]);
    this.memberSearch = '';
    this.loadMemberLoans();
  }

  loadMemberLoans(): void {
    const member = this.selectedMember();
    if (!member) return;
    this.loanService.getMemberLoans(member.id).subscribe({
      next: (loans) => {
        this.memberLoans.set(loans.filter(l => !l.returnDate));
      },
    });
  }

  onItemSearch(): void {
    if (this.itemSearchTimeout) clearTimeout(this.itemSearchTimeout);
    this.itemSearchTimeout = setTimeout(() => {
      this.searchItems();
    }, 300);
  }

  searchItems(): void {
    this.itemLoading.set(true);
    this.itemService
      .getItems(this.itemSearch || undefined, undefined, "available")
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.itemLoading.set(false);
        },
        error: () => {
          this.itemLoading.set(false);
        },
      });
  }

  borrowItem(item: Item): void {
    const member = this.selectedMember();
    if (!member) return;
    this.loanService.createLoan(member.id, item.id).subscribe({
      next: () => {
        this.toastService.success(`"${item.title}" sikeresen kikölcsönözve!`);
        this.items.set(this.items().filter(i => i.id !== item.id));
        this.loadMemberLoans();
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Hiba történt');
        this.loading.set(false);
      },
    });
  }

  returnLoan(loan: Loan): void {
    this.loanService.returnLoan(loan.id).subscribe({
      next: () => {
        this.toastService.success(`"${loan.item.title}" visszavéve`);
        this.loadMemberLoans();

        if (this.itemSearch) {
          this.searchItems();
        } else {
          this.loadInitialData();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Hiba történt a visszavétel során');
      }
    });
  }
}
