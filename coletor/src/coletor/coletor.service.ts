/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ativo } from './ativo.interface';
import * as moment from 'moment';
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

@Injectable()
export class ServicoColetor {
  private readonly logger = new Logger(ServicoColetor.name);
  private ativos: Ativo[] = [];
  private coletando = false;
  private dataUltimaColeta: Date;

  async onModuleInit(): Promise<void> {
    try {
      this.coletar();
    } catch (erro) {
      this.logger.error('Falha ao executar coleta de inicialização', erro);
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'coleta',
    timeZone: 'America/Sao_Paulo',
  })
  async coletar() {
    if (this.coletando) {
      this.logger.log('já tem uma coleta rodando');
      return;
    }
    this.logger.log('Iniciando coleta');
    const opcoes = {
      headless: true,
      slowMo: 250,
    };
    const browser = await puppeteer.launch(opcoes);
    this.coletando = true;
    try {
      const page = await browser.newPage();
      await page.goto('https://br.investing.com/equities/brazil');
      page.click('#onetrust-accept-btn-handler');
      await page.focus('#filter_technical');
      await page.click('#filter_technical');
      await page.waitForSelector('table#marketsTechnical');
      await page.select('select#stocksFilter', 'Brasil: todas as ações');
      await page.waitForSelector('table#marketsTechnical');
      const bodyHandle = await page.$('body');
      const html = await page.evaluate((body) => body.innerHTML, bodyHandle);
      await bodyHandle.dispose();
      const $ = cheerio.load(html);
      const linhas = $('#marketsTechnical > tbody > tr');
      linhas.each((_, tr) => {
        const ativo = { recomendacoes: {} } as Ativo;
        $(tr)
          .children('td')
          .each(function (indice, td) {
            let valor = $(this).text();
            valor = valor.replace('\t', '').replace('\n', '').trim();
            const link = $(td).children('a');
            if (link.length && !ativo.link) {
              ativo.link =
                'https://br.investing.com/equities' + link.attr('href');
            }
            if (indice === 1) {
              ativo.nome = valor;
            }
            if (indice === 2) {
              ativo.recomendacoes.hora = valor;
            }
            if (indice === 3) {
              ativo.recomendacoes.diario = valor;
            }
            if (indice === 4) {
              ativo.recomendacoes.semanal = valor;
            }
            if (indice === 5) {
              ativo.recomendacoes.mensal = valor;
            }
          });
        this.ativos.push(ativo);
      });
      this.dataUltimaColeta = moment().utc(true).toDate();
    } catch (erro) {
      this.logger.error('Falha ao coletar dados dos ativos', erro);
    }
    this.logger.log('Coleta finalizada');
    this.coletando = false;
    await browser.close();
  }

  situacao(): Record<string, unknown> {
    return {
      ultimaColeta: this.dataUltimaColeta,
      situacao: this.coletando ? 'COLETANDO' : 'OCIOSO',
    };
  }

  todos(): Record<string, unknown> {
    if (!this.dataUltimaColeta) {
      this.coletar();
    }
    return {
      dataColeta: this.dataUltimaColeta,
      dados: this.ativos,
    };
  }
}
