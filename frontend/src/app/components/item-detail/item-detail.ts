import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-detail.html',
})
export class ItemDetailComponent implements OnInit {
  item = signal<Item | null>(null);
  loading = signal(true);

  typeLabels: Record<string, string> = {
    book: 'Könyv', cd: 'CD', cassette: 'Kazetta', sheet_music: 'Kotta',
  };
  statusLabels: Record<string, string> = {
    available: 'Szabad', borrowed: 'Kikölcsönzött', scrapped: 'Selejtezett',
  };

  constructor(
    private itemService: ItemService,
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
    this.itemService.getItem(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.item.set(null);
      },
    });
  }

  returnItem(): void {
    const currentItem = this.item();
    if (currentItem?.currentLoan) {
      this.loading.set(true);
      this.loanService.returnLoan(currentItem.currentLoan.id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.success('Tétel sikeresen visszavéve');
        },
        error: (err) => {
          this.loading.set(false);
          this.toastService.error(err.error?.message || 'Hiba történt');
        }
      });
    }
  }

  scrapItem(): void {
    const currentItem = this.item();
    if (currentItem) {
      this.loading.set(true);
      this.itemService.deleteItem(currentItem.id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.success('Tétel selejtezve');
        },
        error: (err) => {
          this.loading.set(false);
          this.toastService.error(err.error?.message || 'Hiba történt');
        }
      });
    }
  }
}
