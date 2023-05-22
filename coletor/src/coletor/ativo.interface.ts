export class Ativo {
  nome: string;
  ticker: string;
  link: string;
  private recomendacoes: Record<string, string>;
  private cotacao: Record<string, string>;
  constructor() {
    // this.cotacao = {};
    // this.recomendacoes = {};
  }
  setRecomendacoes(recomendacoes: any): void {
    this.recomendacoes = recomendacoes;
  }
  setCotacao(cotacao: any): void {
    this.cotacao = cotacao;
  }
  mesclar(ativo: Ativo): Ativo {
    return { ...this, ...ativo };
  }
}
