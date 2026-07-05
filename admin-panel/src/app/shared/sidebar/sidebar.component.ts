import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badge?: string;
  badgeType?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  expandedMenus: Set<string> = new Set();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
    {
      label: 'Academic', icon: 'bi-mortarboard',
      children: [
        { label: 'Classes', icon: 'bi-building', route: '/classes' },
        { label: 'Subjects', icon: 'bi-book', route: '/subjects' }
      ]
    },
    {
      label: 'Content', icon: 'bi-collection-play',
      children: [
        { label: 'Videos', icon: 'bi-play-circle', route: '/videos' },
        { label: 'Study Materials', icon: 'bi-file-earmark-pdf', route: '/pdfs' },
        { label: 'Quizzes', icon: 'bi-patch-question', route: '/quizzes' }
      ]
    },
    {
      label: 'People', icon: 'bi-people',
      children: [
        { label: 'Students', icon: 'bi-person-badge', route: '/students' },
        { label: 'Teachers', icon: 'bi-person-workspace', route: '/teachers' }
      ]
    },
    { label: 'Announcements', icon: 'bi-megaphone', route: '/announcements', badge: 'New', badgeType: 'success' },
    { label: 'Reports', icon: 'bi-bar-chart-line', route: '/reports' },
    { label: 'Settings', icon: 'bi-gear', route: '/settings' }
  ];

  toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
    } else {
      this.expandedMenus.add(label);
    }
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }
}
