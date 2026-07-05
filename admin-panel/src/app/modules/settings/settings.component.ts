import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  activeTab = signal('general');

  general = { schoolName:'DRS Education', tagline:'Empowering learners, shaping futures', address:'123 Education Road, Ahmedabad, Gujarat - 380001', phone:'+91 79 2345 6789', email:'admin@drseducation.in', website:'www.drseducation.in', academicYear:'2024-25', timezone:'Asia/Kolkata', language:'English' };

  notifications = { emailOnEnrollment:true, emailOnNewContent:true, emailOnQuizResult:false, pushNotifications:true, announcementAlerts:true, weeklyReport:true, maintenanceAlerts:true };

  storage = { maxVideoSizeMB:500, maxPdfSizeMB:50, allowedVideoFormats:'mp4,mov,avi,mkv', allowedPdfFormat:'pdf', autoProcessVideos:true, generateThumbnails:true, compressionEnabled:true };

  security = { sessionTimeout:60, maxLoginAttempts:5, requireStrongPassword:true, twoFactorAuth:false, auditLogs:true };

  saving = false;
  savedTab = '';

  tabs = [
    { id:'general', label:'General', icon:'bi-gear' },
    { id:'notifications', label:'Notifications', icon:'bi-bell' },
    { id:'storage', label:'Storage & Media', icon:'bi-hdd' },
    { id:'security', label:'Security', icon:'bi-shield-check' },
    { id:'branding', label:'Branding', icon:'bi-palette' },
  ];

  saveSettings(): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.savedTab = this.activeTab();
      setTimeout(() => this.savedTab = '', 3000);
    }, 800);
  }
}
