import { TestBed } from '@angular/core/testing';

import { AwsConfigurationService } from './aws-configuration.service';

describe('AwsConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwsConfigurationService = TestBed.get(AwsConfigurationService);
    expect(service).toBeTruthy();
  });
});
