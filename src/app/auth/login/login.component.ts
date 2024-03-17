import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../shared/firebase-services/auth.service';
import { UserService } from '../../shared/firebase-services/user.service';
import { PresenceService } from '../../shared/firebase-services/presence.service';
import { DataService } from '../../shared/services/data.service';
import {
  errorAnimation,
  slideOutDownAnimation,
} from '../../shared/services/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [slideOutDownAnimation, errorAnimation],
})
export class LoginComponent {
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  error = false;
  errorMessage = '';
  guestUserId: string = '5HbHapuooMJE3XJFKq12';
  showLoginCard = true;
  isGuestLogin = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private afAuth: Auth,
    private authService: AuthService,
    private userService: UserService,
    private presenceService: PresenceService,
    private dataService: DataService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Submits the login form and processes the login operation.
   * Handles guest login separately from email/password login.
   */
  async onLoginSubmit() {
    this.formSubmitted = true;
    if (this.isGuestLogin) {
      this.onGuestLogin(this.guestUserId);
    } else {
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;
        await this.loginUser(email, password);
      } else {
      }
    }
  }

  /**
   * Performs the login operation for a user with a specified email and password.
   * If successful, updates user's email in Firestore if necessary and handles successful login.
   * @param {string} email - The email address of the user attempting to log in.
   * @param {string} password - The password for the login attempt.
   */
  async loginUser(email: string, password: string) {
    try {
      const emailInLowerCase = email.toLowerCase();
      const userCredential = await signInWithEmailAndPassword(
        this.afAuth,
        emailInLowerCase,
        password
      );
      await this.authService.updateEmailInFirestoreIfNeeded(
        userCredential.user.uid,
        emailInLowerCase
      );
      this.handleSuccessfulLogin(userCredential);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles the tasks after a successful login, such as updating user status and navigating to chat.
   * @param {any} userCredential - The user credentials returned from the authentication process.
   */
  async handleSuccessfulLogin(userCredential: any) {
    if (userCredential.user && userCredential.user.emailVerified) {
      const uid = userCredential.user.uid;
      this.updateUserStatus(uid);
      const user = await this.userService.getUserByAuthUid(uid);
      if (user) {
        this.dataService.setCurrentUser(user);
        this.navigateToChat(user.id ?? '');
      } else {
        this.showError('Benutzer nicht gefunden.');
      }
    } else {
      this.showError('Bitte Account verifizieren.');
    }
  }

  /**
   * Updates the online status of the user in the application.
   * @param {string} uid - The UID of the user whose status is being updated.
   */
  async updateUserStatus(uid: string) {
    try {
      await this.presenceService.updateOnUserLogin(uid);
    } catch (error) {}
  }

  /**
   * Navigates to the chat page for the logged-in user.
   * @param {string} userId - The ID of the user to navigate to chat for.
   */
  navigateToChat(userId: string) {
    this.showLoginCard = false;
    setTimeout(() => {
      this.router.navigate([`/${userId}/new/message`]);
      this.showLoginCard = true;
    }, 800);
  }

  /**
   * Displays an error message on the UI.
   * @param {string} message - The error message to be displayed.
   */
  showError(message: string) {
    this.error = true;
    this.errorMessage = message;
    setTimeout(() => {
      this.error = false;
    }, 2000);
  }

  /**
   * Handles errors during the login process by displaying a relevant error message.
   * @param {any} error - The error object containing details about the login error.
   */
  handleError(error: any) {
    this.showError('Email oder Passwort falsch.');
  }

  /**
   * Facilitates login as a guest, including removing validators and updating presence.
   * @param {string} userId - The user ID for the guest login operation.
   */
  async onGuestLogin(userId: string): Promise<void> {
    this.isGuestLogin = true;
    this.removeValidators();

    try {
      const guestData = await this.userService.getUserByID(this.guestUserId);
      await this.presenceService.updateGuestStatus(
        't8WOIhqo9BYogI9FmZhtCHP7K3t1',
        'online'
      );
      this.presenceService.startGuestTracking();
      this.showLoginCard = false;

      setTimeout(() => {
        this.dataService.setCurrentUser(guestData!);
        this.router.navigate([`/${userId}/new/message`]);
        this.showLoginCard = true;
        this.isGuestLogin = false;
      }, 800);
    } catch (error) {
      console.error('Fehler beim Gastlogin', error);
    }
  }

  /**
   * Opens the sign-up page for new user registration.
   */
  openSignUp() {
    this.showLoginCard = false;
    setTimeout(() => {
      this.router.navigate(['/signUp']);
      this.showLoginCard = true;
    }, 800);
  }

  /**
   * Performs sign in using Google's authentication services.
   */
  async onGoogleSignIn() {
    try {
      const userCredential = await this.authService.signInWithGoogle();
      if (userCredential) {
        const uid = userCredential.uid;
        const user = await this.userService.getUserByAuthUid(uid);
        if (user) {
          this.dataService.setCurrentUser(user);
          await this.presenceService.updateOnUserLogin(uid);
          this.navigateToChat(user.id ?? '');
        } else {
          console.error('Benutzerdaten konnten nicht geladen werden.');
        }
      }
    } catch (error) {
      console.error('Fehler beim Google-Login', error);
    }
  }

  /**
   * Initiates navigation to the password reset page.
   */
  openPwReset() {
    const loginCard = document.querySelector('.login');

    loginCard?.classList.add('slide-out-down');

    setTimeout(() => {
      this.router.navigate(['/pw-reset']);
    }, 800);
  }

  /**
   * Removes validation from the email and password fields of the login form.
   */
  removeValidators() {
    this.loginForm.get('email')!.clearValidators();
    this.loginForm.get('email')!.updateValueAndValidity();
    this.loginForm.get('password')!.clearValidators();
    this.loginForm.get('password')!.updateValueAndValidity();
  }

  /**
   * Toggles the visibility of the password in the login form.
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  openImprint() {
    this.router.navigate(['/imprint']);
  }

  openPrivacy() {
    this.router.navigate(['/privacy'])
  }
}
