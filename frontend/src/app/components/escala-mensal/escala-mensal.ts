import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necessário para selecionar datas/serviços

// Services
import { ServidorService } from '../../services/servidor.service'; // Verifique o nome do arquivo se é .service ou apenas .ts
import { TipoServicoService } from '../../services/tipo-servico';
import { EscalaService } from '../../services/escala';

// Models
import { Servidor } from '../../models/servidor.model';
import { TipoServico } from '../../models/tipo-servico.model';
import { Escala, EscalaDTO } from '../../models/escala.model';

@Component({
  selector: 'app-escala-mensal',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './escala-mensal.html',
  styleUrl: './escala-mensal.scss'
})
export class EscalaMensalComponent implements OnInit {

  // Dados do Banco
  servidores: Servidor[] = [];
  tiposServico: TipoServico[] = [];
  escalas: Escala[] = [];

  // === MUDANÇA 1: Inicializar com a data de HOJE ===
  dataReferencia = new Date(); // Data base para o calendário
  anoAtual = this.dataReferencia.getFullYear();
  mesAtual = this.dataReferencia.getMonth();
  diasDoMes: Date[] = [];

// === CONTROLE DO MODAL ===
  modalAberto = false;
  
  // Objeto temporário para edição
  escalaSelecionada: any = {
    servidorId: null,
    nomeServidor: '',
    data: null, // Objeto Date
    tipoServicoId: null
  };

  constructor(
    private servidorService: ServidorService,
    private tipoServicoService: TipoServicoService,
    private escalaService: EscalaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gerarDiasDoMes();
    this.carregarDados();
  }

  gerarDiasDoMes() {
    this.diasDoMes = [];
    // Cria data: Ano 2025, Mês 11 (Dez), Dia 1
    const data = new Date(this.anoAtual, this.mesAtual, 1);
    
    // Enquanto estivermos no mesmo mês, adiciona o dia na lista
    while (data.getMonth() === this.mesAtual) {
      this.diasDoMes.push(new Date(data));
      data.setDate(data.getDate() + 1);
    }
  }

  // === MUDANÇA 2: Função para Navegar ===
  alterarMes(delta: number) {
    // delta será -1 (voltar) ou +1 (avançar)
    this.mesAtual += delta;

    // Ajuste de virada de ano
    if (this.mesAtual > 11) {
      this.mesAtual = 0; // Janeiro
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11; // Dezembro
      this.anoAtual--;
    }

    // Regera o calendário visual
    this.gerarDiasDoMes();
    
    // Opcional: Aqui poderíamos recarregar dados do backend se tivessmos filtro por data
    // this.carregarDados(); 
  }

  // === MUDANÇA 3: Helper para o Título ===
  // Retorna um objeto Date representando o mês que estamos vendo
  getDataVisualizacao(): Date {
    return new Date(this.anoAtual, this.mesAtual, 1);
  }

  carregarDados() {
    // 1. Carrega Servidores
    this.servidorService.listar().subscribe(dados => {
      this.servidores = dados;
      this.cdr.detectChanges();
    });

    // 2. Carrega Tipos de Serviço (A, B...)
    this.tipoServicoService.listar().subscribe(dados => {
      this.tiposServico = dados;
      this.cdr.detectChanges();
    });

    // 3. Carrega as Escalas já salvas
    this.escalaService.listar().subscribe(dados => {
      this.escalas = dados;
      this.cdr.detectChanges();
    });
  }

  // Função auxiliar: Pega o código da escala para um servidor num dia específico
  getEscala(servidorId: number | undefined, data: Date): string {
    if (!servidorId) return '';
    // Formata a data do calendário para YYYY-MM-DD (formato do Java)
    const dataStr = data.toISOString().split('T')[0];

    // Procura na lista de escalas baixadas
    const escalaEncontrada = this.escalas.find(e => 
      e.servidor.id === servidorId && e.data === dataStr
    );

    return escalaEncontrada ? escalaEncontrada.tipoServico.codigo : '-';
  }

  abrirModal(servidor: Servidor, data: Date) {
    // 1. Prepara os dados do modal
    this.escalaSelecionada = {
      servidorId: servidor.id,
      nomeServidor: servidor.nome,
      data: data,
      tipoServicoId: null // Começa vazio, ou poderíamos tentar achar o valor atual
    };

    // Tenta pré-selecionar o valor se já existir escala nesse dia
    const dataStr = data.toISOString().split('T')[0];
    const escalaExistente = this.escalas.find(e => 
      e.servidor.id === servidor.id && e.data === dataStr
    );
    
    if (escalaExistente) {
      this.escalaSelecionada.tipoServicoId = escalaExistente.tipoServico.id;
    }

    // 2. Abre a janela
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEscala() {
    if (!this.escalaSelecionada.tipoServicoId) {
      alert('Selecione um turno!');
      return;
    }

    // 1. Monta o DTO para enviar ao Java
    // Ajuste de fuso horário simples para garantir que a data vá correta (YYYY-MM-DD)
    // O trque do toISOString().split('T')[0] funciona bem para datas locais geradas sem hora
    const dataFormatada = this.escalaSelecionada.data.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD

    const dto: EscalaDTO = {
      servidorId: this.escalaSelecionada.servidorId,
      tipoServicoId: this.escalaSelecionada.tipoServicoId,
      data: dataFormatada,
      observacao: 'Inserido via Web'
    };

    // 2. Chama o serviço
    this.escalaService.salvar(dto).subscribe({
      next: (novaEscala) => {
        console.log('Salvo com sucesso!', novaEscala);
        
        // 3. Atualiza a lista localmente para refletir na tela imediatamente
        // Remove a antiga se houver (para não duplicar na lista visual)
        this.escalas = this.escalas.filter(e => 
          !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data)
        );
        // Adiciona a nova
        this.escalas.push(novaEscala);
        
        this.cdr.detectChanges(); // Força atualização visual
        this.fecharModal();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao salvar escala.');
      }
    });
  }

}