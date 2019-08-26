import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { ApiService } from './services/api.service';
import { CognitoService } from './services/cognito.service';
import { AwsConfigurationService } from './services/aws-configuration.service';
import { AwsService } from './services/aws.service';
import { AuthGuardService } from './services/auth-guard.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  providers: [ApiService, CognitoService, AwsConfigurationService, AwsService, AuthGuardService]
})
export class CoreModule {
}
