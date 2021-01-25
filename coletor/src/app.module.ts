import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ColetorController } from './coletor/coletor.controller';
import { ServicoColetor } from './coletor/coletor.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ColetorController],
  providers: [ServicoColetor],
})
export class AppModule {}
