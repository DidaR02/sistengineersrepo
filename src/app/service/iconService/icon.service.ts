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
//   private matIconRegistry: MatIconRegistry;
//   private domSanitizer: DomSanitizer;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private http: HttpClient
    ) { };

  init() {
    const iconList = '~/../assets/icons/icons.json';
        return new Promise((resolve) => {

          //return new Promise<boolean>((resolve: (a: boolean) => void): void => {
            this.http.get(iconList)
              .pipe(
                map((iconList) => {
                  this.supportedIcons = iconList;
                  console.log("InnerIcons", this.supportedIcons.supportedIcons);

                  console.log("InnerIconsX", iconList["supportedIcons"]);
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

                  // resolve(true);
                }),
                 catchError((x: { status: number }, caught: Observable<void>): ObservableInput<{}> => {
                   if (x.status !== 404) {
                     resolve(false);
                   }
                   
                   resolve(true);
                   return of({});
                 })
               ).subscribe();

            //   resolve(true);
          //}
          //);

            // (icons) =>
            // {
            //     (innerIcons)=>{
            //         console.log("InnerIcons", innerIcons);
            //         // for (const icon of icons) {
            //         //     this.matIconRegistry.addSvgIconInNamespace(
            //         //       'my-namespace',
            //         //       icon,
            //         //       this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
            //         //     );
            //         //   }
        
            //     }
                
            //     console.log("Icons", icons);
            //     // for (const icon of icons) {
            //     //     this.matIconRegistry.addSvgIconInNamespace(
            //     //       'my-namespace',
            //     //       icon,
            //     //       this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
            //     //     );
            //     //   }

            // }
        
             resolve(true);
        });
  }
}