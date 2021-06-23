import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss']
})
export class UploadTaskComponent implements OnInit {

  @Input() file: File;
  @Output() fileMetaData = new EventEmitter<any>();

  task: AngularFireUploadTask;

  percentage: Observable<number | undefined>;
  snapshot: Observable<any>;
  downloadURL: string;
  metaData: any;
  fileInfo: [string, any];

  constructor(private storage: AngularFireStorage, private db: AngularFirestore) { }

  ngOnInit() {
    this.startUpload();
  }

  startUpload() {
    // The storage path
    const path = `test/${this.file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, this.file);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();

    this.snapshot   = this.task.snapshotChanges().pipe(
      tap(console.log),
      // The file's download URL
      finalize( async() =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();
        this.metaData = await ref.getMetadata().toPromise();

        this.fileInfo = [this.downloadURL,this.metaData];
        this.fileMetaData.emit(this.fileInfo);

        this.db.collection('files').add( {name: this.metaData.name, downloadURL: this.downloadURL, path, fileType: this.metaData.type, timeCreated: this.metaData.timeCreated});
      })
    );
  }

  isActive(snapshot: any) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
