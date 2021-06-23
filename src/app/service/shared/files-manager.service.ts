import { Injectable } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
  })

export class FileManagerService {

    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer){}

    getFileExtension(filename: string) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  getFileExtensionIcon(fileExtension: string) : string {
    let fileType: string =''
    if (fileExtension) {
      switch (fileExtension.toLowerCase()) {
        case "rvt": {
          this.addIconSvg("file-rvt", "../assets/icons/file-rvt.svg");
          fileType = "file-rvt";
          break;
        }
        case "7z":
        case "7zip":
        case "zip":
        case "rar": {
          this.addIconSvg("file-zip", "../assets/icons/file-zip.svg");
          fileType = "file-zip";
          break;
        }
        case "mp4":
        case "mpeg":
        case "adpcm":
        case "aac":
        case "mpegurl":
        case "wma":
        case "wax":
        case "midi":
        case "mpeg":
        case "mp4":
        case "wav":
        case "mp3": {
          this.addIconSvg("file-audio", "../assets/icons/file-audio.svg");
          fileType = "file-audio";
          break;
        }
        case "bmp":
        case "tif":
        case "xiff":
        case "fpx":
        case "x-freehand":
        case "g3fax":
        case "gif":
        case "icon":
        case "ief":
        case "jpeg":
        case "pjpeg":
        case "pcx":
        case "pict":
        case "anymap":
        case "bitmap":
        case "png":
        case "pixmap":
        case "svg":
        case "tiff":
        case "webp":
        case "bitmap":
        case "pixmap":
        case "webp":
        case "jpg":{
          this.addIconSvg("file-image", "../assets/icons/file-image.svg");
          fileType = "file-image";
          break;
        }
        case "dvi":
        case "mpeg":
        case "3gpp":
        case "3gpp2":
        case "ogg":
        case "webm":
        case "msvideo":
        case "hd":
        case "mp4":
        case "fvt":
        case "f4v":
        case "flv":
        case "fli":
        case "jpm":
        case "jpeg":
        case "m4v":
        case "asf":
        case "wmx":
        case "wmv":
        case "wvx":
        case "mpegurl":
        case "quicktime":
        case "vivo": {
          this.addIconSvg("file-video", "../assets/icons/file-video.svg");
          fileType = "file-video";
          break;
        }
        case "doc":
        case "docm":
        case "docx":
        case "dot":
        case "dotx": {
          this.addIconSvg("file-word", "../assets/icons/file-word.svg");
          fileType = "file-word";
          break;
        }
        case "xla":
        case "xlam":
        case "xll":
        case "xlm":
        case "xls":
        case "xlsm":
        case "xlsx":
        case "xlt":
        case "xltm":
        case "xltx": {
          this.addIconSvg("file-excel", "../assets/icons/file-excel.svg");
          fileType = "file-excel";
          break;
        }
        case "pptx":
        case "pptm":
        case "ppt":
        case "ppsx":
        case "ppsm":
        case "pps":
        case "ppam":
        case "potx":
        case "potm":
        case "pot":
        case "sldx": {
          this.addIconSvg(
            "file-powerpoint",
            "../assets/icons/file-powerpoint.svg"
          );
          fileType = "file-powerpoint";
          break;
        }
        case "jvsg" :
        case "dc3" :
        case "psm" :
        case "opt" :
        case "adi" :
        case "model" :
        case "axm" :
        case "dc2" :
        case "epf" :
        case "gsm" :
        case "lcf" :
        case "cpa" :
        case "afs" :
        case "bdc" :
        case "mhs" :
        case "mp12" :
        case "tct" :
        case "jt" :
        case "iba" :
        case "psv" :
        case "db1" :
        case "cad" :
        case "job" :
        case "rtd" :
        case "mc9" :
        case "pat" :
        case "mcx" :
        case "3dl" :
        case "edf" :
        case "dwfx" :
        case "123dx" :
        case "dlv" :
        case "rsg" :
        case "cad" :
        case "asy" :
        case "afd" :
        case "lin" :
        case "logicly" :
        case "nc" :
        case "catproduct" :
        case "cyp" :
        case "mto" :
        case "rsm" :
        case "dwt" :
        case "dra" :
        case "cib" :
        case "pss" :
        case "fcstd1" :
        case "li3d" :
        case "ide" :
        case "dst" :
        case "sldasm" :
        case "des" :
        case "fcw" :
        case "ms13" :
        case "ms14" :
        case "xv3" :
        case "sat" :
        case "vet" :
        case "nc" :
        case "pln" :
        case "pwt" :
        case "edn" :
        case "jvsgz" :
        case "sldprt" :
        case "dsn" :
        case "spt" :
        case "blk" :
        case "bcd" :
        case "cgr" :
        case "phj" :
        case "dru" :
        case "fzp" :
        case "cf2" :
        case "x_b" :
        case "123d" :
        case "igs" :
        case "iso" :
        case "stl" :
        case "art" :
        case "skf" :
        case "mp11" :
        case "cff" :
        case "jam" :
        case "easm" :
        case "cdl" :
        case "idv" :
        case "dws" :
        case "isoz" :
        case "gxc" :
        case "pla" :
        case "asm" :
        case "msm" :
        case "mp10" :
        case "min" :
        case "vwx" :
        case "dgn" :
        case "ics" :
        case "cdw" :
        case "prt" :
        case "dxf" :
        case "bmf" :
        case "prg" :
        case "fmz" :
        case "sch" :
        case "shx" :
        case "dfx" :
        case "svd" :
        case "icd" :
        case "gds" :
        case "if" :
        case "czd" :
        case "nwf" :
        case "bpm" :
        case "sch" :
        case "123" :
        case "cmp" :
        case "bbcd" :
        case "wdf" :
        case "fz" :
        case "hsc" :
        case "cam" :
        case "2d" :
        case "mp7" :
        case "act" :
        case "prt" :
        case "modfem" :
        case "cyp" :
        case "dxe" :
        case "dc1" :
        case "gxm" :
        case "ltl" :
        case "circuit" :
        case "sab" :
        case "xise" :
        case "fzz" :
        case "catpart" :
        case "asc" :
        case "a2l" :
        case "g" :
        case "scad" :
        case "prt" :
        case "rra" :
        case "tak" :
        case "mcd" :
        case "tsc" :
        case "tcd" :
        case "fcstd" :
        case "catdrawing" :
        case "ewb" :
        case "bdl" :
        case "dxx" :
        case "g3d" :
        case "drw" :
        case "lizd" :
        case "ezp" :
        case "fnc" :
        case "uld" :
        case "eld" :
        case "red" :
        case "ldr" :
        case "cnc" :
        case "pho" :
        case "drw" :
        case "tcm" :
        case "wdp" :
        case "opj" :
        case "cam" :
        case "idw" :
        case "slddrw" :
        case "brd" :
        case "olb" :
        case "123c" :
        case "gcd" :
        case "rig" :
        case "ipt" :
        case "cnc" :
        case "ldt" :
        case "dgk" :
        case "gcode" :
        case "drwdot" :
        case "dc" :
        case "jbc" :
        case "sew" :
        case "any" :
        case "drg" :
        case "bxl" :
        case "min" :
        case "psf" :
        case "dlx" :
        case "prt" :
        case "bit" :
        case "cddx" :
        case "rdf" :
        case "ms11" :
        case "ngc" :
        case "ard" :
        case "nwd" :
        case "tsf" :
        case "dft" :
        case "ewd" :
        case "tcd" :
        case "neu" :
        case "nc1" :
        case "nwc" :
        case "fzbz" :
        case "scdoc" :
        case "ms12" :
        case "3w" :
        case "eqn" :
        case "ifcxml" :
        case "npl" :
        case "pipe" :
        case "ic3d" :
        case "lia" :
        case "pipd" :
        case "topviw" :
        case "ginspect_prj" :
        case "rml" :
        case "tc2" :
        case "tc3" :
        case "t3001" :
        case "lyr" :
        case "fan" :
        case "pc6" :
        case "pm3" :
        case "eprt" :
        case "easmx" :
        case "xbf" :
        case "smb" :
        case "rcm" :
        case "dgb" :
        case "sza" :
        case "brd" :
        case "mmg" :
        case "pc7" :
        case "prjpcb" :
        case "smt" :
        case "bpmc" :
        case "flx" :
        case "hus" :
        case "mp13" :
        case "x_t" :
        case "bimx" :
        case "adt" :
        case "iam" :
        case "exb" :
        case "dcd" :
        case "ipj" :
        case "kit" :
        case "geo" :
        case "vnd" :
        case "psu" :
        case "tbp" :
        case "mp14" :
        case "att" :
        case "tcp" :
        case "rcd" :
        case "lyc" :
        case "tcw" :
        case "vtf" :
        case "top" :
        case "mvs" :
        case "fzb" :
        case "hsf" :
        case "gxd" :
        case "mdl" :
        case "fpd" :
        case "ipn" :
        case "pro" :
        case "crv" :
        case "edrw" :
        case "ngd" :
        case "smg" :
        case "sbp" :
        case "lay6" :
        case "cir" :
        case "pcs" :
        case "mp8" :
        case "ipf" :
        case "dvg" :
        case "dra" :
        case "ise" :
        case "3dc" :
        case "dbq" :
        case "rs" :
        case "cnd" :
        case "sym" :
        case "sch" :
        case "ckd" :
        case "sdg" :
        case "bswx" :
        case "gbx" :
        case "cyg" :
        case "libpkg" :
        case "prjscr" :
        case "dsnwrk" :
        case "prjmbd" :
        case "dxo" :
        case "fzm" :
        case "sch" :
        case "ckt" :
        case "tcx" :
        case "ifczip" :
        case "mod" :
        case "ms7" :
        case "l3b" :
        case "ms9" :
        case "idcl" :
        case "unt" :
        case "pwd" :
        case "rcv" :
        case "qpm" :
        case "fpp" :
        case "gxh" :
        case "xnc" :
        case "mp9" :
        case "bpz" :
        case "bsw" :
        case "dsg" :
        case "dc2" :
        case "upf" :
        case "hcp" :
        case "topprj" :
        case "cel" :
        case "ezc" :
        case "fcd" :
        case "cmp" :
        case "brep" :
        {
          this.addIconSvg("file-cad", "../assets/icons/file-cad.svg");
         fileType = "file-cad";
          break;
        }

        case "dwg":
        case "DWG":{
          this.addIconSvg("file-pdf", "../assets/icons/file-dwg.svg");
         fileType = "file-dwg";
          break;
        }
        case "pdf": {
          this.addIconSvg("file-pdf", "../assets/icons/file-pdf.svg");
          fileType = "file-pdf";
          break;
        }
        case "ai": {
          this.addIconSvg("file-adobeIllustrator",
              "../assets/icons/file-adobeIllustrator.svg");
         fileType = "file-adobeIllustrator";
          break;
        }
        case "psd": {
          this.addIconSvg("file-adobePhotoshop",
              "../assets/icons/file-adobePhotoshop.svg");
          fileType = "file-adobePhotoshop";
          break;
        }
        case "exe": {
          this.addIconSvg("file-exe",
              "../assets/icons/file-exe.svg");
          fileType = "file-exe";
          break;
        }
        case "sql": {
          this.addIconSvg("file-sql",
              "../assets/icons/file-sql.svg");
          fileType = "file-sql";
          break;
        }
        default: {
          this.addIconSvg(
            "file-txt-default",
            "../assets/icons/file-txt-default.svg"
          );
          fileType = "file-txt-default";
          break;
        }
      }
    }
    return fileType;
  }

   addIconSvg(iconName: string, iconSvgPath : string) {
    this.matIconRegistry.addSvgIcon(
      iconName,
      this.domSanitizer.bypassSecurityTrustResourceUrl(iconSvgPath)
    );
  }
}
