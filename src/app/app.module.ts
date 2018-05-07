import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import {ParkopolyService} from './providers/parkopoly';
import {FirebaseService} from './providers/firebase';
import {environement} from './environement/environnement';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatAutocompleteModule, MatDividerModule, MatIconModule, MatListModule, MatSidenavModule, MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environement.firebase),
    AngularFireDatabaseModule,
    NoopAnimationsModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatSidenavModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule
  ],
  providers: [ParkopolyService, FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule  {


}
