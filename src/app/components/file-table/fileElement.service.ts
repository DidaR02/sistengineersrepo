import {Injectable, PipeTransform} from '@angular/core';

import {BehaviorSubject, observable, Observable, of, Subject} from 'rxjs';

import {FileElement} from './file-element';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortColumn, SortDirection} from './sortable.directive';

import { FileService } from '../../service/fileService/file.service';

interface SearchResult {
  fileElement: FileElement[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(fileElements: FileElement[], column: SortColumn, direction: string): FileElement[] {
  if (direction === '' || column === '') {
    return fileElements;
  } 
  else {
    return [...fileElements].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(fileElement: FileElement, term: string, pipe: PipeTransform) {
  return fileElement.name.toLowerCase().includes(term.toLowerCase());
}

@Injectable({providedIn: 'root'})
export class FileElementService {

  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _fileElement$ : BehaviorSubject<FileElement[]>;
  private _total$ = new BehaviorSubject<number>(0);
  private fileElements: FileElement[];
  observeFileElements: Observable<FileElement[]>;
  private fileService: FileService;

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private pipe: DecimalPipe, fileService: FileService) {
    
    this.fileService = fileService;
    this.getElementCollections();
    //fileService.fireStoreCollections();

    //this.observeFileElements = fileService.queryInFolder('root');

    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._fileElement$.next(result.fileElement);
      this._total$.next(result.total);
    });

    this._search$.next();
  }

  get fileElements$() { return this._fileElement$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({page}); }
  set pageSize(pageSize: number) { this._set({pageSize}); }
  set searchTerm(searchTerm: string) { this._set({searchTerm}); }
  set sortColumn(sortColumn: SortColumn) { this._set({sortColumn}); }
  set sortDirection(sortDirection: SortDirection) { this._set({sortDirection}); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;

    // 1. sort
    let fileElement = sort(this.fileElements, sortColumn, sortDirection);
    const total = fileElement?.length?? 0;

    if(fileElement )
    {
      // 2. filter
      fileElement = fileElement.filter(file => matches(file, searchTerm, this.pipe));
    
      // 3. paginate
      fileElement = fileElement.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    }

    return of({fileElement, total});
  }
 
  //Promise<Observable<FileElement[]>>;
   //private querySubject: BehaviorSubject<FileElement[]>;
   //fileElements: Observable<FileElement[]>;
  async getElementCollections():Promise<Observable<FileElement[]>>{
    this.fileService.fireStoreCollections().then(
      function(results){
        console.log("results collection",results);
      }
    );
    this._fileElement$ = new BehaviorSubject<FileElement[]>([]);
    
    console.log("await",await (await this.fileService.queryInFolder('root')).toPromise());

    return this._fileElement$;
  }

}
