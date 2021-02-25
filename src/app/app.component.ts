import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FileElement } from './models/file-element/file-element';
import { FileService } from './service/fileService/file.service';
import { AuthenticationService } from 'src/app/Service/authentication/authentication.service';
import { UserAccess } from 'src/app/models/userAccess/IUserAccess';
import { User } from './models/userAccess/IUser';
import { SignedInUser } from './models/userAccess/ISignedInUser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Sist Engineers';
  fileElements: Observable<FileElement[]>;

  constructor(public fileService: FileService, public authService: AuthenticationService) {
  }

  public currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;
  files: File[] = [];

  signedInUser: SignedInUser;
  private user: User;
  private userAccess: UserAccess;

  ngOnInit(element?: FileElement) {
    this.getUserInfo();
  }

  getUserInfo()
  {
    if(this.authService.isLoggedIn)
    {
      this.authService.getLocalUserData();

      this.userAccess = this.authService.userAccess;

      if(this.userAccess && this.userAccess.disableView)
      {
        //if user cant view dashboard, redirect user to no access page.
        let dashBoardAccess: string[] = this.userAccess.disableView;
        for( var entries in dashBoardAccess) {
          if (entries == "dashboard")
          {
            console.log("You do not have any access to view",entries);
          }
        };
      }

      this.user = {
      uid: this.authService.userData?.uid,
      displayName: this.authService.userData?.displayName,
      email: this.authService.userData?.email,
      emailVerified: this.authService.userData?.emailVerified,
      photoURL: this.authService.userData?.photoURL
      };

      this.signedInUser = {
        Uid: this.authService.userData?.uid,
        User: this.user,
        UserAccess: this.userAccess
      };

      localStorage.setItem('signedInUser', JSON.stringify(this.signedInUser));
      JSON.parse(localStorage.getItem('signedInUser'));
    }
  }
  
  async addFolder(folder: { name: string }) {
    await this.fileService.add(this.currentRoot, { isFolder: true, name: folder.name, size: 0 });
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

  async navigateUp(element: FileElement) {
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
        await this.updateFileElementQuery();
      }
      await this.updateFileElementQuery(this.currentRoot);
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }

  async moveElement(event: { fileElement: FileElement; moveTo: FileElement }) {
    debugger;

    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(event.fileElement);

    if(getFilePath){
      await this.fileService.moveFile(getFilePath, event.moveTo.metaData?.fullPath);
      await this.fileService.update(event.fileElement.id, { parent: event.moveTo.id });
      
      await this.updateFileElementQuery();
    }
    
  }

  async downloadElement(fileElement: FileElement) {
    debugger;

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
      this.currentRoot = null;
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
