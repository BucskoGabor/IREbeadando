import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './item-list.html',
})
export class ItemListComponent implements OnInit {
  items = signal<Item[]>([]);
  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  loading = signal(false);
  private searchTimeout: any;

  typeLabels: Record<string, string> = {
    book: 'Könyv', cd: 'CD', cassette: 'Kazetta', sheet_music: 'Kotta',
  };

  statusLabels: Record<string, string> = {
    available: 'Szabad', borrowed: 'Kikölcsönzött', scrapped: 'Selejtezett',
  };

  constructor(
    private itemService: ItemService,
    private loanService: LoanService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void { this.loadItems(); }

  loadItems(): void {
    this.loading.set(true);
    this.itemService
      .getItems(
        this.searchTerm || undefined,
        this.typeFilter || undefined,
        this.statusFilter || undefined
      )
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadItems();
    }, 300);
  }

  deleteItem(item: Item): void {
    this.loading.set(true);
    this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.loadItems();
        this.toastService.success('Tétel selejtezve');
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt');
      }
    });
  }

  returnItem(item: Item): void {
    this.loading.set(true);
    this.loanService.getLoanByItem(item.id).subscribe({
      next: (loan) => {
        this.loanService.returnLoan(loan.id).subscribe({
          next: () => {
            this.loadItems();
            this.toastService.success(`"${item.title}" sikeresen visszavéve`);
          },
          error: (err) => {
            this.loading.set(false);
            this.toastService.error(err.error?.message || 'Hiba történt a visszavétel során');
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Nem található aktív kölcsönzés ehhez a tételhez');
      }
    });
  }

  restoreItem(item: Item): void {
    this.loading.set(true);
    this.itemService.updateItem(item.id, { status: 'available' }).subscribe({
      next: () => {
        this.loadItems();
        this.toastService.success(`"${item.title}" sikeresen visszaállítva`);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt a visszaállítás során');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'bg-success';
      case 'borrowed': return 'bg-warning text-dark';
      case 'scrapped': return 'bg-danger';
      default: return 'bg-secondary';
    }
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
