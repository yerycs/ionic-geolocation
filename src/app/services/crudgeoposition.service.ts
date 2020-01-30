import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TaskI } from '../model/task.interface';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private GPSGeoLocationCollection: AngularFirestoreCollection<TaskI>;
  GPSGeoLocations: Observable<TaskI[]>;
    
  constructor(
    private db: AngularFirestore
  ) { 
    this.GPSGeoLocationCollection = db.collection<TaskI>('GPSGeoLocations');
    this.GPSGeoLocations = this.GPSGeoLocationCollection.valueChanges();
  }
  
  setID(UserID: string) {
    const PosLat = '';
    const PosLng = '';
    const counter = 0;
    const User: TaskI = {UserID, PosLat, PosLng, counter};
    this.GPSGeoLocationCollection.doc(UserID).set(User);
  }

  getGPSGeoLocations() {
    return this.GPSGeoLocations;
  }

  getGPSGeoLocation(id: string) {
    return this.GPSGeoLocationCollection.doc<TaskI>(id).valueChanges();
  }

  updateGPSGeoLocation(GPSGeoLocation: TaskI, id: string) {
    return this.GPSGeoLocationCollection.doc(id).update(GPSGeoLocation);
  }

  addGPSGeoLocation(GPSGeoLocation: TaskI) {
    return this.GPSGeoLocationCollection.add(GPSGeoLocation);
  }

  removeGPSLocation(id: string) {
    return this.GPSGeoLocationCollection.doc(id).delete();
  }
}