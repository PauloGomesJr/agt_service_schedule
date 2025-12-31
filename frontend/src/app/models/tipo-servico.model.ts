export interface TipoServico {
  id?: number;
  codigo: string;          // Ex: "A", "B"
  descricao: string;       // Ex: "Turno Matutino"
  horaInicio: string;      // O Java manda LocalTime como string "07:00:00"
  horaFim: string;
  horasTotais: number;
  horasNoturnas: number;
  geraAdicionalNoturno: boolean;
}
