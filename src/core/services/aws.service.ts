import { Injectable } from '@angular/core';
import { Callback, CognitoService } from './cognito.service';
import * as AWS from 'aws-sdk/global';


// declare var AMA: any;

@Injectable()
export class AwsService {
  public static firstLogin = false;
  public static runningInit = false;

  constructor(public cognitoUtil: CognitoService) {
    AWS.config.region = CognitoService._REGION;
  }

  /**
   * This is the method that needs to be called in order to init the aws global creds
   */
  initAwsService(callback: Callback, isLoggedIn: boolean, idToken: string) {
    if (AwsService.runningInit) {
      // Need to make sure I don't get into an infinite loop here, so need to exit if this method is running already
      console.log('AwsService: Aborting running initAwsService()...it\'s running already.');
      // instead of aborting here, it's best to put a timer
      if (callback != null) {
        callback.callback();
        callback.callbackWithParam(null);
      }
      return;
    }
    AwsService.runningInit = true;
    const mythis = this;
    // First check if the user is authenticated already
    if (isLoggedIn) {
      mythis.setupAWS(isLoggedIn, callback, idToken);
    }
  }

  /**
   * Sets up the AWS global params
   *
   * @param isLoggedIn
   * @param callback
   */
  setupAWS(isLoggedIn: boolean, callback: Callback, idToken: string): void {

    if (isLoggedIn) {
      this.addCognitoCredentials(idToken);
    } else {
      console.log('AwsService: User is not logged in');
    }

    if (callback != null) {
      callback.callback();
      callback.callbackWithParam(null);
    }

    AwsService.runningInit = false;
  }

  addCognitoCredentials(idTokenJwt: string): void {
    const creds = this.cognitoUtil.buildCognitoCreds(idTokenJwt);
    AWS.config.credentials = creds;

    creds.get(function (err) {
      if (!err) {
        if (AwsService.firstLogin) {
          AwsService.firstLogin = false;
        }
      }
    });
  }


}
