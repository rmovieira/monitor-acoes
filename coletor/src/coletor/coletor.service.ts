/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Ativo } from './ativo.interface';
import * as moment from 'moment';
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const paraNumero = function (valor: string): string {
  return valor.replace(',', '.');
};

@Injectable()
export class ServicoColetor {
  private readonly logger = new Logger(ServicoColetor.name);
  private ativos = {};
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
      await page.setUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36',
      );
      await page.goto('https://br.investing.com/equities/brazil', {
        timeout: 0,
        waitUntil: 'domcontentloaded',
      });
      // page.screenshot({ path: 'aa.png' });
      await page.click('#index-select');
      await page.click(
        '#index-select > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2)',
      );
      let bodyHandle = await page.$('body');
      let html = await page.evaluate((body) => body.innerHTML, bodyHandle);
      await bodyHandle.dispose();
      let $ = cheerio.load(html);
      let linhas = $(
        '.dynamic-table_dynamic-table__7SSn8 > tbody:nth-child(2) > tr',
      );
      linhas.each((_, tr) => {
        this.coletarCotacao(tr, $);
      });
      await page.waitForSelector(
        'table.datatable_table__D_jso:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1)',
      );
      //botao de analise tecnica
      const elements = await page.$x(
        '//*[@id="__next"]/div[2]/div/div/div[2]/main/div[3]/div[1]/div/button[3]',
      );
      await elements[0].click();
      bodyHandle = await page.$('body');
      html = await page.evaluate((body) => body.innerHTML, bodyHandle);
      await bodyHandle.dispose();
      $ = cheerio.load(html);
      linhas = $(
        '.dynamic-table_dynamic-table__7SSn8 > tbody:nth-child(2) > tr',
      );
      linhas.each((_, tr) => {
        this.coletarAnaliseTecnica(tr, $);
      });
      this.dataUltimaColeta = moment().utc(true).toDate();
    } catch (erro) {
      this.logger.error('Falha ao coletar dados dos ativos', erro);
    }
    this.logger.log('Coleta finalizada');
    this.coletando = false;
    await browser.close();
  }

  coletarAnaliseTecnica(tr: any, $: any): void {
    const ativo = new Ativo();
    const recomendacoes: Record<string, string> = {};
    tr.children.forEach(function (td, indice) {
      let valor = $(td).text();
      valor = valor.replace('\t', '').replace('\n', '').trim();
      const link = $(td).find('a');
      if (link.length && !ativo.link) {
        ativo.link = 'https://br.investing.com/equities' + link.attr('href');
      }
      if (indice === 0) {
        ativo.nome = valor;
        ativo.ticker = valor.split(' ')[0];
      }
      if (indice === 1) {
        recomendacoes.hora = valor;
      }
      if (indice === 2) {
        recomendacoes.diario = valor;
      }
      if (indice === 3) {
        recomendacoes.semanal = valor;
      }
      if (indice === 4) {
        recomendacoes.mensal = valor;
      }
    });
    ativo.setRecomendacoes(recomendacoes);
    const ativoAtual = this.ativos[ativo.ticker];
    if (!ativoAtual) {
      this.ativos[ativo.ticker] = ativo;
    } else {
      this.ativos[ativo.ticker] = ativoAtual.mesclar(ativo);
    }
  }

  coletarCotacao(tr: any, $: any): void {
    const ativo = new Ativo();
    const cotacao: Record<string, string> = {};
    tr.children.forEach(function (td, indice) {
      let valor = $(td).text();
      valor = valor.replace('\t', '').replace('\n', '').trim();
      const link = $(td).find('a');
      if (link.length && !ativo.link) {
        ativo.link = 'https://br.investing.com/equities' + link.attr('href');
      }
      if (indice === 0) {
        ativo.nome = valor;
        ativo.ticker = valor.split(' ')[0];
      }
      if (indice === 1) {
        cotacao.ultimo = paraNumero(valor);
      }
      if (indice === 2) {
        cotacao.maxima = paraNumero(valor);
      }
      if (indice === 3) {
        cotacao.minima = paraNumero(valor);
      }
      if (indice === 4) {
        cotacao.variacaoReal = paraNumero(valor);
      }
      if (indice === 5) {
        cotacao.variacaoPercent = paraNumero(valor);
      }
    });
    ativo.setCotacao(cotacao);
    const ativoAtual = this.ativos[ativo.ticker];
    if (!ativoAtual) {
      this.ativos[ativo.ticker] = ativo;
    } else {
      this.ativos[ativo.ticker] = ativoAtual.mesclar(ativo);
    }
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
      dados: Object.values(this.ativos),
    };
  }
}
