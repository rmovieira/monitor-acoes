import { Test, TestingModule } from '@nestjs/testing';
import { ServicoColetor } from './coletor.service';

describe('ColetorService', () => {
  let service: ServicoColetor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicoColetor],
    }).compile();

    service = module.get<ServicoColetor>(ServicoColetor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
