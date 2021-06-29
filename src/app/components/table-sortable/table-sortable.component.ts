import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Observable } from "rxjs";
import { FileElement } from "../../models/file-element/file-element";
import { FileService } from "../../service/fileService/file.service";
import { FormControl } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { NewFolderDialogComponent } from "../new-folder-dialog/new-folder-dialog.component";
import { RenameDialogComponent } from "../rename-dialog/rename-dialog.component";
import { MatMenuTrigger } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { SignedInUser } from "src/app/models/userAccess/ISignedInUser";
import { User } from "src/app/models/userAccess/IUser";
import { UserAccess } from "src/app/models/userAccess/IUserAccess";
import { AuthenticationService } from "src/app/service/authentication/authentication.service";
import { Router } from "@angular/router";
import { DataTypeConversionService } from "src/app/service/shared/dataType-conversion.service";
import { downloadFolderAsZip } from "../../service/fileService/zipFile.service";
import { ShareDialogComponent } from "../share-dialog/share-dialog.component";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FileManagerService } from "src/app/service/shared/files-manager.service";
import { UserManagerService } from "src/app/service/authentication/userManager.service";
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: "app-table-sortable",
  templateUrl: "./table-sortable.component.html",
  styleUrls: ["./table-sortable.component.css"],
  providers: [DecimalPipe,MatMenuModule],
})
export class TableSortableComponent implements OnInit {
  checked = false;
  @ViewChild("menuTrigger", { static: false }) selectedElement: ElementRef;
  @ViewChild("fileInput", { static: false }) fileInput: ElementRef;
  @ViewChild("moveToMenu", { static: false }) movedElement: ElementRef;

  getfileElements: FileElement[];
  fileElements: Observable<FileElement[]>;
  canNavigateUp = false;
  files: File[] = [];
  currentRoot: FileElement;
  currentPath: string;
  canDownload: boolean = true;
  canDelete: boolean = true;
  canShare: boolean = true;
  canCreateFolder: boolean = true;
  canAddFile: boolean = true;
  canMove: boolean = true;
  user: User;
  uploadProgress: Observable<number>;

  private signedInUser: SignedInUser;
  private userAccess: UserAccess;

  filter = new FormControl("");

  displayedColumns: string[] = ['name'];
  dataSource!: MatTableDataSource<FileElement>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public fileService: FileService,
    public router: Router,
    public authService: AuthenticationService,
    public pipe: DecimalPipe,
    public dialog: MatDialog,
    private convertDataType: DataTypeConversionService,
    private fileManager: FileManagerService,
    public userManagerService: UserManagerService
  ) {
    this.authService.getLocalUserData();
    this.getUserInfo();
  }

  async ngOnInit(element?: FileElement) {
    await this.updateFileElementQuery(element);
    localStorage.removeItem('currentFolderId');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async getUserInfo() {
    if (this.authService.isLoggedIn) {
      if (!this.userAccess) {
        await this.authService.getLocalUserData();
        await this.userManagerService.createSignInUser();
      }
      if (this.authService.userAccess) {
        this.userAccess = this.authService.userAccess;
      }

      if (this.userAccess) {
        this.canDownload = this.convertDataType.getBoolean(
          this.userAccess?.canDownload
        );
        this.canDelete = this.convertDataType.getBoolean(
          this.userAccess?.canDelete
        );
        this.canShare = this.convertDataType.getBoolean(
          this.userAccess?.canShare
        );
        this.canAddFile = this.convertDataType.getBoolean(
          this.userAccess?.canAddFile
        );
        this.canCreateFolder = this.convertDataType.getBoolean(
          this.userAccess?.canCreateFolder
        );

        if (this.userAccess?.disableView) {
          let dashBoardAccess: string[] = this.userAccess?.disableView;
          for (var entries in dashBoardAccess) {
            if (entries == "dashboard") {
              window.alert(
                "You do not have any access to view" + entries + "."
              );
              this.router.navigate(["sign-in"]);
            }
          }
        }
      }

      if (this.userManagerService.user) {
        this.user = {
          uid: this.userManagerService.user?.uid,
          displayName: this.userManagerService.user?.displayName,
          email: this.userManagerService.user?.email,
          emailVerified: this.userManagerService.user?.emailVerified,
          photoURL: this.userManagerService.user?.photoURL,
          firstName: this.userManagerService.user?.firstName,
          lastName: this.userManagerService.user?.lastName,
        };

        this.signedInUser = {
          Uid: this.userManagerService.user?.uid,
          User: this.user,
          UserAccess: this.userAccess,
        };

        localStorage.setItem("signedInUser", JSON.stringify(this.signedInUser));
      } else {
        if (
          !this.signedInUser ||
          !this.signedInUser.Uid ||
          !this.signedInUser.User ||
          !this.signedInUser.User.uid ||
          !this.signedInUser.UserAccess
        ) {
          this.userManagerService.createSignInUser();
        }
      }
    }
  }

  navigate(element: FileElement) {
    if (element?.isFolder) {
      this.navigateToFolder(element);
    }
  }

  async navigateToFolder(element: FileElement) {

    let getCurrentFolder = localStorage.getItem('currentFolderId');

    if (getCurrentFolder != element.id)
    {
      await this.updateFileElementQuery(element);
      this.canNavigateUp = true;

      this.currentRoot = element as FileElement;
      this.currentPath = this.pushToPath(this.currentPath, element.name);

      localStorage.setItem('currentFolderId', element.id);
    }
    else {
      await this.updateFileElementQuery(element);
      localStorage.setItem('currentFolderId', element.id);
    }
  }

  async navigateUp() {
    if (this.canNavigateUp) {
      if (this.currentRoot?.isFolder) {
        if (this.currentRoot.parent === "root") {
           await this.backToRoot();
        }
        else {

        //refresh if there was new files
        await this.fileService.fireStoreCollections();
        this.currentRoot = this.fileService.get(this.currentRoot?.parent ?? 'root');

        if (this.currentRoot === null || this.currentRoot === undefined) {
          this.currentRoot = new FileElement;
          this.canNavigateUp = false;

          await this.updateFileElementQuery(this.currentRoot).then(
            (refreshComplt) => {
              console.log("Refresh completed inside :", refreshComplt);
            }
          );
          this.currentPath = this.popFromPath(this.currentPath);
          }

          await this.updateFileElementQuery(this.currentRoot).then(
            (refreshComplt) => {
              console.log("Refresh completed outside:", refreshComplt);
            }
          );

          this.currentPath = this.popFromPath(this.currentPath);

        }
      }
    localStorage.setItem('currentFolderId', this.currentRoot.id);
    }
  }

  async backToRoot() {
    this.currentPath = "root";
       await this.updateFileElementQuery().then(
         async (backToRoot) => {
           console.log("Back to root", backToRoot)
          this.canNavigateUp = false;
          localStorage.setItem('currentFolderId', 'root');
          });
  }

  async navigateBackUp(element: FileElement) {
    if (element && element.parent === "root") {
      this.canNavigateUp = false;
      this.backToRoot();
    }
    else {
      //refresh if there was new files
      await this.fileService.fireStoreCollections();

      this.currentRoot = this.fileService.get(this.currentRoot?.parent ?? '');

      if (this.currentRoot === null || this.currentRoot === undefined) {
        this.currentRoot = new FileElement;
        this.canNavigateUp = false;
        //alert("The folder you are navigating to does not exist anymore!\nYou will be redirected back to root Files.");
        await this.updateFileElementQuery(this.currentRoot);
        this.currentPath = this.popFromPath(this.currentPath);
      }
      else
      {
        await this.updateFileElementQuery(this.currentRoot);
        this.currentPath = this.popFromPath(this.currentPath);
      }
    }
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : "";
    if (path != "root" && path?.charAt(this.currentPath.length - 1) === "/") {
      p += `${folderName}/`;
    }
    if (path != "root" && path?.charAt(this.currentPath.length - 1) != "/") {
      p += `/${folderName}/`;
    }
    if (path === "root") {
      p = `${folderName}/`;
    }
    if (!path) {
      p = `${folderName}/`;
    }

    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : "";
    let split = p.split("/");
    split.splice(split.length - 2, 1);
    p = split.join("/");
    return p;
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    this.getUserInfo();
    viewChild.openMenu();
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.addFolder({ name: res });
      }
    });
  }

  async addFolder(folder: { name: string }) {
    let newFolder = new FileElement;
    newFolder.isFolder = true;
    newFolder.name = folder.name;

    await this.fileService.add(newFolder, this.currentRoot).then(
      async () => {
       await this.updateFileElementQuery(this.currentRoot);
      }
    );

  }

  async openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(async (res) => {
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

  openShareDialog(element: FileElement) {
    this.dialog.open(ShareDialogComponent, {
      data: {
        shareLink: element.downloadURL,
        shareZipFolder: null,
      },
    });
  }

  moveElement(self: FileElement, element: FileElement) {
    console.log("Self =>", self);
    console.log("elementFile =>", element);
    this.moveFileElement({ fileElement: self, moveTo: element });
  }

  async moveFileElement(event: {
    fileElement: FileElement;
    moveTo: FileElement;
  }) {
    //get file metadata and current file path
    let getFilePath = await this.fileService.getStorageFilePath(
      event.fileElement
    );

    if (getFilePath) {
      // await this.fileService.moveFile(
      //   getFilePath,
      //   event.moveTo.metaData?.fullPath
      // );
      await this.fileService.update(event.fileElement.id, {
        parent: event.moveTo.id,
      });

      await this.updateFileElementQuery();
    }
  }

  async downloadElement(element: FileElement) {
    this.currentPath = this.currentPath ? this.currentPath : "root";

    if (this.currentPath?.charAt(this.currentPath.length - 1) === "/") {
      this.currentPath = this.currentPath.slice(0, -1);
    }

    if (element.isFolder) {
      var downLoadFolderlist = this.fileService.getDownloadItems(element.id);
      console.log("getDownloadItems response: ", downLoadFolderlist);
      await downloadFolderAsZip(element, this.fileService);
      return;
    } else {
      let filePath = await this.fileService.getStorageFilePath(element);
      this.fileService.downloadFile(filePath);
      return;
    }
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }

  async deleteElement(element: FileElement) {
    this.currentPath = this.currentPath ? this.currentPath : "root";

    if (this.currentPath === "root") {
      this.currentPath = '';
    }

    if (this.currentPath?.charAt(this.currentPath.length - 1) === "/") {
      this.currentPath = this.currentPath.slice(0, -1);
    }

    var findCurrentFolder = this.currentPath?.split("/");
    var currentFolder = findCurrentFolder
      ? findCurrentFolder[findCurrentFolder.length - 1]
      : '';

    var fileElement = await this.getParentFolder(
      this.currentPath,
      currentFolder
    );

    this.removeElement(element);
    await this.updateFileElementQuery(this.currentRoot);
  }

  async removeElement(element: FileElement) {
    await this.fileService.delete(element?.metaData?.fullPath, element);
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
      if (files.item(i))
      {
      this.files.push(files?.item(i) as File);
      }
    }

    this.currentPath = this.currentPath ? this.currentPath : '';

    if (this.currentPath?.charAt(this.currentPath.length - 1) === "/") {
      this.currentPath = this.currentPath.slice(0, -1);
    }

    var findCurrentFolder = this.currentPath?.split("/");
    var currentFolder = findCurrentFolder
      ? findCurrentFolder[findCurrentFolder.length - 1]
      : null;

    await this.getParentFolder(this.currentPath, currentFolder ?? '').then(
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

    const localCurrentF = localStorage.getItem('currentFolderId');

    if (newFileList.length > 0) {
      for (var file = 0; file < newFileList.length; file++) {
        const docId = await this.fileService.createStoreDocumentUpload(
          this.currentPath,
          newFileList[file],
          fulldate,
          '',
          this.currentRoot?.id ?? localCurrentF
        );

        this.getFileIcon({ name: newFileList[file].name, size: newFileList[file].size } as FileElement);

        let uploadPrcnt = await this.fileService.uploadFile(
          newFileList[file],
          this.currentPath,
          docId,
          this.currentRoot
        );

        await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : "root")
          .then((results) => {
            this.fileElements = results;
          });

        this.fileElements.subscribe((value) => {
          value.forEach((file) => {
            if (file.id == docId) {
              file.uploadProgress = uploadPrcnt;
            }
          });
        });

        uploadPrcnt.toPromise().then(async () => {
          await this.updateFileElementQuery(this.currentRoot ?? this.currentRoot);
        });
      }
    }
    this.files = [];
  }

  async updateFileElementQuery(element?: FileElement) {

    await this.fileService.fireStoreCollections();

    this.currentRoot = element ? element : { id : 'root' } as FileElement;

    await this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : "root")
      .then((results) => {
        this.fileElements = results;
      });

    localStorage.setItem('currentFolderId', this.currentRoot.id);
  }

  private async getParentFolder(
    parentPath: string,
    folderName: string
  ): Promise<FileElement> {
    return await this.fileService.getParentFolder(parentPath, folderName);
  }

  getFileIcon(file: FileElement) : string
  {
    let fileExt!: string;
    if(file)
    {
      let ext = this.fileManager.getFileExtension(file.name);
      fileExt  = this.fileManager.getFileExtensionIcon(ext);
    }
    return fileExt;
  }
}
