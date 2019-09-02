import { Injectable } from '@angular/core';
import apigClientFactory from 'aws-api-gateway-client';
import { throwError } from 'rxjs';
import { CognitoService } from './cognito.service';
import { from, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private idToken: string;
  private badPath: string;
  private apiVersion = 'api/v1';

  constructor(private cognitoUtil: CognitoService) {
    this.cognitoUtil.getIdToken({
      callback: () => { },
      callbackWithParam: token => this.idToken = token
    });
  }
  private showErrorMessage(method: string, path: string, errorDetails: string) {
    console.error(`API ${method.toUpperCase()} '${path}' is not working! (${errorDetails})`);
    this.badPath = path;
  }

  get(path: string, params: any = {}): Observable<any> {
    return this.callAWSAPI(path, 'get', {}, { headers: {}, queryParams: params })
      .pipe(catchError((error) => {
        this.showErrorMessage('get', path, error.message);
        return throwError(error.error);
      }));
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.callAWSAPI(path, 'put', {}, { headers: {}, queryParams: {} }, JSON.stringify(body))
      .pipe(catchError((error) => {
        this.showErrorMessage('put', path, error.message);
        return throwError(error.error);
      }));
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.callAWSAPI(path, 'post', {}, { headers: {}, queryParams: {} }, JSON.stringify(body))
      .pipe(catchError((error) => {
        this.showErrorMessage('post', path, error.message);
        return throwError(error.error);
      }));
  }

  delete(path): Observable<any> {
    return this.callAWSAPI(path, 'delete')
      .pipe(catchError((error) => {
        this.showErrorMessage('delete', path, error.message);
        return throwError(error.error);
      }));
  }


  callAWSAPI(api, method = 'GET', pathParams = {}, additionalParams = {
    headers: {},
    queryParams: {}
  }, body = {}): Observable<any> {
    const apiRegion = environment.apiRegion;
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
      console.log('No cognito user');
      throw ({ error: 'No Cognito User' });
    }
  }

}
