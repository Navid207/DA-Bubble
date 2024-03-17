import { ElementRef, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogInfoComponent } from '../components/dialogs/dialog-info/dialog-info.component';
import { StorageService } from '../firebase-services/storage.service';
import { File } from 'buffer';

/**
 * Service to handle file operations such as file selection, validation, and uploading.
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  element!: ElementRef;

  constructor(
    public dialog: MatDialog,
    private storage: StorageService,
  ) { }

  /**
    * Handles the file selected event from an input element.
    * Validates the file size and type, and initiates file upload if valid.
    * @param {Event} event - The file input change event.
    * @returns {File | undefined} - The selected file if valid, otherwise undefined.
    */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    const supportedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!file) return;
    if ((file.size / 1500 / 1500) > 1) {
      return this.openDialogInfo('Ihre Datei ist zu groß. Maximale Größe beträgt 1.5MB.');
    }
    if (!supportedFileTypes.includes(file.type)) {
      return this.openDialogInfo('Nur .jpg / .png oder .pdf Dateiformate werden unterstützt.');
    }
    // this.tempFile = file;
    this.addFileToMessageText(file);
    return file
  }

  /**
    * Opens a dialog with information or error messages.
    * @param {String} info - The information or error message to display.
    */
  openDialogInfo(info: String): void {
    this.dialog.open(DialogInfoComponent, {
      panelClass: ['card-round-corners'],
      data: { info },
    });
  }

  /**
     * Adds the selected file to the message text area.
     * @param {File} file - The file to add.
     */
  addFileToMessageText(file: File) {
    if (!this.element) return;
    this.appendChildForFile(file);
    // if (!this.range) return
    // this.addEmoji.setCurserToEndPos(this.range);
  }

  /**
    * Appends a child element for the selected file to the DOM.
    * @param {File} file - The file to append.
    */
  appendChildForFile(file: any) {
    let div = document.createElement('div');
    div.contentEditable = 'false';
    div.classList.add('file-overview');
    div.appendChild(this.getImgByFileType(file));
    div.appendChild(this.getSpanByFileName(file));
    div.id = 'uploadFile';
    this.element.nativeElement.insertBefore(div, this.element.nativeElement.firstChild);
    this.element.nativeElement.appendChild(document.createElement('br'));
  }

  /**
    * Creates an image element based on the file type.
    * @param {Blob} file - The file for which to create the image element.
    * @returns {Element} - The created image element.
    */
  getImgByFileType(file: Blob): Element {
    let img = document.createElement('img');
    if (file.type.startsWith('image/') && FileReader) {
      let url = URL.createObjectURL(file);
      img.src = url;
    } else {
      img.src = 'assets/img/icons/pdf.svg';
    }
    img.alt = file.type;
    return img
  }

  /**
     * Creates a span element containing the file name.
     * @param {File} file - The file for which to create the span element.
     * @returns {Element} - The created span element.
     */
  getSpanByFileName(file: globalThis.File): Element {
    let span = document.createElement('span');
    span.innerText = file.name;
    return span
  }

  /**
     * Uploads the file to the storage and returns the file URL.
     * @param {File} file - The file to upload.
     * @returns {Promise<string>} - A promise that resolves with the file URL.
     */
  async uploadFile(file: globalThis.File) {
    if (!this.element) return ''
    let retUrl = '';
    await this.storage.uploadMsgData(file).then((url) => {
      retUrl = url;
    }).catch((error) => {
      console.error("Fehler beim Hochladen des Bildes: ", error);
      this.openDialogInfo("Fehler beim Hochladen des Bildes.");
    });
    return retUrl
  }
}
