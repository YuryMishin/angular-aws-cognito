import { Injectable } from '@angular/core';

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
    rules: any;
  }

  interface Window {
    envConf: GlobalConfigurations;
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

  public rules: any;

  constructor() {
    this.fillConfigurationsData(window.envConf);
  }

  private fillConfigurationsData(configuration: GlobalConfigurations): void {
    this.endpoints = {
      webBaseUrl: configuration.webBaseUrl,
      apiBaseUrl: configuration.apiBaseUrl,
    };

    this.apiRegion = configuration.apiRegion;

    this.rules = configuration.rules;

    this.cognitoRegion = configuration.cognitoRegion;
    this.cognitoPoolId = configuration.cognitoPoolId;
    this.userPoolId = configuration.userPoolId;
    this.cognitoAppClientId = configuration.cognitoAppClientId;

    this.ddbTableName = configuration.dynamodb ? configuration.dynamodb.ddbTableName : '';
    this.dynamodb_endpoint = configuration.dynamodb ? configuration.dynamodb.dynamodb_endpoint : '';
  }
}
