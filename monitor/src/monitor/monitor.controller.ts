import {
  Controller,
  Get,
  CacheKey,
  CacheTTL,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { MonitorService } from './monitor.service';

@Controller('monitor')
@UseInterceptors(CacheInterceptor)
export class MonitorController {
  constructor(private servicoMonitor: MonitorService) {}

  @CacheKey('comprar')
  @CacheTTL(15 * 60)
  @Get('comprar')
  async paraCompra() {
    const resultado = await this.servicoMonitor.paraComprar();
    return resultado;
  }

  @CacheKey('comprar')
  @CacheTTL(15 * 60)
  @Get('vender')
  async paraVender() {
    const resultado = await this.servicoMonitor.paraVender();
    return resultado;
  }
}
