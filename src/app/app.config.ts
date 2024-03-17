import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { HashLocationStrategy, PathLocationStrategy } from '@angular/common';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';

export const appConfig: ApplicationConfig = {
  providers: [
    {provide : PathLocationStrategy , useClass : HashLocationStrategy},
    provideRouter(routes),

    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          apiKey: "AIzaSyBLLQ_b_5POxf-rLN3iVYt9KW2ZW3LXiO0",
          authDomain: "da-bubble-np.firebaseapp.com",
          projectId: "da-bubble-np",
          storageBucket: "da-bubble-np.appspot.com",
          messagingSenderId: "702436554149",
          appId: "1:702436554149:web:0027b8cdcb7a8220eca44c",
          databaseURL:
            'https://da-bubble-np-default-rtdb.europe-west1.firebasedatabase.app',
        })
      )
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
  ],
};
