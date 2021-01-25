export interface Ativo {
  nome: string;
  link: string;
  recomendacoes: {
    hora: string;
    diario: string;
    semanal: string;
    mensal: string;
  };
}
