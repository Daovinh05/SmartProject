import { Component } from '@angular/core';

/** Footer dùng chung. */
@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <p>© Smart Solutions Việt Nam — Cổng thông tin nội bộ SmartProject.</p>
    </footer>
  `,
  styleUrl: './footer.component.css',
})
export class FooterComponent {}
