import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ServicoColetor } from './coletor.service';

@Controller('coletor')
export class ColetorController {
  constructor(private servicoColetor: ServicoColetor) {}
  @Get('situacao')
  @ApiOperation({ summary: 'Verifica se já tem uma coleta em andamento' })
  situacao(): Record<string, unknown> {
    const situacao: Record<string, unknown> = this.servicoColetor.situacao();
    return situacao;
  }

  @Get('coletar')
  @ApiOperation({ summary: 'Solicita uma nova coleta' })
  coletar(): void {
    this.servicoColetor.coletar();
  }

  @Get('todos')
  @ApiOperation({ summary: 'Recupera todos os dados coletados' })
  todos(): Record<string, unknown> {
    const dados = this.servicoColetor.todos();
    return dados;
  }
}
