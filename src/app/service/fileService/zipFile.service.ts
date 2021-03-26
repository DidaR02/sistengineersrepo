import * as JSZip from 'jszip';
import firebase from 'firebase/app';
import { saveAs } from 'file-saver';
import { FileElement } from 'src/app/models/file-element/file-element';
import { FileService } from 'src/app/service/fileService/file.service';
import { folder } from 'jszip';

export const downloadFolderAsZip = async (mainParent: FileElement, fileService: FileService) => {

    var downLoadFolderlist = fileService.getDownloadItems(mainParent.id);
    
    if(downLoadFolderlist.size > 0)
    {
        const filePath = await fileService.getStorageFilePath(mainParent);
        const folderRef = firebase.storage().ref(filePath);
        const jszip = new JSZip();
        let downloadedFiles: any;
        let fileItems: any[];

        let folderSize: number = 0;

        folderRef.listAll()
        .then((res) => {

            if(res.prefixes.length > 0)
            {
                res.prefixes.forEach(async (folderPrefRef) => { 

                //if folder ids match, then checkfiles
                jszip.folder(folderPrefRef.name);

                });
            }
            
            res.items.forEach(async (itemRef) => {
                fileItems.push(itemRef);

                const downloadUrls: Array<string> = await Promise.all(
                    fileItems.map(({ name }) => folderRef.child(name).getDownloadURL())
                );
                downloadedFiles = await Promise.all(downloadUrls.map(url => fetch(url).then(res => res.blob())));
                downloadedFiles.forEach((file, i) => jszip.file(fileItems[i].name, file));
            });

            const content = jszip.generateAsync({ type: 'blob' }).then(
                (content) =>{
                    console.log(content);
                    saveAs(content, folderRef.name);
                }
            );
            
        }).catch((error) => {
            console.log("download folderRef errors.")
        });

        
        // for (let [key, value] of downLoadFolderlist) {
        //     if(key.parent === "root")
        //     {

        //     }
        //     console.log(key, value);
        // }
        
        // for(folderSize; folderSize <= downLoadFolderlist.size; folderSize++){

            

        //     folderSize++;
        // }
    }
};