import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { from } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class IconService {
  private config: any;
//   private matIconRegistry: MatIconRegistry;
//   private domSanitizer: DomSanitizer;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
    ) { };

  init() {
    const iconList = '~/../assets/icons/icons.json';
        return new Promise((resolve) => {
            (icons: any) =>
            {
                (innerIcons: any)=>{
                    console.log("InnerIcons", innerIcons);
                    // for (const icon of icons) {
                    //     this.matIconRegistry.addSvgIconInNamespace(
                    //       'my-namespace',
                    //       icon,
                    //       this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
                    //     );
                    //   }
        
                }
                
                console.log("Icons", icons);
                // for (const icon of icons) {
                //     this.matIconRegistry.addSvgIconInNamespace(
                //       'my-namespace',
                //       icon,
                //       this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`)
                //     );
                //   }

                  resolve(true);
            }
        
        });
  }
}