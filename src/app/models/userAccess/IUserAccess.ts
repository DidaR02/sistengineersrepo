export interface UserAccess {
    uid: string;
    canDownload?: string;
    canShare?: string;
    canLogin?: string;
    disableView?: string[];
    canDelete: string;
    isAdmin: string;
    AdminAccessLevel: string;
    PartialAcces: PartialAcces[];
 }

 export interface PartialAcces{
     canDisableButtonActions: string;
     canLockFiles: string;
     canModifyUser: string;
     canRestrictUser: string;
     canSetAdminUser: string;
 }