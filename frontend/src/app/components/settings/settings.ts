import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../services/setting.service';
import { ToastService } from '../../services/toast.service';
import { Setting } from '../../models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
})
export class SettingsComponent implements OnInit {
  settings = signal<Setting[]>([]);
  loading = signal(false);

  settingLabels: Record<string, string> = {
    max_loans_per_member: 'Maximális kölcsönzések száma (tagonként)',
    overdue_days: 'Késésnek számító napok száma',
  };

  constructor(
    private settingService: SettingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Hiba a beállítások betöltésekor');
      },
    });
  }

  saveSetting(setting: Setting): void {
    this.loading.set(true);
    this.settingService.updateSetting(setting.key, setting.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success(`"${this.settingLabels[setting.key] || setting.key}" mentve!`);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Hiba történt');
      },
    });
  }
}
