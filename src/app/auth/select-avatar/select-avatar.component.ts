import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/firebase-services/auth.service';
import { slideInUpAnimation } from '../../shared/services/animations';

@Component({
  selector: 'app-select-avatar',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule],
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss',
  animations: [slideInUpAnimation],
})
export class SelectAvatarComponent implements OnInit {
  ngOnInit(): void {
    this.loadUserName();
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  avatars = ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg'];
  currentAvatar = './assets/img/empty-profile.png';
  animationClass = '';
  showError = false;
  errorMessage = '';
  formIsValid = false;
  avatarError = false;
  registrationSuccess = false;
  userName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Loads the user's name from local storage, if available.
   */
  loadUserName() {
    const tempUserData = JSON.parse(localStorage.getItem('tempUser') || '{}');
    this.userName = tempUserData.name || '';
  }

  /**
   * Selects an avatar from the predefined list and updates the UI accordingly.
   * @param {string} avatar - The filename of the selected avatar.
   */
  selectAvatar(avatar: string) {
    this.fadeOut();
    setTimeout(() => {
      this.currentAvatar = `./assets/img/avatars/${avatar}`;
      this.fadeIn();
    }, 500);
    this.formIsValid = true;
    this.showError = false;
    this.avatarError = false;
  }

  /**
   * Handles the selection of a file for the avatar, including validation and uploading.
   * @param {Event} event - The event object from the file input element.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / 1500 / 1500; // Korrektur für MB-Berechnung
    const isSupportedFileType =
      file.type === 'image/jpeg' || file.type === 'image/png';

    if (fileSizeMB > 1.5) {
      this.setFormError('Ihr Bild ist zu groß. Maximale Größe beträgt 1.5MB.');
      return;
    }

    if (!isSupportedFileType) {
      this.setFormError('Nur .jpg und .png Dateiformate werden unterstützt.');
      return;
    }

    // Hochladen des Bildes und Setzen der URL als Avatar
    this.authService
      .uploadAvatarImage(file)
      .then((url) => {
        this.currentAvatar = url;
        this.fadeIn();
        this.formIsValid = true;
        this.showError = false;
        this.avatarError = false;
      })
      .catch((error) => {
        console.error('Fehler beim Hochladen des Bildes: ', error);
        this.setFormError('Fehler beim Hochladen des Bildes.');
      });
  }

  /**
   * Sets an error message for the form and updates the UI to reflect the error state.
   * @param {string} errorMessage - The error message to be displayed.
   */
  private setFormError(errorMessage: string) {
    this.showError = true;
    this.errorMessage = errorMessage;
    this.formIsValid = false;
  }

  /**
   * Loads the selected image file into the avatar preview.
   * @param {File} file - The file to be read and displayed.
   */
  private loadImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentAvatar = e.target.result;
      this.animationClass = 'fade-in';
      this.formIsValid = true;
      this.showError = false;
      this.avatarError = false;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Applies a fade-in animation to the avatar preview.
   */
  fadeIn() {
    this.animationClass = 'fade-in';
    setTimeout(() => (this.animationClass = ''), 500);
  }

  /**
   * Applies a fade-out animation to the avatar preview.
   */
  fadeOut() {
    this.animationClass = 'fade-out';
    setTimeout(() => (this.animationClass = ''), 500);
  }

  /**
   * Closes the error message display.
   */
  closeError() {
    this.showError = false;
  }

  /**
   * Navigates back to the sign-up page.
   */
  backToSignUp() {
    this.router.navigate(['/signUp']);
  }

  /**
   * Attempts to register the account with the provided information and navigates to the login page upon success.
   */
  async registerAccount() {
    const tempUserData = JSON.parse(localStorage.getItem('tempUser') ?? '{}');
    if (this.formIsValid && tempUserData.email && tempUserData.password) {
      await this.authService.saveAccountDataUser(
        tempUserData.email,
        tempUserData.password,
        tempUserData.name ?? '',
        this.currentAvatar
      );
      localStorage.removeItem('tempUser');
      document.querySelector('.avatar')?.classList.add('slide-out-down');
      this.registrationSuccess = true;
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } else {
      this.avatarError = true;
    }
  }

  openImprint() {
    this.router.navigate(['/imprint']);
  }

  openPrivacy() {
    this.router.navigate(['/privacy'])
  }
}
