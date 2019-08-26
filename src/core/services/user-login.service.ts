import { Injectable } from '@angular/core';
import {
  CognitoCallback,
  CognitoService,
  LoggedInCallback
} from './cognito.service';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
import STS from 'aws-sdk/clients/sts';
import { WhoamiService } from './whoami.service';
import { SnackBarWindowService } from './snackbar.service';

@Injectable()
export class UserLoginService {
  private onLoginSuccess = (
    callback: CognitoCallback,
    session: CognitoUserSession
  ) => {
    AWS.config.credentials = this.cognitoUtil.buildCognitoCreds(
      session.getIdToken().getJwtToken()
    );

    const clientParams: any = {};
    const sts = new STS(clientParams);
    sts.getCallerIdentity(function(err, data) {
      callback.cognitoCallback(null, session);
    });
  }

  private onLoginError = (callback: CognitoCallback, err) => {
    this.snackBar.error(err.message);
    callback.cognitoCallback(err.message, null);
  }

  constructor(
    public cognitoUtil: CognitoService,
    public whoamiService: WhoamiService,
    public snackBar: SnackBarWindowService,
  ) {}

  authenticate(username: string, password: string, callback: CognitoCallback) {
    const authenticationData = {
      Username: username,
      Password: password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: username,
      Pool: this.cognitoUtil.getUserPool()
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: result => this.onLoginSuccess(callback, result),
      onFailure: err => this.onLoginError(callback, err),
      newPasswordRequired: (userAttributes, requiredAttributes) =>
        cognitoUser.completeNewPasswordChallenge(  // Here we escape change password
          authenticationData.Password,
          requiredAttributes,
          {
            onSuccess(result) {
              callback.cognitoCallback(
                `completeNewPasswordChallenge have a good result`,
                null
              );
            },
            onFailure(error) {
              callback.cognitoCallback(
                `completeNewPasswordChallenge have errors` + error,
                null
              );
            }
          }
        )
    });
  }

  logout() {
    localStorage.clear();
    const cognitoUser = this.cognitoUtil.getCurrentUser();
    if (cognitoUser != null) {
      this.cognitoUtil.getCurrentUser().signOut();
    }
  }

  isAuthenticated(callback: LoggedInCallback): boolean {
    if (!callback) {
      return false;
    }

    const cognitoUser = this.cognitoUtil.getCurrentUser();
    if (cognitoUser != null) {

      this.whoamiService.getUser().subscribe((data) => {
        this.whoamiService.currentUserSubject.next(data);
      });

      cognitoUser.getSession(function(err, session) {
        if (err) {
          callback.isLoggedIn(err, false);
          return false;
        } else {
          callback.isLoggedIn(err, session.isValid());
          return session.isValid();
        }
      });
    } else {
      callback.isLoggedIn('Can\'t retrieve the CurrentUser', false);
      return false;
    }
  }
}
