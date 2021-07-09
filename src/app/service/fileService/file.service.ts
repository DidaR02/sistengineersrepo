import { Injectable, Inject,Input } from '@angular/core';

// import { v4 } from 'uuid';
import { FileElement } from '../../models/file-element/file-element';
import { BehaviorSubject, Observable  } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFireList, AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { finalize, map, tap } from 'rxjs/operators';
import {UploadComponent} from './upload';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
// import { element } from 'protractor';
import * as firebase from 'firebase';


export interface IFileService {
  add(parentRoot: FileElement, fileElement: FileElement): any;
  delete(filePath: string, element: FileElement): Promise<any>;
  update(id: string, update: Partial<FileElement>): any;
  queryInFolder(folderId: string): Promise<Observable<FileElement[]>>;
  get(id: string): FileElement;
  removeDuplicate(fileList: FileElement[]): any;
  fireStoreCollections(folderId: string): any;
  uploadFile(fileToUpload: File, parentPath: string, docId: string, currentFoler: FileElement): Promise<Observable<number | any>>;
  // moveFile(currentPath: string, destinationPath: any): any;
  getStorageFilePath(fileElement: FileElement): Promise<string>;
  createStoreDocumentUpload(filePath: string,file: File, date: string, docId: string, parentFolder: string) :Promise<string>;
  updateProgress(id: string, update: Partial<FileElement>): any;
  getDownloadItems(fileId :string) : any;
}

@Injectable()
export class FileService implements IFileService {

  private map = new Map<string, FileElement>();

  private defaultPublicRootFilePath : string = "SISTEngStorage/SISTEngStorageBucket/PublicBucket/";
  private progressSubject: BehaviorSubject<number>;

  percentage: Observable<number | undefined>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  metaData: any;
  fileInfo: [Observable<string>, any];
  @Input() file: File;
  task: AngularFireUploadTask;

  parentChildList: Map<FileElement, FileElement[]>;

  constructor(private fireStore: AngularFirestore, private fireStorage: AngularFireStorage, private uploadcomponent: UploadComponent) {}

  async add(fileElement: FileElement, parentRoot?: FileElement) {

    let isValidFolder : boolean = (fileElement === null || fileElement === undefined) ? false : true;

      if(isValidFolder){

        const today = new Date();

        //let time = today.getTime();
        // adjust 0 before single digit date
        const date = ("0" + today.getDate()).slice(-2);

        // current month
        const month = ("0" + (today.getMonth() + 1)).slice(-2);

        // current year
        const year = today.getFullYear();

        const fulldate = year + month + date;
        const docId = this.fireStore.createId() +"_"+ fulldate;

        if(!fileElement.id)
            {
              fileElement.id = docId;
        }

        let parentFolferA: string = '';

        if (parentRoot)
        {
          parentFolferA = parentRoot.id === 'root' && !parentRoot.metaData ? this.defaultPublicRootFilePath :
            parentRoot?.metaData ? parentRoot?.metaData?.fullPath : this.defaultPublicRootFilePath;
        }

        const parentPath: string = fileElement.parent === "root" ? this.defaultPublicRootFilePath : parentFolferA;

                //call upload, caller must decide the folder path and parent nodes
            fileElement.isFolder = true;
            fileElement.parent = parentRoot? parentRoot.id : 'root';
            fileElement.metaData = {
              fullPath : parentFolferA ? parentFolferA +"/"+ fileElement.name : this.defaultPublicRootFilePath + fileElement.name,
              timeCreated : today,
              size: fileElement.size ?? 0,
              defaultPublicRootFilePath: this.defaultPublicRootFilePath
            }

            this.fireStore.collection("files").doc(docId).set({
              id: fileElement.id,
              name: fileElement.name,
              isFolder: fileElement.isFolder,
              fullPath: fileElement?.metaData?.fullPath ? fileElement?.metaData?.fullPath : parentPath +"/"+ fileElement.name,
              parent: fileElement.parent ==="root" ? this.defaultPublicRootFilePath : fileElement.parent,
              metaData: fileElement.metaData
            });

      }

    return fileElement;
  }

  async delete(filePath: string, element: FileElement) {

    if(filePath){
      if(filePath?.charAt(filePath?.length - 1) === "/" && element)
      {
        filePath = filePath + element?.name;
      }
    }
    else{
      filePath = this.defaultPublicRootFilePath + element.name;
    }
    if(filePath){

      await this.fireStore.collection('files').doc(element?.id).delete().then(
        async () => {
          this.map.delete(element.id);
        }
      )
        .catch((error) => {
          const errorMsg = "Failed to delete files."
          console.log("error", error);
          window.alert("errorMsg");
        });
    }
  }

  async update(id: string, update: Partial<FileElement>) {
    var result = new FileElement;
    const renameFolderInfo = {
      "name": update.name,
      "originalDocumentFolderInfo.name": update.name
    }
    const renameFileInfo = {
      "name": update.name
    }

    //Update firestor
    await this.fireStore.collection('files')
    .doc('/' + id)
    .update(update.isFolder ? renameFolderInfo : renameFileInfo)
    .then(() => {
      console.log('done');
    })
    .catch(function(error) {
     console.error('Error writing document: ', error);
    });

    //Update map
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  async updateProgress(id: string, update: Partial<FileElement>) {

    //Update map with upload progress
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }


  private querySubject: BehaviorSubject<FileElement[]>;

  async queryInFolder(folderId: string) {
    const result: FileElement[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId && (element.name != null || element.name != undefined)) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }

    return this.querySubject.asObservable();
  }

  get(id: string) {
    var element!: FileElement;
    this.map.forEach((file) =>{
      if(file.id === id)
      element = file;
    });//get(id);
    return element
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }

  removeDuplicate(fileList: FileElement[])
  {
    return Array.from(new Set(fileList));
  }
  removeFileDuplicate(fileList: File[])
  {
    return Array.from(new Set(fileList));
  }
  currentDocToQuery: any[] = [];

  //Format bytes to a MB GB TB and so forth
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatBytes2(a: number,b=2){
    if(0===a)
    return"0 Bytes";

    const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));

    return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]
  }

  convertBytes(bytes: number){
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes == 0) {
      return "n/a"
    }

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())

    if (i == 0) {
      return bytes + " " + sizes[i]
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
  }
 //END Format bytes to a MB GB TB and so forth


 private renderDocuments(document: any): FileElement{
  let result: FileElement;
  result = new FileElement;
  result.id = document.id;
  result.name = document.data()?.name ? document.data()?.name : "Unknown File";
  result.isFolder = document.data()?.isFolder ? JSON.parse(document.data()?.isFolder) : false;
  result.parent = document.data()?.parent && document.data()?.parent != this.defaultPublicRootFilePath ? document.data().parent!= "PublicBucket" ? document.data().parent : "root" : document.data()?.parent === this.defaultPublicRootFilePath? "root": "root";
  result.size = this.convertBytes(document.data()?.size);
  result.downloadURL = document.data()?.downloadURL;
  result.metaData = document.data()?.metaData;

  return result;
}

private renderMap(result: FileElement){
  this.map.set(result.id, this.clone(result));
}

private childList: FileElement[];
private parent : FileElement;
private parentList : FileElement[];

getDownloadItems(fileId :string)
{
  this.parentChildList = new Map<FileElement, FileElement[]>();
  this.parentList = [];
  this.childList = [];

  this.map.forEach((rootFile) =>{
    if(rootFile.isFolder && rootFile.id === fileId)
    {
      this.addParentList(rootFile);
        //create standalone root files
      this.addChildList(rootFile);
      this.addParentChildList(rootFile, this.childList);
      this.childList = [];

      if(this.parentList.length>0)
      {
        for(var i = 0; i < this.parentList.length; i++)
        {
          this.parentList.forEach((parentFolder)=>{
            this.addParentList(parentFolder);
          });

          i++;
        }
      }
    }
  });

  //create parentchildlist
  if(this.parentList.length >0){

    this.parentList.forEach((parent) =>{
      this.addChildList(parent);
      this.addParentChildList(parent, this.childList);
      this.childList = [];
    });
  }

  return this.parentChildList
}

addParentChildList(parentFile: FileElement, subfile: FileElement[])
{
  this.parentChildList.set(parentFile, this.childList);
}

addChildList(parentFile: FileElement)
{
  this.map.forEach((subFile) =>{
    if(!subFile.isFolder && subFile.parent === parentFile.id)
    {
      this.childList.push(subFile);
    }
  });
}

addParentList(parentFile: FileElement)
{
  this.map.forEach((subParent) =>{
    if(subParent.isFolder && subParent.parent === parentFile.id)
    {
      let doesParentExist = this.parentList.find(x => x.id === subParent.id)
      if(!doesParentExist)
        this.parentList.push(subParent);
    }
  });
}

async fireStoreCollections()
{
  await this.fireStore.collection('files').get().toPromise().then((snapShot)=> {
    snapShot.docs.forEach(
      document => {
        let result = this.renderDocuments(document);
        this.renderMap(result);
      }
    );
  },
  function(error){
    console.log("Error getting document:", error);
  });
}

async uploadFile(fileToUpload: File, parentPath: string, docId: string, currentFoler: FileElement): Promise<Observable<number | any>> {

  parentPath = (parentPath === "root" || parentPath === undefined || parentPath === null) ? this.defaultPublicRootFilePath : this.defaultPublicRootFilePath + parentPath;
  const path = parentPath ? parentPath.charAt(parentPath.length - 1) === "/" ? parentPath + fileToUpload.name : parentPath +"/" + fileToUpload.name : `${this.defaultPublicRootFilePath}${fileToUpload.name}`;
  let PrntFilePath = parentPath ? parentPath : this.defaultPublicRootFilePath;

  const ref = this.fireStorage.ref(path);

  let findParentFromPath = path.split('/');
  let parentFolder = findParentFromPath[findParentFromPath.length - 2];

  if (PrntFilePath.charAt(PrntFilePath.length - 1) === "/") {
    PrntFilePath = PrntFilePath.slice(0, -1);
  }

  let setMetadata = {
    customMetadata: {
      'parentId': currentFoler?.id ?? 'root',
      'parentName': currentFoler?.name ?? parentFolder,
      'parentPath': PrntFilePath,
      'isFolder': 'false'
    }
  };

  const today = new Date();

  //let time = today.getTime();
  // adjust 0 before single digit date
  const date = ("0" + today.getDate()).slice(-2);

  // current month
  const month = ("0" + (today.getMonth() + 1)).slice(-2);

  // current year
  const year = today.getFullYear();

  const fulldate = year + month + date;

  if(!docId){
    docId = this.fireStore.createId()  + "_" + fulldate;
  }

  this.task = this.fireStorage.upload(path, fileToUpload);

  this.percentage = this.task.percentageChanges();

  var newCustomMetaData: any = null;

  this.task.snapshotChanges().pipe(
    finalize(

      async () =>  {

        this.downloadURL = await this.fireStorage.ref(path).getDownloadURL().toPromise();

        await this.fireStorage.ref(path).updateMetadata(setMetadata).toPromise().then(
          function (newMetaData) {
            newCustomMetaData = newMetaData;
          });

        this.metaData = newCustomMetaData;

        var metadata = {
          customMetadata: {
            'fullPath': this.metaData?.fullPath
          }
        }

        await this.fireStorage.ref(path).updateMetadata(metadata).toPromise().then(
          function(metaData){
            newCustomMetaData = metaData;
          });

        this.metaData = newCustomMetaData;

        var findParentFromPath = path.split('/');
        var prnt = findParentFromPath[findParentFromPath.length -2];

        if(PrntFilePath.charAt(PrntFilePath.length - 1) === "/")
        {
          PrntFilePath = PrntFilePath.slice(0,-1);
        }

        var getParentPathId = await this.getParentId(prnt, PrntFilePath);
        getParentPathId = getParentPathId ? getParentPathId : prnt;

        const updateFileDetails = {
          "downloadURL": this.downloadURL ? this.downloadURL : '',
          "fullPath": this.metaData?.fullPath ? this.metaData?.fullPath : '' ,
          "metaData": {
            'contentDisposition': this.metaData?.contentDisposition,
            'contentType': this.metaData?.contentType,
            'customMetadata': this.metaData?.customMetadata,
            'isFolder': this.metaData?.customMetadata?.isFolder,
            'parentId': this.metaData?.customMetadata?.parentId,
            'parentName': prnt,
            'parentPath': PrntFilePath,
            'fullPath': this.metaData?.fullPath,
            'name': this.metaData?.name,
            'size': this.metaData?.size,
            'timeCreated': this.metaData?.timeCreated,
            'type': this.metaData?.type,
            'updated': this.metaData?.updated,
          },
          "parent": this.metaData ? this.metaData?.customMetadata?.parentId : '',
          "timeCreated": today,
          }

          await this.fireStore.collection('files')
          .doc('/' + docId)
          .update(updateFileDetails)
          .catch(function(error) {
          console.error('Error writing document: ', error);
          alert("Error writing document.");
          });

          let newFileElement = this.get(docId);
          newFileElement.downloadURL = this.downloadURL.toString();

          let element = this.map.get(docId);
          element = Object.assign(element, newFileElement);
          this.map.set(element.id, element);

          await this.fireStoreCollections();
      })//end finalise async
    ).subscribe(); //end snapshotChanges finalise

  return this.percentage;
}

  async getParentFolder(parentPath: string, folderName: string): Promise<FileElement>{

      parentPath = (parentPath === "root" || parentPath === undefined || parentPath === null) ? this.defaultPublicRootFilePath : this.defaultPublicRootFilePath + parentPath;
      var result!: FileElement;

      await this.fireStore.collection('files',
        document => document.where("fullPath", "==", parentPath) && document.where("name", "==", folderName)
        ).get().toPromise().then((snapShot)=> {
        snapShot.docs.forEach(
          document => {
            return result = this.renderDocuments(document);
            });
       })
       return result;
    }

    async createStoreDocumentUpload(filePath: string,file: File, date: string, docId: string = '', parentFolder: string){
      const path = filePath ? filePath.charAt(filePath.length - 1) === "/" ? filePath + file.name : filePath +"/" + file.name : `${this.defaultPublicRootFilePath}${file.name}`;

      if(!date){
        const today = new Date();

        // adjust 0 before single digit date
        const day = ("0" + today.getDate()).slice(-2);

        // current month
        const month = ("0" + (today.getMonth() + 1)).slice(-2);

        // current year
        const year = today.getFullYear();

        date = year + month + day;
      }

      if(!docId){
      docId = this.fireStore.createId()  + "_" + date;
      }

      if(file){

            // Create our initial doc
            await this.fireStore.collection("files").doc(docId)
            .set(
              {
                name: file.name,
                fileType: file.type,
                size: file.size,
                isFolder: false,
                timeCreated: date,
                parent: parentFolder,
              })
            .then(async ()=>
              {
                await this.fireStore.collection("files").doc(docId).get().toPromise().then((document)=>
                  {
                    let result: any;
                    if(document.exists)
                    {
                      result = this.renderDocuments(document);
                      this.renderMap(result);
                    }
                    return result;
                  })
                  .catch(
                    function(error) {
                      console.log("Something happend getting initial file: ", error);
                      alert("Something happend getting initial file.");
                    });//end get new file collection to map
              });//end collection set then

        return docId;
      }
      return docId;
    }

  parentId: string;

    private renderParentDoc(parentName: string, parentPath: string, document: any): string
    {
      this.parentId = '';
      if(document.data()?.isFolder && document.data()?.name === parentName && document.data()?.fullPath === parentPath)
      {
        this.parentId = document.id;
        return this.parentId;
      }
      return this.parentId;
    }

    public async getParentId(parentName: string, parentPath: string): Promise<string> {

      await this.fireStore.collection('files').get().toPromise().then((snapShot)=> {
        snapShot.docs.forEach(
          document => {
            this.renderParentDoc(parentName, parentPath, document);
            });
       },
       function(error){
        console.log("Error getting document:", error);
       });

       return this.parentId;
    }

 async mergeTypedArrays(a: { length: number; constructor: new (arg0: any) => any; }, b: string | any[]) {
    // Checks for truthy values on both arrays
    if(!a && !b) throw 'Please specify valid arguments for parameters a and b.';

    // Checks for truthy values or empty arrays on each argument
    // to avoid the unnecessary construction of a new array and
    // the type comparison
    if(!b || b.length === 0) return a;
    if(!a || a.length === 0) return b;

    // Make sure that both typed arrays are of the same type
    if(Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
        throw 'The types of the two arguments passed for parameters a and b do not match.';

    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);

    return c;
  }

  returnStorageFilePath(document: any) : string{
    return document?.data()?.fullPath
  }

  async getStorageFilePath(fileElement: FileElement): Promise<string> {
    var fileFullPath: string = '';
    if(fileElement){
      await this.fireStore.collection('files').get().toPromise().then((snapShot)=> {

        snapShot.docs.forEach(
          document => {
            if(document?.id === fileElement?.id)
            {
              fileFullPath = this.returnStorageFilePath(document);
            }
            return fileFullPath;
          }
        );
       },
       function(error){
        console.log("Error getting document fullPath:", error);
       });
    }
    return fileFullPath;
  }


  downloadFile(file: string) {
    this.fireStorage.storage.ref().child(file).getDownloadURL().then(function(url) {
      window.open(url);
    }).catch(function(error) {
      // Handle any errors
      console.log("Download failed =>", error);
      alert("Download failed!");
      return
    });

  }
}
