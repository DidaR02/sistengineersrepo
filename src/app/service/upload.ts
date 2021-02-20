import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, Directive, Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import * as firebase from 'firebase';
import { FileElement } from '../models/file-element/file-element';
import {FileService} from '../service/file.service'

export interface IFileService {

  getFsDocumentCollections(folderId?: string): Map<string, FileElement>;
  uploadFile(parentPath?: string, fileToUpload?: File[]): Map<string, FileElement>;
  isActive(snapshot: any): boolean;
}

@Injectable()
export class UploadComponent implements OnInit {

  @Input() file: File;
  // @Output() fileMetaData = new EventEmitter<any>();

  task: AngularFireUploadTask;

  percentage: Observable<number>;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  metaData: any;
  fileInfo: [Observable<string>, any];

  defaultPublicRootFilePath : string = "SISTEngStorage/SISTEngStorageBucket/PublicBucket/";
  private map = new Map<string, FileElement>();
  private querySubject: BehaviorSubject<FileElement[]>;
  public quelist: Observable<FileElement[]>;

  constructor(private fbStorage?: AngularFireStorage, private fbStore?: AngularFirestore) { 
      
  }
  
  async ngOnInit() {
    (this.file != null || this.file != undefined)
    {
      await this.startUpload();
    }
    
  }

  removeDuplicate(fileList: File[])
  {
    return Array.from(new Set(fileList));
  }

  async uploadFolder(parentPath?: string, folderToUpload?: FileElement) {
   
    let isValidFolder : boolean = (folderToUpload === null || folderToUpload === undefined) ? false : true;

      if(isValidFolder){

        await this.startUploadFolder(parentPath, folderToUpload);
      }

  }

  async startUploadFolder(parentPath?: string, folderToUpload?: FileElement)
  {
    await this.fbStore.collection('files').add( 
      {
        id: folderToUpload.id,
        name: folderToUpload.name,
        isFolder: folderToUpload.isFolder,
        fullPath: folderToUpload?.metaData?.fullPath ? folderToUpload?.metaData?.fullPath : parentPath +"/"+ folderToUpload.name,
        parent: folderToUpload.parent ==="root" ? this.defaultPublicRootFilePath : folderToUpload.parent,
        timeCreated: folderToUpload.metaData.timeCreated,
        metaData: folderToUpload.metaData,
        originalDocumentFolderInfo: folderToUpload
      });
  }

  async uploadFile(parentPath?: string, fileToUpload?: File[]) {
   
    let newFileList = this.removeDuplicate(fileToUpload);

    let hasFile : boolean = (this.file === null || this.file === undefined) ? false : true;

    parentPath = (parentPath === "root" || parentPath === undefined || parentPath === null) ? this.defaultPublicRootFilePath : this.defaultPublicRootFilePath + parentPath;

    if(!hasFile && newFileList.length > 0){
        
      for(var i =0 ; i < newFileList.length; i++)
      {
        this.file = newFileList[i];
        await this.startUpload(parentPath,this.file);
      }

      newFileList = null;
      this.file = null;
    }
    else if (hasFile){

        await this.startUpload(parentPath,this.file).then(()=>{
        this.file = null;
      }
      );
      
    }
    else{
      this.file = null;
    }

    return await this.getFsDocumentCollections();
    //return this.map;
  }

    async startUpload(filePath?: string, file?: File)
    {
      if(file)
      {
      
        
        const path = filePath ? filePath.charAt(filePath.length - 1) === "/" ? filePath + this.file.name : filePath +"/" + this.file.name : `${this.defaultPublicRootFilePath}${this.file.name}`;
        let PrntFilePath = filePath ? filePath : this.defaultPublicRootFilePath;
        
        const ref = this.fbStorage.ref(path);

        this.task = this.fbStorage.upload(path, this.file);

        this.percentage = this.task.percentageChanges();

        var newCustomMetaData: any = null;

        this.snapshot = await this.task.snapshotChanges().pipe(
          finalize(
            
            async () =>  {
            
              this.downloadURL = await this.fbStorage.ref(path).getDownloadURL().toPromise();

              this.metaData = await this.fbStorage.ref(path).getMetadata().toPromise();

              var findParentFromPath = path.split('/');
              var prnt = findParentFromPath[findParentFromPath.length -2];

              if(PrntFilePath.charAt(PrntFilePath.length - 1) === "/")
              {
                PrntFilePath = PrntFilePath.slice(0,-1);
              }

              var getParentPathId = await this.getParentId(prnt, PrntFilePath);
              getParentPathId = getParentPathId ? getParentPathId : prnt;

              var metadata = {
                customMetadata: {
                  'parentId': getParentPathId,
                  'parentName': prnt,
                  'parentPath': PrntFilePath,
                  'isFolder': 'false',
                  'fullPath': this.metaData?.fullPath
                }
              }

              await this.fbStorage.ref(path).updateMetadata(metadata).toPromise().then(
                function(metaData){
                  newCustomMetaData = metaData;
                });
              
              this.metaData = newCustomMetaData;

              await this.fbStore.collection('files').add({
                name: this.metaData?.name,
                downloadURL: this.downloadURL,
                fullPath: this.metaData?.fullPath,
                isFolder: this.metaData?.customMetadata?.isFolder,
                parent: getParentPathId,
                fileType: this.metaData?.type,
                timeCreated: this.metaData?.timeCreated,
                size: this.metaData?.size,
                metadata: {
                  'contentDisposition': this.metaData?.contentDisposition,
                  'contentType': this.metaData?.contentType,
                  'customMetadata': this.metaData?.customMetadata,
                  'isFolder': this.metaData?.customMetadata?.isFolder,
                  'parentId': getParentPathId,
                  'parentName': prnt,
                  'parentPath': PrntFilePath,
                  'fullPath': this.metaData?.fullPath,
                  'name': this.metaData?.name,
                  'size': this.metaData?.size,
                  'timeCreated': this.metaData?.timeCreated,
                  'type': this.metaData?.type,
                  'updated': this.metaData?.updated,
                }
                
              });

              return this.getFsDocumentCollections();

            }
          )
       );
/////////////////////////////////////////
        //console.log("this.snapshot",this.snapshot);
        //this.snapshot.subscribe();
        
      }

    }

  async isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  convertBytes(bytes: number) {
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
    let result: FileElement = null;
    result = new FileElement;
    result.id = document.id;
    result.name = document.data()?.name ? document.data()?.name : "Unknown File";
    result.isFolder = document.data()?.isFolder ? JSON.parse(document.data()?.isFolder) : false;
    result.parent = document.data()?.parent && document.data()?.parent != this.defaultPublicRootFilePath ? document.data().parent!= "PublicBucket" ? document.data().parent : "root" : document.data()?.parent === this.defaultPublicRootFilePath? "root": "root";
    result.size = this.convertBytes(document.data()?.size);;
    result.downloadURL = document.data()?.downloadURL;
    result.metaData = document.data()?.metaData;

    return result;
  }

  private renderMap(result: FileElement){
    this.map.set(result.id, this.clone(result));
  }

  public async getFsDocumentCollections() {
      //Get all folders from root directory
      await this.fbStore.collection('files').get().toPromise().then((snapShot)=> {
  
        snapShot.docs.forEach(
          document => {
            let result = this.renderDocuments(document);
            this.renderMap(result);
          }
        );
      },
       function(error){
        console.log("Error getting document:", error);
       }
       
       ); 

       return this.map;
    }


clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }

  parentId: string;

  private renderParentDoc(parentName: string, parentPath: string,document: any): string
  {
    this.parentId = null;
    if(document.data()?.isFolder && document.data()?.name === parentName && document.data()?.fullPath === parentPath)
    {
      this.parentId = document.id;
      return this.parentId;
    }

    return this.parentId;
  }
  
 public async getParentId(parentName: string, parentPath: string): Promise<string> {

    await this.fbStore.collection('files').get().toPromise().then((snapShot)=> {
  
      snapShot.docs.forEach(
        document => {
          this.renderParentDoc(parentName, parentPath, document);
          return this.parentId;
        }
      );
     },
     function(error){
      console.log("Error getting document:", error);
     }); 

     return this.parentId;
  }

  async getParentFolder(parentPath?: string, folderName?: string): Promise<FileElement>{

    parentPath = (parentPath === "root" || parentPath === undefined || parentPath === null) ? this.defaultPublicRootFilePath : this.defaultPublicRootFilePath + parentPath;
    var result = new FileElement;

    await this.fbStore.collection('files', 
    document => document.where("fullPath", "==", parentPath) && document.where("name", "==", folderName)
    )
    .get().toPromise()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(document) {
          result = this.renderDocuments(document);
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    })
    .finally(function(){
      return result;
    }
      
    );

    return result
  }
}
