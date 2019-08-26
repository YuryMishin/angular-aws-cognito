import { Injectable } from '@angular/core';
import { AwsConfigurationService } from './aws-configuration.service';
import apigClientFactory from 'aws-api-gateway-client';
import { _throw } from 'rxjs/observable/throw';
import { CognitoService } from './cognito.service';
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private idToken: string;
  private badPath: string;
  private apiVersion = 'api/v1';

  constructor(private awsConfig: AwsConfigurationService,
              private cognitoUtil: CognitoService) {
    this.cognitoUtil.getIdToken({
      callback: () => { },
      callbackWithParam: token => this.idToken = token
    });
  }
  private showErrorMessage(method: string, path: string, errorDetails: string) {
    this.snackBar.error(`API ${method.toUpperCase()} '${path}' is not working! (${errorDetails})`);
    this.badPath = path;
  }

  get(path: string, params: any = {}): Observable<any> {
    return this.callAWSAPI(path, 'get', {}, { headers: {}, queryParams: params })
      .pipe(catchError((error) => {
        this.showErrorMessage('get', path, error.message);
        return _throw(error.error);
      }));
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.callAWSAPI(path, 'put', {}, { headers: {}, queryParams: {} }, JSON.stringify(body))
      .pipe(catchError((error) => {
        this.showErrorMessage('put', path, error.message);
        return _throw(error.error);
      }));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.callAWSAPI(path, 'post', {}, { headers: {}, queryParams: {} }, JSON.stringify(body))
      .pipe(catchError((error) => {
        this.showErrorMessage('post', path, error.message);
        return _throw(error.error);
      }));
  }

  delete(path): Observable<any> {
    return this.callAWSAPI(path, 'delete')
      .pipe(catchError((error) => {
        this.showErrorMessage('delete', path, error.message);
        return throw(error.error);
      }));
  }


  callAWSAPI(api, method = 'GET', pathParams = {}, additionalParams = {
    headers: {},
    queryParams: {}
  }, body = {}): Observable<any> {
    const apiRegion = this.awsConfig.apiRegion;
    const apiURL = `${this.awsConfig.endpoints.apiBaseUrl}/${this.apiVersion}`;
    const idToken = this.idToken;
    const cognitoGetUser = this.cognitoUtil.getCurrentUser();

    function cleanParams(params) {
      params = Object.assign({ queryParams: {}, headers: { Authorization: idToken } }, params);
      Object.keys(params.queryParams).forEach((v) => {
        params.queryParams[v] = encodeURIComponent(params.queryParams[v])
          .replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16);
          });
      });
      params.headers.Authorization = idToken;
      return params;
    }
    if (cognitoGetUser != null) {
      additionalParams = cleanParams(additionalParams);
      const apigClient = apigClientFactory.newClient({
        invokeUrl: apiURL,
        region: apiRegion
      });

      return from(apigClient.invokeApi(pathParams, api, method, additionalParams, body).then(response => {
        return response.data;
      }).catch(error => {
        if (error.request && error.request.status === 401) {
          this.cognitoUtil.refresh();
        } else {
          throw (error);
        }
      }));
    } else {
      console.log('no cognito user');
      throw ({ error: 'No Cognito User' });
    }
  }

}
