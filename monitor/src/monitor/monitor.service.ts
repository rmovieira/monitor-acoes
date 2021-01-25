import { Injectable, Inject, CACHE_MANAGER, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ColetorService } from 'src/coletor/coletor.service';

@Injectable()
export class MonitorService {
  constructor(
    private coletor: ColetorService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async paraComprar() {
    Logger.log('entrou');
    const paraComprar = [];
    let ultimaColeta;
    try {
      const resultado = await this.coletor.ativos();
      const { dados, dataColeta } = resultado;
      ultimaColeta = dataColeta;

      if (!dados) {
        return { ativos: paraComprar, ultimaColeta };
      }
      dados.forEach((ativo) => {
        const { recomendacoes } = ativo;
        const comprarHora = recomendacoes.hora.toLowerCase() === 'compra forte';
        const comprarDiario =
          recomendacoes.diario.toLowerCase() === 'compra forte';
        const comprarSemanal =
          recomendacoes.semanal.toLowerCase() === 'compra forte';
        if (comprarHora && comprarDiario && comprarSemanal) {
          paraComprar.push(ativo);
        }
      });

      await this.cacheManager.set('key', { ativos: paraComprar, ultimaColeta });
    } catch (erro) {
      console.error(erro);
    }
    return { ativos: paraComprar, ultimaColeta };
  }

  async paraVender() {
    const paraVender = [];
    let ultimaColeta;
    try {
      const resultado = await this.coletor.ativos();
      const { dados, dataColeta } = resultado;
      ultimaColeta = dataColeta;

      if (!dados) {
        return { ativos: paraVender, ultimaColeta };
      }
      dados.forEach((ativo) => {
        const { recomendacoes } = ativo;
        const comprarHora = recomendacoes.hora.toLowerCase() === 'venda forte';
        const comprarDiario =
          recomendacoes.diario.toLowerCase() === 'venda forte';
        const comprarSemanal =
          recomendacoes.semanal.toLowerCase() === 'venda forte';
        if (comprarHora && comprarDiario && comprarSemanal) {
          paraVender.push(ativo);
        }
      });
    } catch (erro) {
      console.error(erro);
    }
    return { ativos: paraVender, ultimaColeta };
  }
}
