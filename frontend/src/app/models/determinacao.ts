export interface Determinacao {
  id?: number; // Opcional porque ao criar uma nova, o ID ainda não existe
  escala: { 
    id: number;
    data?: string; 
    tipoServico?: any; 
  }; // Mandamos apenas o ID da escala atrelada para o Java
  areaAtuacao: string; // Ex: MT01, PT, PO
  setor: string; // Ex: 2, 5, 20, NA
  instrucoes: string;
}