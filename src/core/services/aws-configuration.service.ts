import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface GlobalConfigurations {
    webBaseUrl: string;
    apiBaseUrl: string;
    apiRegion: string;

    cognitoRegion: string;
    cognitoPoolId: string;
    userPoolId: string;
    cognitoAppClientId: string;
    dynamodb: {
      ddbTableName?: string;
      dynamodb_endpoint?: string;
    };
  }
}

@Injectable()
export class AwsConfigurationService {
  public endpoints: any;
  public apiRegion: string;

  public cognitoRegion: string;
  public cognitoPoolId: string;
  public userPoolId: string;
  public cognitoAppClientId: string;

  public ddbTableName: string;
  public dynamodb_endpoint: string;


  constructor() {
  }

  private fillConfigurationsData(configuration: GlobalConfigurations): void {

    this.apiRegion = environment.apiRegion;


    this.cognitoRegion = environment.cognitoRegion;
    this.cognitoPoolId = environment.cognitoPoolId;
    this.userPoolId = environment.userPoolId;
    this.cognitoAppClientId = environment.cognitoAppClientId;
  }
}
