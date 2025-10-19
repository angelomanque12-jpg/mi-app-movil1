import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  showBottomNav = true;
  constructor(private router: Router) {
    // Show bottom nav only on /home
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects || e.url;
      this.showBottomNav = url === '/home' || url.startsWith('/home/');
    });
  }
  navigateHome() {
    this.router.navigateByUrl('/home');
  }
  navigateLugares() {
    this.router.navigateByUrl('/lugares');
  }
}
