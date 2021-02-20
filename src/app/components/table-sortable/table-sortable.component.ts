import { Component, OnInit, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, PipeTransform, ElementRef, ViewChild } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FileElement} from '../../models/file-element/file-element';
import { FileService } from '../../service/file.service';
import { FormControl } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { map, startWith } from 'rxjs/operators';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

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

  //uploadProgress: any;
  uploadProgress: Observable<number>;

  filter = new FormControl('')
  
  constructor(public fileService: FileService, public pipe: DecimalPipe,public dialog: MatDialog) { 

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
