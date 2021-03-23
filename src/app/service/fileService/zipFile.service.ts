import * as JSZip from 'jszip';
import firebase from 'firebase/app';
import { saveAs } from 'file-saver';

export const downloadFolderAsZip = async (folderPath: string) => {
    const jszip = new JSZip();

    const folderRef = firebase.storage().ref(folderPath);

    let downloadedFiles: any;

    let fileItems: any[];

    folderRef.listAll()
    .then( (res) => {

        if(res.prefixes.length > 0)
        {
            res.prefixes.forEach(async (folderPrefRef) => { 
                
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


    // if(folders.length > 0)
    // {
    //     folders.forEach(async (folderRef) => {
    //         const downloadUrls: Array<string> = await Promise.all(
    //             files.map(({ name }) => folderRef.child(name).getDownloadURL())
    //         );
    //         downloadedFiles = await Promise.all(downloadUrls.map(url => fetch(url).then(res => res.blob())));
    //         downloadedFiles.forEach((file, i) => jszip.file(files[i].name, file));
    //       });

    //     // const downloadUrls: Array<string> = await Promise.all(
    //     //     files.map(({ name }) => folderRef.child(name).getDownloadURL())
    //     // );
    //     // const downloadedFiles = await Promise.all(downloadUrls.map(url => fetch(url).then(res => res.blob())));
    //     // downloadedFiles.forEach((file, i) => jszip.file(files[i].name, file));
    // }
    // if(files.length > 0)
    // {
    //     const downloadUrls: Array<string> = await Promise.all(
    //         files.map(({ name }) => folderRef.child(name).getDownloadURL())
    //     );
    //     downloadedFiles = await Promise.all(downloadUrls.map(url => fetch(url).then(res => res.blob())));
    //     downloadedFiles.forEach((file, i) => jszip.file(files[i].name, file));

    // }

};