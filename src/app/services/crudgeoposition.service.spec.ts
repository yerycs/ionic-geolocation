import { TestBed } from '@angular/core/testing';

import { CrudgeopositionService } from './crudgeoposition.service';

describe('CrudgeopositionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CrudgeopositionService = TestBed.get(CrudgeopositionService);
    expect(service).toBeTruthy();
  });
});
