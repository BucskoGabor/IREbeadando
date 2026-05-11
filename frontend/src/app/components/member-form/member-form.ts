import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-form.html',
})
export class MemberFormComponent implements OnInit {
  memberId = signal<number | null>(null);
  name = signal('');
  phone = signal('');
  idCardNumber = signal('');
  address = signal('');
  loading = signal(false);
  isEdit = signal(false);

  constructor(
    private memberService: MemberService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.memberId.set(+id);
      this.isEdit.set(true);
      this.memberService.getMember(this.memberId()!).subscribe({
        next: (m) => {
          this.name.set(m.name);
          this.phone.set(m.phone);
          this.idCardNumber.set(m.idCardNumber);
          this.address.set(m.address);
        },
        error: () => {
          this.toastService.error('Tag nem található');
          this.router.navigate(['/members']);
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.name() || !this.phone() || !this.idCardNumber() || !this.address()) {
      this.toastService.warn('Minden mező kitöltése kötelező!');
      return;
    }
    this.loading.set(true);
    const data = {
      name: this.name(),
      phone: this.phone(),
      idCardNumber: this.idCardNumber(),
      address: this.address(),
    };

    const obs = this.isEdit()
      ? this.memberService.updateMember(this.memberId()!, data)
      : this.memberService.createMember(data);

    obs.subscribe({
      next: (m) => {
        this.toastService.success(this.isEdit() ? 'Változtatások mentve' : 'Tag sikeresen létrehozva');
        this.router.navigate(['/members', m.id]);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Hiba történt');
        this.loading.set(false);
      },
    });
  }
}
