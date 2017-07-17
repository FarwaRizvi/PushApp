import { Component, ViewChild } from '@angular/core';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { AlertController, Platform, MenuController, Nav } from 'ionic-angular';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // make HelloIonicPage the root (or first) page
  rootPage = HelloIonicPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    private push: Push,
    public http: Http,
    public alertCtrl: AlertController,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Hello Ionic', component: HelloIonicPage },
      { title: 'My First List', component: ListPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initPushNotification();
    });
  }
  initPushNotification() {
      if (!this.platform.is('cordova')) {
        console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
        return;
      }
      const options: PushOptions = {
        android: {
          senderID: '162254372386'
        },
        ios: {
          alert: 'true',
          badge: false,
          sound: 'true'
        },
        windows: {}
      };
      const pushObject: PushObject = this.push.init(options);

      pushObject.on('registration').subscribe((data: any) => {
        alert(data.registrationId);
        //TODO - send device token to server
        this.http.get("http://host.sabaseo.com/~tempo/temsym/push.php?id="+data.registrationId)
        .subscribe((data) => {
            alert(data);
          },
          (err) => {
            alert(err);
          },
          () => {
            alert("completed");
          }
        );
      });

      pushObject.on('notification').subscribe((data: any) => {
        alert('message : ' + data.message);
        //if user using app and push notification comes
        if (data.additionalData.foreground) {
          // if application open, show popup
          let confirmAlert = this.alertCtrl.create({
            title: 'New Notification',
            message: data.message,
            buttons: [{
              text: 'Ignore',
              role: 'cancel'
            }, {
              text: 'View',
              handler: () => {
                //TODO: Your logic here
              //  this.nav.push(DetailsPage, { message: data.message });
              alert("hello page");
              }
            }]
          });
          confirmAlert.present();
        } else {
          //if user NOT using app and push notification comes
          //TODO: Your logic on click of push notification directly
          //this.nav.push(DetailsPage, { message: data.message });
          alert("hello page");
          alert('Push notification clicked');
        }
      });

      pushObject.on('error').subscribe(error => alert('Error with Push plugin:'+error));
    }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }
}
