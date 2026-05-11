import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/models';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './item-form.html',
})
export class ItemFormComponent implements OnInit {
  itemId = signal<number | null>(null);
  title = signal('');
  author = signal('');
  type = signal('book');
  acquisitionDate = signal('');
  error = signal('');
  loading = signal(false);
  isEdit = signal(false);

  constructor(
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId.set(+id);
      this.isEdit.set(true);
      this.itemService.getItem(this.itemId()!).subscribe({
        next: (i) => {
          this.title.set(i.title);
          this.author.set(i.author);
          this.type.set(i.type);
          this.acquisitionDate.set(i.acquisitionDate?.split('T')[0] || '');
        },
        error: () => {
          this.error.set('Tétel nem található');
        },
      });
    } else {
      this.acquisitionDate.set(new Date().toISOString().split('T')[0]);
    }
  }

  onSubmit(): void {
    if (!this.title() || !this.author() || !this.type() || !this.acquisitionDate()) {
      this.error.set('Minden mező kitöltése kötelező!');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const data = {
      title: this.title(),
      author: this.author(),
      type: this.type() as Item['type'],
      acquisitionDate: this.acquisitionDate(),
    };

    const obs = this.isEdit()
      ? this.itemService.updateItem(this.itemId()!, data)
      : this.itemService.createItem(data);

    obs.subscribe({
      next: (i) => this.router.navigate(['/items', i.id]),
      error: (err) => {
        this.error.set(err.error?.message || 'Hiba történt');
        this.loading.set(false);
      },
    });
  }
}
