export interface UserAccess {
    uid: string;
    canDownload?: string;
    canShare?: string;
    canLogin?: string;
    disableView?: string[];
 }