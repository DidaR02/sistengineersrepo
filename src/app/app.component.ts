import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FileElement } from './models/file-element/file-element';
import { FileService } from './service/fileService/file.service';
import { AuthenticationService } from 'src/app/service/authentication/authentication.service';
import { User } from './models/userAccess/IUser';
import { Event as RouterEvent, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Sist Engineers';
  fileElements: Observable<FileElement[]>;
  public showOverlay = false;

  constructor(
    public fileService: FileService,
    public authService: AuthenticationService,
    public router: Router
  ) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    })
  }

  public currentRoot?: FileElement;
  currentPath: string;
  canNavigateUp = false;
  files: File[] = [];

  user: User;

  ngOnInit() {
  }
 // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.showOverlay = true;
    }
    if (event instanceof NavigationEnd) {
      this.showOverlay = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.showOverlay = false;
    }
    if (event instanceof NavigationError) {
      this.showOverlay = false;
    }
  }

  async addFolder(folder: { name: string }) {

    let newFolder = new FileElement;
    newFolder.name = folder.name;
    newFolder.size = 0;
    newFolder.isFolder = true;

    await this.fileService.add(newFolder, this.currentRoot);
    await this.updateFileElementQuery(this.currentRoot);
  }

  async addFile(event: { element: FileElement;currentPath: string; files: File[] }) {

    this.currentRoot = event.element ;
    await this.updateFileElementQuery(this.currentRoot);
  }

  async removeElement(element: FileElement) {
    await this.fileService.delete(element?.metaData?.fullPath,element);
    this.updateFileElementQuery(this.currentRoot);
  }

  async navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    await this.updateFileElementQuery(this.currentRoot);
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
  }

  async navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = new FileElement;
      this.canNavigateUp = false;
      await this.updateFileElementQuery();
    } else {

      await this.fileService.fireStoreCollections();

      this.currentRoot = this.fileService.get(this.currentRoot?.parent ?? '');
      if(this.currentRoot === null || this.currentRoot === undefined){
        this.currentRoot = new FileElement;
        this.canNavigateUp = false
        await this.updateFileElementQuery();
      }
      await this.updateFileElementQuery(this.currentRoot);
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }

  async moveElement(event: { fileElement: FileElement; moveTo: FileElement }) {
    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(event.fileElement);

    if(getFilePath){
      // await this.fileService.moveFile(getFilePath, event.moveTo.metaData?.fullPath);
      //await this.fileService.update(event.fileElement.id, { parent: event.moveTo.id });

      await this.updateFileElementQuery();
    }

  }

  async downloadElement(fileElement: FileElement) {

    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(fileElement);

    if(getFilePath){
      this.fileService.downloadFile(getFilePath);
    }

  }

  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  async updateFileElementQuery(element?: FileElement) {
      this.currentRoot = element;
      await this.fileService.fireStoreCollections();

      this.fileElements = await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  //TODO: REMOVE THIS METHOD
  async updateFileElementQueryAsync(element?: FileElement) {

    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = new FileElement;
      this.canNavigateUp = false;
      await this.updateFileElementQuery();
    }
    else if(this.currentRoot && this.currentRoot.parent != 'root'){
      this.canNavigateUp = true;
      await this.updateFileElementQuery(this.currentRoot);
    }

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

}
