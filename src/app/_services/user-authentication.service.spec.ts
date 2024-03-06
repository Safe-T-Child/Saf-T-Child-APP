import { TestBed } from '@angular/core/testing';

import { UserAuthenticationService } from './user-authentication.service';
import { TestingModule } from '../testing.module';

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestingModule] });
    service = TestBed.inject(UserAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
