import { Servidor } from "./servidor.model";
import { TipoServico } from "./tipo-servico.model";

// Interface para LEITURA (O que vem do banco)
export interface Escala {
  id: number;
  data: string;           // "2025-12-28"
  servidor: Servidor;     // Objeto completo
  tipoServico: TipoServico; // Objeto completo
  observacao?: string;
  determinacao?: string;  
}

// Interface para GRAVAÇÃO (O que enviamos para salvar)
export interface EscalaDTO {
  id?: number;
  servidorId: number;     // Mandamos só o ID
  tipoServicoId: number;  // Mandamos só o ID
  data: string;
  observacao?: string;
  determinacao?: string; 
}