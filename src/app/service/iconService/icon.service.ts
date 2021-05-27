import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { from, Observable, ObservableInput, of } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private supportedIcons: any;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private http: HttpClient
    ) { };

  init() {
    const iconList = '~/../assets/icons/icons.json';
        return new Promise((resolve) => {

            this.http.get(iconList)
              .pipe(
                map((iconList) => {
                  this.supportedIcons = iconList;
                   for (const icon of this.supportedIcons.supportedIcons) {

                    this.matIconRegistry.addSvgIcon(
                      icon,
                      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
                     );

                         this.matIconRegistry.addSvgIconInNamespace(
                           'myCustomIcon',
                           icon,
                           this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
                         );
                    }
                }),
                 catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
                   if (x.status !== 404) {
                     resolve(false);
                   }
                   resolve(true);
                   return of({});
                 })
               ).subscribe();

             resolve(true);
        });
  }
}
