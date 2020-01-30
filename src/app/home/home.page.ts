import { Component, AfterViewChecked, ElementRef, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { AlertController, Platform, NavController } from '@ionic/angular';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AuthenticateService } from '../services/authentication.service';
import { CrudService } from '../services/crudgeoposition.service';
import { TaskI } from '../model/task.interface';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
userLocation: any;
lat: number;
lng: number;
userAddress: (string) = "";
currentPosition:any;
gpsflg  = false;

UserName: string;
GPSGeoLocations: TaskI[];
GPSGeoLocation: TaskI = {
  UserID: '',
  PosLat: '',
  PosLng: '',
  counter: 0
};

Users: any;
UserID: string;
PosLat: string;
PosLng: string;

timeIdfg: any;
timeIdbg: any;
// @ViewChild('map', { static: true }) mapElement: ElementRef;
//   map: any;
//   mapOptions: any;
//   markerOptions: any = {position: null, map: null, title: null};
//   marker: any;
//   apiKey: any = 'AIzaSyAP_Xy-1QSclKYAvxSmAZO2BuFAWWAlOZQ'; /*Your API Key*/
//   setInterval: any;

  constructor(
    private plt: Platform,
    public backgroundMode: BackgroundMode,

    private alertCtrl: AlertController,
    public geolocation: Geolocation,
    public nativeGeocoder: NativeGeocoder,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private localnotification: LocalNotifications,
    private navCtrl: NavController,
    private authService: AuthenticateService,
    private crudService: CrudService,
    public localstorage: NativeStorage,
    public zone: NgZone
   ) {
    this.plt.ready().then((res) => {
      if(this.authService.userDetails()){
        // this.UserName = this.authService.userDetails().email;
        this.localstorage.getItem('userName_localStorage')
        .then(u => {
          this.UserName = u;
          console.log(this.UserName);
        }, error=> console.log(error)
        );
      }else{
        this.navCtrl.navigateBack('');
      }

      // this.backgroundMode.on('activate').subscribe(() => {
      //   console.log('activated');
      // });

      // this.backgroundMode.enable();
      this.backgroundMode.enable();


      this.checkGPSPermission();
      
    }); 
  }

  
  async presentAlert(location) {
    const alert = await this.alertCtrl.create({
      header: 'Current Position Here!',
      subHeader: 'Check Now',
      message: location,
      buttons: ['OK']
    });

    await alert.present();
  }
  //Check if application having GPS access permission  
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
 
          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {
 
          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.gpsflg = true;
        // this.getGeoencoder()
        // this.Interval_Display();
        // const googleMaps = await getGoogleMaps(
        //   'AIzaSyB8pf6ZdFQj5qw7rc_HSGrhUwQKfIe9ICw'
        // );
        // this.LoadMap();
        // this.Interval_Display();
        this.startTrackingLocation();

      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
  }
  

  Interval_Display_fg() {
     this.timeIdfg = setInterval(() => {
      this.getGeoencoder();
    }, 10000);
  }

  Interval_Display_bg() {
    this.timeIdbg = setInterval(() => {
     this.getGeoencoder();
   }, 10000);
 }

  getGeoencoder(){
    let options: NativeGeocoderOptions = {
      useLocale: true,  
      maxResults: 5
    };

    this.geolocation.getCurrentPosition().then(resp => {
      this.GPSGeoLocation.UserID = this.UserName;
      this.GPSGeoLocation.counter++;
      this.GPSGeoLocation.PosLat = resp.coords.latitude.toString();
      this.GPSGeoLocation.PosLng = resp.coords.longitude.toString();
      this.local_notification();   

      this.crudService.updateGPSGeoLocation(this.GPSGeoLocation, this.GPSGeoLocation.UserID);
      console.log(this.GPSGeoLocation);
      // this.presentAlert(this.geolocation);

    });
  }

  local_notification() {
    // this.presentAlert(this.currentPosition);
    this.localnotification.schedule({
      id:1,
      title: 'Attention',
      text: "My Notification" + JSON.stringify(this.GPSGeoLocation),
    });
  }

  startTrackingLocation() {

    console.log('Start geotracking');

    console.log('Is background mode active: ',this.backgroundMode.isActive());
    this.backgroundMode.isActive() === true?this.trackGeoBackground():this.trackGeoForeground();
    this.backgroundMode.on('activate').subscribe(() => {
      console.log('ACTIVATE background mode');
          this.backgroundMode.disableWebViewOptimizations();
          // this.backgroundMode.disableBatteryOptimizations(); // <- HERE
        this.stopTrackingGeoForeground();
        this.trackGeoBackground();
    });
    this.backgroundMode.on('deactivate').subscribe(() => {
        this.stopTrackingGeoBackground();
        this.trackGeoForeground();
    });
  }
  
  trackGeoBackground() {

    if (this.timeIdfg) {
      clearInterval(this.timeIdfg);
    }
    this.Interval_Display_bg();
  }
  
  trackGeoForeground() {
    this.backgroundMode.disable();

    if (this.timeIdbg) {
      clearInterval(this.timeIdbg);
    }
    this.Interval_Display_fg();
  }

  stopTrackingGeoForeground() {
    if (this.timeIdfg) {
      clearInterval(this.timeIdfg);
    }
  }

  stopTrackingGeoBackground() {
    if (this.timeIdbg) {
      clearInterval(this.timeIdbg);
    }
  }

  logout(){
    this.authService.logoutUser()
    .then(res => {
      console.log(res);
      // this.crudService.removeGPSLocation(this.UserName);
      // clearInterval(this.setInterval);
      this.navCtrl.navigateBack('');
    })
    .catch(error => {
      console.log(error);
    })
  }

 
}



