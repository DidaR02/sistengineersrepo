import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class DataTypeConversionService {
    
    constructor(){}
    
    getBoolean(value){
        switch(value){
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return true;
            default: 
                return false;
        }
    }

    getStringBoolean(value){
        switch(value){
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return "yes";
            default: 
                return "no";
        }
    }

    convertBooleanToString(value){
        switch(value){
            case true:
            case "true":
            case 1:
            case "1":
            case "on":
            case "yes":
                return "true";
            default: 
                return "false";
        }
    }

    getAdminAccess(value){
        switch(value){
            case "fullAccess":
                return "fullAccess"; 
            case "partialAccess":
                return "partialAccess"; 
            default: 
                return "noAccess";
        }
    }

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
      }
}