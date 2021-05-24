import { Inject } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent implements OnInit {

  @Input() shareLink: string;
  @Input() shareZipFolder?: JSZip;

  folderName: string;

  displayItem : any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {shareLink?: string, shareZipFolder?: JSZip}) {
    this.shareLink = this.data.shareLink;
    this.shareZipFolder = this.data.shareZipFolder;
    this.setDisplay();
   }

  ngOnInit(): void {
    this.setDisplay();
  }

  private setDisplay()
  {
    if(this.shareLink)
    {
      this.displayShare();
    }
    else if(this.shareZipFolder)
    {
      this.displayJsZipFolder();
    }
    else{
      this.displayItem = "There is no item to share";
    }
  }

  private displayShare()
  {
    this.displayItem = this.shareLink;
  }
  private displayJsZipFolder()
  {
    this.displayItem = this.shareZipFolder;
  }

}
