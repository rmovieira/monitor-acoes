import { Test, TestingModule } from '@nestjs/testing';
import { ColetorController } from './coletor.controller';

describe('ColetorController', () => {
  let controller: ColetorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColetorController],
    }).compile();

    controller = module.get<ColetorController>(ColetorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
