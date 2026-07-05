import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badge?: number;
  badgeColor?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  sidebarOpen = signal(true);
  mobileMenuOpen = signal(false);
  expandedMenus = signal<Set<string>>(new Set());
  notificationCount = signal(5);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-gauge-high', route: '/dashboard' },
    {
      label: 'Academics',
      icon: 'fa-solid fa-graduation-cap',
      children: [
        { label: 'Classes', icon: 'fa-solid fa-chalkboard', route: '/classes' },
        { label: 'Subjects', icon: 'fa-solid fa-book-open', route: '/subjects' },
      ]
    },
    {
      label: 'Content',
      icon: 'fa-solid fa-layer-group',
      children: [
        { label: 'Videos', icon: 'fa-solid fa-circle-play', route: '/videos' },
        { label: 'PDFs & Notes', icon: 'fa-solid fa-file-pdf', route: '/pdfs' },
        { label: 'Quizzes', icon: 'fa-solid fa-list-check', route: '/quizzes' },
      ]
    },
    {
      label: 'People',
      icon: 'fa-solid fa-users',
      children: [
        { label: 'Students', icon: 'fa-solid fa-user-graduate', route: '/students' },
        { label: 'Teachers', icon: 'fa-solid fa-person-chalkboard', route: '/teachers' },
      ]
    },
    { label: 'Reports', icon: 'fa-solid fa-chart-line', route: '/reports' },
    { label: 'Notifications', icon: 'fa-solid fa-bell', route: '/notifications', badge: 5, badgeColor: 'danger' },
  ];

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleMenu(label: string): void {
    this.expandedMenus.update(menus => {
      const newMenus = new Set(menus);
      if (newMenus.has(label)) {
        newMenus.delete(label);
      } else {
        newMenus.add(label);
      }
      return newMenus;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  logout(): void {
    this.authService.logout();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth < 992) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }
}
