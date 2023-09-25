import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { environment } from '../environment';
import { Banner } from '../model';
@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements AfterViewInit {
  @Input() banner!: Banner;
  showAd = environment.adsense.show;
  constructor() {}

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        ((window as any)['adsbygoogle'] =
          (window as any)['adsbygoogle'] || []).push({
          overlays: { bottom: true },
        });
      } catch (e) {
        console.error(e);
      }
    }, 0);
  }
}
