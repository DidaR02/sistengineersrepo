import * as JSZip from 'jszip';
import firebase from 'firebase/app';
import { saveAs } from 'file-saver';
import { FileElement } from 'src/app/models/file-element/file-element';
import { FileService } from 'src/app/service/fileService/file.service';

export const downloadFolderAsZip = async (mainParent: FileElement, fileService: FileService) => {

    var downLoadFolderlist = fileService.getDownloadItems(mainParent.id);

    if(downLoadFolderlist.size > 0)
    {
        const filePath = await fileService.getStorageFilePath(mainParent);
        const mainFolderRef = firebase.storage().ref(filePath);
        const jszip = new JSZip();
        let downloadedFiles: any;
        let fileItems: any[] = [];
        let folderRefList: firebase.storage.Reference[] = [];

        folderRefList.push(mainFolderRef);

        if(folderRefList)
        {
            var newfolder:any = null;

            for(var i = 0 ; i <= folderRefList.length - 1; i++)
            {
                fileItems = [];
                downloadedFiles = null;

                var nextFolder = folderRefList[i];

                await nextFolder.listAll()
                .then(async (res) => {

                    res.prefixes.forEach((folderPrefRef) => {
                        folderRefList.push(
                            firebase.storage().ref(folderPrefRef.fullPath)
                        );
                    });

                    res.items.forEach((itemRef) => {
                        fileItems.push(itemRef);
                    });
                }).catch((error) => {
                console.log("download folder errors. \n", error)
                });

                const downloadUrls: Array<string> = await Promise.all(
                    fileItems.map(({ name }) => nextFolder.child(name).getDownloadURL())
                );

                downloadedFiles = await Promise.all(downloadUrls.map(url => fetch(url).then(res => res.blob())));

                if(nextFolder.fullPath === mainFolderRef.fullPath && nextFolder.name === mainFolderRef.name)
                {
                    downloadedFiles.forEach((file: null, i: string | number) => jszip.file(fileItems[i as number].name, file));
                }
                else
                {
                    newfolder = jszip.folder(nextFolder.name);
                    downloadedFiles.forEach((file: null, i: string | number) => newfolder.file(fileItems[i as number].name, file));
                }
            }

            const content = jszip.generateAsync({ type: 'blob' }).then(
                (content) =>{
                    saveAs(content, mainFolderRef.name);
                }
            );
        }

    }
};


// for (let [key, value] of downLoadFolderlist) {
//     if(key.parent === "root")
//     {

//     }
//     console.log(key, value);
// }

// for(folderSize; folderSize <= downLoadFolderlist.size; folderSize++){



//     folderSize++;
// }
