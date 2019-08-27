import { Injectable } from '@angular/core';
import { AwsConfigurationService } from './aws-configuration.service';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
import * as awsservice from 'aws-sdk/lib/service';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';

export interface CognitoCallback {
  cognitoCallback(message: string, result: any): void;

  handleMFAStep?(
    challengeName: string,
    challengeParameters: ChallengeParameters,
    callback: (confirmationCode: string) => any
  ): void;
}

export interface LoggedInCallback {
  isLoggedIn(message: string, loggedIn: boolean): void;
}

export interface ChallengeParameters {
  CODE_DELIVERY_DELIVERY_MEDIUM: string;

  CODE_DELIVERY_DESTINATION: string;
}

export interface Callback {
  callback(): void;

  callbackWithParam(result: any): void;
}

@Injectable()
export class CognitoService {
  public static _REGION;
  public static _IDENTITY_POOL_ID;
  public static _USER_POOL_ID;
  public static _CLIENT_ID;
  public static _POOL_DATA;

  constructor(private awsConfig: AwsConfigurationService) {
    CognitoService._REGION = this.awsConfig.cognitoRegion;
    CognitoService._USER_POOL_ID = this.awsConfig.cognitoPoolId;
    CognitoService._CLIENT_ID = this.awsConfig.cognitoAppClientId;

    CognitoService._POOL_DATA = {
      UserPoolId: CognitoService._USER_POOL_ID,
      ClientId: CognitoService._CLIENT_ID
    };
  }

  public cognitoCreds: AWS.CognitoIdentityCredentials;

  getUserPool() {
    return new CognitoUserPool(CognitoService._POOL_DATA);
  }

  getCurrentUser() {
    return this.getUserPool().getCurrentUser();
  }


  setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
    this.cognitoCreds = creds;
  }

  getCognitoCreds() {
    return this.cognitoCreds;
  }

  buildCognitoCreds(idTokenJwt: string) {
    const url =
      'cognito-idp.' +
      CognitoService._REGION.toLowerCase() +
      '.amazonaws.com/' +
      CognitoService._USER_POOL_ID;
    const logins: CognitoIdentity.LoginsMap = {};
    logins[url] = idTokenJwt;
    const params = {
      IdentityPoolId: CognitoService._IDENTITY_POOL_ID /* required */,
      Logins: logins
    };
    const serviceConfigs = <awsservice.ServiceConfigurationOptions>{};
    const creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
    this.setCognitoCreds(creds);
    return creds;
  }

  getCognitoIdentity(): string {
    return this.cognitoCreds.identityId;
  }

  getAccessToken(callback: Callback): void {
    if (callback == null) {
      throw new Error(
        'CognitoService: callback in getAccessToken is null...returning'
      );
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession(function (err, session) {
        if (err) {
          console.log('CognitoService: Can\'t set the credentials:' + err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getAccessToken().getJwtToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  getIdToken(callback: Callback): void {
    if (callback == null) {
      throw new Error(
        'CognitoService: callback in getIdToken is null...returning'
      );
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession(function (err, session) {
        if (err) {
          console.log('CognitoService: Can\'t set the credentials:' + err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getIdToken().getJwtToken());
          } else {
            console.log(
              'CognitoService: Got the id token, but the session isn\'t valid'
            );
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  getRefreshToken(callback: Callback): void {
    if (callback == null) {
      throw new Error(
        'CognitoService: callback in getRefreshToken is null...returning'
      );
    }
    if (this.getCurrentUser() != null) {
      this.getCurrentUser().getSession(function (err, session) {
        if (err) {
          console.log('CognitoService: Can\'t set the credentials:' + err);
          callback.callbackWithParam(null);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getRefreshToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(null);
    }
  }

  refresh(): void {
    this.getCurrentUser().getSession(function (err, session) {
      if (err) {
        console.log('CognitoService: Can\'t set the credentials:' + err);
      } else {
        if (session.isValid()) {
          console.log('CognitoService: refreshed successfully');
        } else {
          console.log('CognitoService: refreshed but session is still not valid');
        }
      }
    });
  }
}
