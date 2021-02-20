import {DecimalPipe} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {Observable} from 'rxjs';
import {FileElement} from './file-element';
import {FileElementService} from './fileElement.service';
import {NgbdSortableHeader, SortEvent} from './sortable.directive';


@Component({
  selector: 'app-file-table',
  templateUrl: './file-table.component.html',
  styleUrls: ['./file-table.component.css'],
  providers: [FileElementService,DecimalPipe]
})

export class FileTableComponent implements OnInit  {
 
  fileElements$: Observable<FileElement[]>;
  total$: Observable<number>;
  //@Input() service : FileElementService;
  @Input() fileElements: FileElement[]
  @Input() canNavigateUp: string
  @Input() path: string
  @Input() currentRoot: FileElement
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
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

  constructor(public fileElementService: FileElementService) {
    fileElementService.getElementCollections();
    //fileElementService.getElementCollections();

    this.fileElements$ = fileElementService.fileElements$;
    this.total$ = fileElementService.total$;

    console.log("const fileElements", this.fileElements);

  }

  breakpoint: number;

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 400) ? 2 : 6;
    console.log("init fileElements", this.fileElements);
  }
  
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 2 : 6;
  }

  onSort({column, direction}: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.fileElementService.sortColumn = column;
    this.fileElementService.sortDirection = direction;
  }

}
