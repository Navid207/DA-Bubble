import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { ref, uploadBytes, getDownloadURL, Storage } from '@angular/fire/storage'; // Import für Storage


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: Auth, private firestore: Firestore, private router: Router, private storage: Storage) {}
  
  

  async saveAccountDataUser(email: string, password: string, name: string, avatarPath: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.afAuth, email, password);
      const user = userCredential.user;

      if (user) {
        
        await sendEmailVerification(user);

      
  
        await addDoc(collection(this.firestore, "users"), {
          uid: user.uid,
          name: name,
          email: email,
          avatar: avatarPath, 
          status: ""
        });
      }
    } catch (error) {
      console.error('Registrierungsfehler', error); // muss noch drin bleiben wegen fetchemail Problem.
      throw error; 
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.afAuth, provider);
      const user = userCredential.user;
  
      
      await this.saveUserData(user);
  
      return user;
    } catch (error) {
      console.error('Fehler bei der Anmeldung mit Google', error);
      throw error;
    }
  }
  
  async saveUserData(user: any) {
    await addDoc(collection(this.firestore, "users"), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,  
      status: ""
    });
  }


  async uploadAvatarImage(file: File): Promise<string> {
    const storageRef = ref(this.storage, `avatars/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
