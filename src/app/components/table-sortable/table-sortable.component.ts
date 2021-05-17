import { Component, OnInit, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, PipeTransform, ElementRef, ViewChild } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FileElement} from '../../models/file-element/file-element';
import { FileService } from '../../service/fileService/file.service';
import { FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { first, map, startWith } from 'rxjs/operators';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SignedInUser } from 'src/app/models/userAccess/ISignedInUser';
import { User } from 'src/app/models/userAccess/IUser';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { Router } from '@angular/router';
import { DataTypeConversionService } from 'src/app/service/shared/dataType-conversion.service';
import { downloadFolderAsZip } from '../../service/fileService/zipFile.service';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

export type SortColumn = keyof FileElement | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

function search(text: string,filesToFilter: FileElement[] ,pipe: PipeTransform): FileElement[] {
  return filesToFilter?.filter(file => {
    const term = text.toLowerCase();
    return file.name.toLowerCase().includes(term);
  });
}

@Component({
  selector: 'app-table-sortable',
  templateUrl: './table-sortable.component.html',
  styleUrls: ['./table-sortable.component.css'],
  providers: [DecimalPipe]
})
export class TableSortableComponent implements OnInit {
  checked = false;
  @ViewChild("menuTrigger", {static: false}) selectedElement: ElementRef;
  @ViewChild("fileInput", {static: false}) fileInput: ElementRef;
  @ViewChild("moveToMenu", {static: false}) movedElement: ElementRef;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  //@Input() path: string

  getfileElements: FileElement[]
  fileElements: Observable<FileElement[]>;
  canNavigateUp = false;
  files: File[] = [];
  currentRoot: FileElement
  currentPath: string;

  canDownload :boolean = true;
  canDelete :boolean = true;
  canShare :boolean = true;
  canCreateFolder: boolean = true;
  canAddFile: boolean = true;
  canMove: boolean = true;

  uploadProgress: Observable<number>;

  filter = new FormControl('')
  
  private signedInUser: SignedInUser;
  user: User;
  private userAccess: UserAccess;

  constructor(
    public fileService: FileService,
    public router: Router,
    public authService: AuthenticationService,
    public pipe: DecimalPipe,
    public dialog: MatDialog,
    private convertDataType: DataTypeConversionService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer)
    { 
      this.authService.getLocalUserData();
      this.getUserInfo();
    //let filelements = this.fileElements.subscribe(fileelentz => filelements = fileelentz);
    
    // this.filter.valueChanges.pipe(
    //   startWith(''),
    //   map(text => search(text, 
    //     filelements ,pipe))
    //   )
    //   .subscribe(
    //     (data)=>{
    //       if(data){
    //         // this.fileElements = data;
    //       }
    //     }
    //   );
    
  }

  async ngOnInit(element?: FileElement){
      await this.updateFileElementQuery(element);

      // var filesItem = this.fileElements.subscribe(
      //   (val)=> {
      //     if(val && val.length > 0){
      //       var iconUrl =this.getCustomeIconUrl(val[0].metaData?.contentType);
      //       this.addIconSvg("myCustomIcon", iconUrl)
      //     }
      //   }
      // )
  }

  async getUserInfo()
  {
    if(this.authService.isLoggedIn)
    {
      if(!this.userAccess)
      {
        await this.authService.getLocalUserData();
        await this.createSignInUser();
      }
      if(this.authService.userAccess)
      {
        this.userAccess = this.authService.userAccess;
      }

      if(this.userAccess)
      {
        this.canDownload = this.convertDataType.getBoolean(this.userAccess?.canDownload);
        this.canDelete = this.convertDataType.getBoolean(this.userAccess?.canDelete);
        this.canShare = this.convertDataType.getBoolean(this.userAccess?.canShare);
        this.canAddFile = this.convertDataType.getBoolean(this.userAccess?.canAddFile);
        this.canCreateFolder = this.convertDataType.getBoolean(this.userAccess?.canCreateFolder);

        if(this.userAccess?.disableView)
        {
          let dashBoardAccess: string[] = this.userAccess?.disableView;
          for( var entries in dashBoardAccess) {
            if (entries == "dashboard")
            {
              window.alert("You do not have any access to view" + entries +".");
              this.router.navigate(['sign-in']);
            }
          };
        }
      }

      if(this.authService.userData)
      {
        this.user = {
          uid: this.authService.userData?.uid,
          displayName: this.authService.userData?.displayName,
          email: this.authService.userData?.email,
          emailVerified: this.authService.userData?.emailVerified,
          photoURL: this.authService.userData?.photoURL,
          firstName: this.authService.userData?.firstName,
          lastName: this.authService.userData?.lastName
        };

        this.signedInUser = {
          Uid: this.authService.userData?.uid,
          User: this.user,
          UserAccess: this.userAccess
        };

        localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
        JSON.parse(localStorage.getItem('signedInUser'));
      }
      else
      {
        if(!this.signedInUser || !this.signedInUser.Uid || !this.signedInUser.User || !this.signedInUser.User.uid || !this.signedInUser.UserAccess)
        {
          this.createSignInUser();
        }
      }
    }
  }

  async createSignInUser(){
    
    const _signedInUser = JSON.parse(localStorage.getItem('signedInUser'));
    const _user = JSON.parse(localStorage.getItem('user'));
    this.userAccess = JSON.parse(localStorage.getItem('userAccess'));

    if(_user){
      this.user = {
        uid: _user.uid ??_signedInUser?.uid,
        displayName: _user.displayName ?? _signedInUser?.displayName,
        email: _user?.email ?? _signedInUser?.email,
        emailVerified: _user?.emailVerified ?? _signedInUser?.emailVerified,
        photoURL: _user?.photoURL ?? _signedInUser?.photoURL,
        firstName: _user?.firstName,
        lastName: _user?.lastName
        };
      };
    
      if(this.user){
        this.signedInUser = {
        Uid: this.user.uid?? null,
        User: this.user ?? null,
        UserAccess: this.userAccess?? null
      };
    }

    localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
  }

  onSort({column, direction}: SortEvent) {

  //   // resetting other headers
  //   this.headers.forEach(header => {
  //     if (header.sortable !== column) {
  //       header.direction = '';
  //     }
  //   });

  //   // sorting countries
  //   if (direction === '' || column === '') {
  //     this.fileElements = this.fileElements;
  //   } else {
  //     this.fileElements = [...this.fileElements].sort((a, b) => {
  //       const res = compare(a[column], b[column]);
  //       return direction === 'asc' ? res : -res;
  //     });
  //   }
   }

   getFileTypeIcon(file?: FileElement)
   {
     if(file && file.metaData)
     {
       if(file.metaData?.contentType)
       {
         switch (file.metaData.contentType)
         {
          case "application/msword": 
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          case "application/vnd.ms-word.document.macroenabled.12":
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.template": 
            {
              this.addIconSvg("file-word", "../assets/icons/file-word.svg");
              return "file-word";
            }
          case "application/vnd.ms-excel":
          case "application/vnd.ms-excel.sheet.macroenabled.12": 
          case "application/vnd.ms-excel.template.macroenabled.12":
          case "application/vnd.ms-excel.sheet.binary.macroenabled.12": 
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          case "application/vnd.openxmlformats-officedocument.spreadsheetml.template": 
            {
              this.addIconSvg("file-excel", "../assets/icons/file-excel.svg");
              return "file-excel";
            } 
          case "application/vnd.ms-powerpoint":
          case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          case "application/vnd.openxmlformats-officedocument.presentationml.slide": 
          case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
          case "application/vnd.openxmlformats-officedocument.presentationml.template":
          case "application/vnd.ms-powerpoint.addin.macroenabled.12":
          case "application/vnd.ms-powerpoint.slide.macroenabled.12":
          case "application/vnd.ms-powerpoint.presentation.macroenabled.12":
          case "application/vnd.ms-powerpoint.slideshow.macroenabled.12":
          case "application/vnd.ms-powerpoint.template.macroenabled.12":
            {
              this.addIconSvg("file-powerpoint", "../assets/icons/file-powerpoint.svg");
              return "file-powerpoint";
            }
          case "application/acad":
          case "application/clariscad":
          case "application/dxf":
          case "application/x-dwf":
          case "application/x-dwf":
          case "application/set":
            {
              this.addIconSvg("file-cad", "../assets/icons/file-cad.svg");
              return "file-cad";
            }
          case "application/mp4":
          case "audio/mpeg":
          case "audio/adpcm":
          case "audio/x-aac":
          case "audio/x-aiff":
          case "audio/vnd.dece.audio":
          case "audio/vnd.digital-winds":
          case "audio/vnd.dts":
          case "audio/vnd.rip":
          case "audio/vnd.lucent.voice":
          case "audio/x-mpegurl":
          case "audio/vnd.ms-playready.media.pya":
          case "audio/x-ms-wma":
          case "audio/x-ms-wax":
          case "audio/midi":
          case "audio/mpeg":
          case "audio/mp4":
          case "audio/x-wav":
              {
                this.addIconSvg("file-audio", "../assets/icons/file-audio.svg");
                return "file-audio";
              }
          case "image/vnd.dxf":
          case "image/bmp":
          case "image/prs.btif":
          case "image/vnd.dvb.subtitle":
          case "image/x-cmu-raster":
          case "image/cgm":
          case "image/x-cmx":
          case "image/vnd.dece.graphic":
          case "image/vnd.djvu":
          case "image/vnd.dwg":
          case "image/vnd.fujixerox.edmics-mmr":
          case "image/vnd.fujixerox.edmics-rlc":
          case "image/vnd.xiff":
          case "image/vnd.fst":
          case "image/vnd.fastbidsheet":
          case "image/vnd.fpx":
          case "image/vnd.net-fpx":
          case "image/x-freehand":
          case "image/g3fax":
          case "image/gif":
          case "image/x-icon":
          case "image/ief":
          case "image/x-citrix-jpeg":
          case "image/jpeg":
          case "image/pjpeg":
          case "image/vnd.ms-modi":
          case "image/ktx":
          case "image/x-pcx":
          case "image/x-pict":
          case "image/x-portable-anymap":
          case "image/x-portable-bitmap":
          case "image/x-portable-graymap":
          case "image/x-png":
          case "image/x-portable-pixmap":
          case "image/svg+xml":
          case "image/tiff":
          case "image/webp":
          case "image/x-xbitmap":
          case "image/x-xpixmap":
          case "image/x-xwindowdump":
          case "image/x-png":
          case "image/x-portable-pixmap":
          case "image/svg+xml":
          case "image/tiff":
          case "image/webp":
            {
              this.addIconSvg("file-image", "../assets/icons/file-image.svg");
              return "file-image";
            }
          case "application/x-dvi":
          case "video/mpeg":
          case "video/3gpp":
          case "video/3gpp2":
          case "video/ogg":
          case "video/webm":
          case "video/x-msvideo":
          case "video/vnd.dece.hd":
          case "video/vnd.dece.mobile":
          case "video/vnd.uvvu.mp4":
          case "video/vnd.dece.pd":
          case "video/vnd.dece.sd":
          case "video/vnd.dece.video":
          case "video/vnd.fvt":
          case "video/x-f4v":
          case "video/x-flv":
          case "video/x-fli":
          case "video/h263":
          case "video/h264":
          case "video/jpm":
          case "video/jpeg":
          case "video/x-m4v":
          case "video/x-ms-asf":
          case "video/vnd.ms-playready.media.pyv":
          case "video/x-ms-wm":
          case "video/x-ms-wmx":
          case "video/x-ms-wmv":
          case "video/x-ms-wvx":
          case "video/mj2":
          case "video/vnd.mpegurl":
          case "video/quicktime":
          case "video/x-sgi-movie":
          case "video/vnd.vivo":
              {
                this.addIconSvg("file-video", "../assets/icons/file-video.svg");
                return "file-video";
              }
          case "application/x-7z-compressed":
          case "application/x-zip-compressed":
            {
              this.addIconSvg("file-zip", "../assets/icons/file-zip.svg");
              return "file-zip";
            }
          case "application/pdf": 
            {
              this.addIconSvg("file-pdf", "../assets/icons/file-pdf.svg");
              return "file-pdf";
            }
          case "image/vnd.adobe.photoshop":
          case "application/photoshop":
          case "application/x-photoshop":
            {
                this.addIconSvg("file-adobePhotoshop", "../assets/icons/file-adobePhotoshop.svg");
                return "file-adobePhotoshop";
            }
          case "application/illustrator":
            {
                this.addIconSvg("file-adobeIllustrator", "../assets/icons/file-adobeIllustrator.svg");
                return "file-adobeIllustrator";
            }
          case "application/octet-stream":
            {
              let ext =  this.convertDataType.getFileExtension(file.name);
              if(ext)
              {
                switch (ext)
                {
                  case "rvt": 
                    {
                      this.addIconSvg("file-rvt", "../assets/icons/file-rvt.svg");
                      return "file-rvt";
                    }
                  case "7z":
                  case "7zip":
                  case "zip":
                  case "rar":
                    {
                      this.addIconSvg("file-zip", "../assets/icons/file-zip.svg");
                      return "file-zip";
                    }
                  default:
                    {
                      this.addIconSvg("file-txt-default", "../assets/icons/file-txt-default.svg");
                      return "file-txt-default";
                    }
                }
              }
            }
          default:
            {
              this.addIconSvg("file-txt-default", "../assets/icons/file-txt-default.svg");
              return "file-txt-default";
            }
         }
       }
     }
   }

   addIconSvg(iconName: string, iconSvgPath)
   {
     this.matIconRegistry.addSvgIcon(
      iconName,
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconSvgPath)
     );
   }

  navigate(element: FileElement) {
    if (element?.isFolder) {
      this.navigateToFolder(element);
    }
  }

  async navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    await this.updateFileElementQuery(this.currentRoot);
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
  }

  navigateUp() {
    if(this.canNavigateUp){
      if (this.currentRoot?.isFolder) {
          this.navigateBackUp(this.currentRoot);
        }
    }
  }
  
  async backToRoot()
  {
    if(this.canNavigateUp){
      this.currentPath = 'root';
      await this.updateFileElementQuery();
      this.currentRoot = null;
      this.canNavigateUp = false;
    }
  }

  async navigateBackUp(element: FileElement) {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      await this.updateFileElementQuery();
    } else {
      
      await this.fileService.fireStoreCollections();

      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      if(this.currentRoot === null || this.currentRoot === undefined){
        this.currentRoot = null;
        this.canNavigateUp = false
        //alert("The folder you are navigating to does not exist anymore!\nYou will be redirected back to root Files.");
        await this.updateFileElementQuery();
      }
      await this.updateFileElementQuery(this.currentRoot);
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }
  
  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    if(path != 'root' && path?.charAt(this.currentPath.length - 1) === "/")
    {
      p += `${folderName}/`;
    }
    if(path != 'root' && path?.charAt(this.currentPath.length - 1) != "/")
    {
      p += `/${folderName}/`;
    }
    if(path === 'root')
    {
      p = `Files/${folderName}/`;
    }
    if(!path)
    {
      p = `${folderName}/`;
    }

    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    this.getUserInfo();
    viewChild.openMenu();
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.addFolder({ name: res });
      }
    });
  }
  
  async addFolder(folder: { name: string }) {
    await this.fileService.add(this.currentRoot, { isFolder: true, name: folder.name, size: 0 });
    await this.updateFileElementQuery(this.currentRoot);
  }

  async openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(async res => {
      if (res) {
        element.name = res;
        await this.renameElement(element);
      }
    });
  }

  async renameElement(element: FileElement) {
    await this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  openShareDialog(element: FileElement)
  {
    let dialogRef = this.dialog.open(ShareDialogComponent,
      {
        data: { 
          shareLink: element.downloadURL,
          shareZipFolder: null
        }
      });

  }

  moveElement(self: FileElement, element: FileElement){
    console.log("Self =>", self);
    console.log("elementFile =>", element);
    this.moveFileElement({fileElement: self, moveTo: element});
  }

  async moveFileElement(event: { fileElement: FileElement; moveTo: FileElement }) {
    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(event.fileElement);

    if(getFilePath){
      await this.fileService.moveFile(getFilePath, event.moveTo.metaData?.fullPath);
      await this.fileService.update(event.fileElement.id, { parent: event.moveTo.id });
      
      await this.updateFileElementQuery();
    }
  }

  async downloadElement(element: FileElement) {
    this.currentPath = this.currentPath? this.currentPath: 'root';

    if(this.currentPath?.charAt(this.currentPath.length - 1) === "/")
    {
      this.currentPath = this.currentPath.slice(0,-1);
    }

    if(element.isFolder)
    {  
      var downLoadFolderlist = this.fileService.getDownloadItems(element.id);
      console.log("getDownloadItems response: ", downLoadFolderlist);
      await downloadFolderAsZip(element, this.fileService);
      return;
    }
    else{
      let filePath = await this.fileService.getStorageFilePath(element);
      this.fileService.downloadFile(filePath);
      return;
    }
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }
  async deleteElement(element: FileElement) {

    this.currentPath = this.currentPath ? this.currentPath: 'root';

    if(this.currentPath === 'root')
    {
      this.currentPath = null;
    }

    if(this.currentPath?.charAt(this.currentPath.length - 1) === "/")
    {
      this.currentPath = this.currentPath.slice(0,-1);
    }

    var findCurrentFolder = this.currentPath?.split('/');
    var currentFolder = findCurrentFolder ? findCurrentFolder[findCurrentFolder.length -1] : null;

    var fileElement = await this.getParentFolder(this.currentPath, currentFolder);

    this.removeElement(element);
    await this.updateFileElementQuery(this.currentRoot);
  }

  async removeElement(element: FileElement) {
    await this.fileService.delete(element?.metaData?.fullPath,element);
    await this.updateFileElementQuery(this.currentRoot);
  }

  //Launch the file upload window.
  onFileUploadButtonClick() { 
    let fileInput = this.fileInput.nativeElement;
    fileInput.files = null; 
    fileInput.click();  
  }
  async onDrop(files: FileList) {

    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i));
    }

    this.currentPath = this.currentPath ? this.currentPath: null;

    if(this.currentPath?.charAt(this.currentPath.length - 1) === "/")
    {
      this.currentPath = this.currentPath.slice(0,-1);
    }

    var findCurrentFolder = this.currentPath?.split('/');
    var currentFolder = findCurrentFolder ? findCurrentFolder[findCurrentFolder.length -1] : null;

    this.getParentFolder(this.currentPath, currentFolder).then(
      (parentFolder) => {
        this.currentRoot = parentFolder;
      }
    );

    const newFileList = this.fileService.removeFileDuplicate(this.files);

    const today = new Date();

    //let time = today.getTime();
    // adjust 0 before single digit date
    const date = ("0" + today.getDate()).slice(-2);

    // current month
    const month = ("0" + (today.getMonth() + 1)).slice(-2);

    // current year
    const year = today.getFullYear();

    const fulldate = year + month + date;

    if(newFileList.length > 0){
      for(var file =0 ; file < newFileList.length; file++)
      {
        
        const docId = await this.fileService.createStoreDocumentUpload(this.currentPath, null, newFileList[file], fulldate);
        
        let uploadPrcnt = await this.fileService.uploadFile(this.currentPath, docId, newFileList[file], this.currentRoot);

        //Todo, set percentage on the Observable
        this.fileElements = await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
        this.fileElements.subscribe(
          value => 
          {
            value.forEach(file =>
              {
                if(file.id == docId)
                {
                  
                  this.getFileTypeIcon(file);
                  file.uploadProgress = uploadPrcnt
                }
              })
          }
        )

        uploadPrcnt.toPromise().then
          (
            async ()=>{
              this.updateFileElementQuery(this.currentRoot ?? this.currentRoot);
            }
          );
      }

    }
    this.files = [];
  }
  
  async updateFileElementQuery(element?: FileElement) {
    this.currentRoot = element;
    await this.fileService.fireStoreCollections();

    this.fileElements = await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  private async getParentFolder(parentPath?: string, folderName?: string): Promise<FileElement>{
    return await this.fileService.getParentFolder(parentPath, folderName);
  }
}
