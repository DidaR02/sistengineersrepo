import { Observable } from 'rxjs'

export class FileElement {
    id: string
    isFolder: boolean
    name: string
    parent?: string
    size?: any
    downloadURL?: string
    metaData?: any
    uploadProgress?: Observable<number>
}

