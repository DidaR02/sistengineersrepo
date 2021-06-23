import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FileElement } from '../../models/file-element/file-element';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from '../rename-dialog/rename-dialog.component';

import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { UploadComponent } from '../../service/fileService/upload';
import { FileService } from '../../service/fileService/file.service';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {

  constructor( public fileService: FileService, public dialog: MatDialog, public uploadComponent: UploadComponent) {}
  isHovering: boolean;
  public files: File[] = [];

  fileControl: FormControl;
  color: ThemePalette = 'primary';
  disabled: boolean = false;
  multiple: boolean = false;
  accept: string;

  @Input() fileElements: FileElement[]
  @Input() canNavigateUp: string
  @Input() path: string
  @Input() currentRoot: FileElement

  @Output() folderAdded = new EventEmitter<{ name: string }>()
  @Output() public addFiles = new EventEmitter<{
    element: FileElement
    currentPath: string
    files: File[]
  }>()
  @Output() elementRemoved = new EventEmitter<FileElement>()
  @Output() elementRenamed = new EventEmitter<FileElement>()
  @Output() elementOpened = new EventEmitter<FileElement>()
  @Output() elementMoved = new EventEmitter<{
    fileElement: FileElement
    moveTo: FileElement
  }>()
  @Output() navigatedDown = new EventEmitter<FileElement>()
  @Output() navigatedUp = new EventEmitter<FileElement>()
  @Output() refreshFolder = new EventEmitter<FileElement>()

  breakpoint: number;

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 400) ? 2 : 6;
  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 2 : 6;
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.elementRenamed.emit(element);
      }
    });
  }

  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element?.isFolder) {
      this.navigatedDown.emit(element);
    }
  }

  navigateUp() {
    console.log("Child calling parent canNavigateUp:=> ", this.canNavigateUp);
    console.log("currentRoot", this.currentRoot);
    if(this.canNavigateUp){
      if (this.currentRoot?.isFolder) {
          this.navigatedUp.emit(this.currentRoot);
        }
    }
  }

  @ViewChild("fileInput", {static: false}) fileInput: ElementRef;

  onFileUploadButtonClick() {
    let fileInput = this.fileInput.nativeElement;
    fileInput.files = null;
    fileInput.click();
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  @ViewChild("menuTrigger", {static: false}) selectedElement: ElementRef;
  async onDrop(files: FileList) {

    for (let i = 0; i < files.length; i++) {
      this.files.push(files.item(i) as File);
    }

    var currentPath = this.path? this.path: 'root';

    if(currentPath?.charAt(currentPath.length - 1) === "/")
    {
      currentPath = currentPath.slice(0,-1);
    }

    var findCurrentFolder = currentPath.split('/');
    var currentFolder = findCurrentFolder[findCurrentFolder.length -1];

    var fileElement = await this.getParentFolder(currentPath, currentFolder);

    this.addFiles.emit({ element: fileElement,currentPath: currentPath,files: this.files });
    this.files = [];
    this.refreshFolder.emit(fileElement);

  }

  private async upload(parentPath?: string, fileToUpload?: File[]) {

    //await this.fileService.uploadFile(parentPath,fileToUpload);
    this.files = [];
  }

  private async getParentFolder(parentPath: string, folderName: string): Promise<FileElement>{
    return await this.fileService.getParentFolder(parentPath, folderName);
  }
}
