import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';

@Injectable()
@UseInterceptors(CacheInterceptor)
export class ColetorService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async ativos() {
    const resposta = await axios.get('http://localhost:3000/coletor/todos');
    if (resposta.status === 200) {
      return resposta.data;
    } else {
      throw new Error('problema ao coletar dados de ativos');
    }
  }
}
