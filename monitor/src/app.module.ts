import { Module, CacheModule } from '@nestjs/common';
import { MonitorController } from './monitor/monitor.controller';
import { MonitorService } from './monitor/monitor.service';
import { ColetorService } from './coletor/coletor.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [MonitorController],
  providers: [MonitorService, ColetorService],
})
export class AppModule {}
