import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  bookOutline,
  playCircleOutline,
  helpCircleOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonRouterOutlet, IonContent, IonIcon],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss'
})
export class TabsPage {

  private router = inject(Router);

  active = 'home';

  constructor() {
    addIcons({ homeOutline, bookOutline, playCircleOutline, helpCircleOutline, personOutline });
  }

  go(tab: string) {
    this.active = tab;
    this.router.navigate(['/tabs', tab]);
  }
}