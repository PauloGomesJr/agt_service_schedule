export interface Servidor {
  id?: number; // O '?' indica que é opcional (na criação ainda não tem ID)
  nome: string;
  matricula: string;
  email: string;
  situacao: 'ATIVO' | 'INATIVO' | 'FERIAS' | 'LICENCA_MEDICA' | 'AFASTADO';
}