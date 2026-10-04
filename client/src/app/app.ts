import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { CartDrawer } from './shared/cart-drawer';
import { SiteHeader } from './shared/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, CartDrawer],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    void this.auth.bootstrap();
  }
}
