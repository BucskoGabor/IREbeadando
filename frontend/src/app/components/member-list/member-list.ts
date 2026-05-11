import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { ToastService } from '../../services/toast.service';
import { Member } from '../../models/models';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberListComponent implements OnInit {
  members = signal<Member[]>([]);
  searchTerm = '';
  private searchTimeout: any;
  showInactive = false;
  loading = signal(false);

  constructor(
    private memberService: MemberService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.memberService
      .getMembers(this.searchTerm || undefined, this.showInactive)
      .subscribe({
        next: (data) => {
          this.members.set(data);
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
      this.loadMembers();
    }, 300);
  }

  deleteMember(member: Member): void {
    console.log('deleteMember called for:', member.id);
    this.loading.set(true);
    this.memberService.deleteMember(member.id).subscribe({
      next: () => {
        console.log('DELETE success');
        this.toastService.success('Tag sikeresen inaktiválva');
        // Small delay to ensure DB persistence is visible in the next fetch
        setTimeout(() => this.loadMembers(), 100);
      },
      error: (err) => {
        console.error('DELETE error:', err);
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt a törlés során');
      }
    });
  }
  activateMember(member: Member): void {
    this.loading.set(true);
    this.memberService.updateMember(member.id, { active: true }).subscribe({
      next: () => {
        this.toastService.success('Tag sikeresen újraaktiválva');
        setTimeout(() => this.loadMembers(), 100);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt az aktiválás során');
      }
    });
  }
}
