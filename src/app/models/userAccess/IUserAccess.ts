export interface UserAccess {
    uid: string;
    canAddFile: string;
    canCreateFolder: string;
    canDownload: string;
    canShare: string;
    canLogin: string;
    disableView: string[];
    canDelete: string;
    isAdmin: string;
    adminAccessLevel: string;
    partialAccess: PartialAccess[];
 }

 export interface PartialAccess{
     canDisableButtonActions: string;
     canLockFiles: string;
     canModifyUser: string;
     canRestrictUser: string;
     canSetAdminUser: string;
 }
