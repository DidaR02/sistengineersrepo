import { Component, OnInit, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, PipeTransform, ElementRef, ViewChild } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FileElement} from '../../models/file-element/file-element';
import { FileService } from '../../service/fileService/file.service';
import { FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { map, startWith } from 'rxjs/operators';
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

  //uploadProgress: any;
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
    public convertDataType: DataTypeConversionService)
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
      this.updateFileElementQuery(element); 
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
        this.canDownload = this.convertDataType.getBoolean(this.authService.userAccess?.canDownload);
        this.canDelete = this.convertDataType.getBoolean(this.authService.userAccess?.canDelete);
        this.canShare = this.convertDataType.getBoolean(this.authService.userAccess?.canShare);
        this.canAddFile = this.convertDataType.getBoolean(this.authService.userAccess?.canAddFile);
        this.canCreateFolder = this.convertDataType.getBoolean(this.authService.userAccess?.canCreateFolder);

        if(this.userAccess.disableView)
        {
          let dashBoardAccess: string[] = this.userAccess.disableView;
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
    
    this.signedInUser = {
      Uid: this.user.uid?? null,
      User: this.user ?? null,
      UserAccess: this.userAccess?? null
    };

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
    p += `${folderName}/`;
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

    var findCurrentFolder = this.currentPath.split('/');
    var currentFolder = findCurrentFolder[findCurrentFolder.length -1];

    var fileElement = await this.getParentFolder(this.currentPath, currentFolder);

    this.downloadFileElement(element);
  }

  async downloadFileElement(fileElement: FileElement) {

    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(fileElement);

    if(getFilePath){
      this.fileService.downloadFile(getFilePath);
    }

  }

  async deleteElement(element: FileElement) {

    this.currentPath = this.currentPath? this.currentPath: 'root';

    if(this.currentPath?.charAt(this.currentPath.length - 1) === "/")
    {
      this.currentPath = this.currentPath.slice(0,-1);
    }

    var findCurrentFolder = this.currentPath.split('/');
    var currentFolder = findCurrentFolder[findCurrentFolder.length -1];

    var fileElement = await this.getParentFolder(this.currentPath, currentFolder);

    this.removeElement(element);
    await this.updateFileElementQuery(this.currentRoot);
  }

  async removeElement(element: FileElement) {
    await this.fileService.delete(element?.metaData?.fullPath,element);
    this.updateFileElementQuery(this.currentRoot);
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

    this.currentPath = this.currentPath ? this.currentPath: 'root';

    if(this.currentPath?.charAt(this.currentPath.length - 1) === "/")
    {
      this.currentPath = this.currentPath.slice(0,-1);
    }

    var findCurrentFolder = this.currentPath.split('/');
    var currentFolder = findCurrentFolder[findCurrentFolder.length -1];

    let getParentFolder = await this.getParentFolder(this.currentPath, currentFolder);

    if(getParentFolder?.id){
      this.currentRoot = getParentFolder;
    }

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

        this.fileElements.subscribe(
          value => 
          {
            value.forEach(file =>
              {
                if(file.id == docId)
                {
                  file.uploadProgress = uploadPrcnt
                }
              })
          }
        )
      }
    }

     //Todo, set percentage on the Observable
    this.fileElements = await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
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
