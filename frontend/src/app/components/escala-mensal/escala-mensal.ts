import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// Services
import { ServidorService } from '../../services/servidor.service'; 
import { TipoServicoService } from '../../services/tipo-servico';
import { EscalaService } from '../../services/escala';

// Models
import { Servidor } from '../../models/servidor.model';
import { TipoServico } from '../../models/tipo-servico.model';
import { Escala, EscalaDTO } from '../../models/escala.model';

// === IMPORTAÇÕES NOVAS PARA O PDF ===
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // Lista original (para cálculos e lógica)
  escalas: Escala[] = []; 
  
  // Mapa visual: { idServidor: { dia: 'A', dia2: 'F' } }
  mapaEscalas: any = {}; 

  dataReferencia = new Date(); 
  anoAtual = this.dataReferencia.getFullYear();
  mesAtual = this.dataReferencia.getMonth();
  diasDoMes: Date[] = [];

  modalAberto = false;
  
  // === VARIÁVEIS DA PERMUTA ===
  modoPermuta = false;
  escalaOrigemPermuta: any = null;
  dataInicioSemana: string = '';

  escalaSelecionada: any = {
    id: null, // <--- CAMPO NOVO: Para saber qual excluir
    servidorId: null,
    nomeServidor: '',
    data: null, 
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
    const data = new Date(this.anoAtual, this.mesAtual, 1);
    while (data.getMonth() === this.mesAtual) {
      this.diasDoMes.push(new Date(data));
      data.setDate(data.getDate() + 1);
    }
  }

  alterarMes(delta: number) {
    this.mesAtual += delta;

    if (this.mesAtual > 11) {
      this.mesAtual = 0; 
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11; 
      this.anoAtual--;
    }

    this.gerarDiasDoMes();
    this.atualizarMapaVisualizacao(); // Recalcula o mapa para o novo mês
  }

  getDataVisualizacao(): Date {
    return new Date(this.anoAtual, this.mesAtual, 1);
  }

  carregarDados() {
    this.servidorService.listar().subscribe(dados => {
      this.servidores = dados.filter(s => s.situacao === 'ATIVO');
      this.cdr.detectChanges();
    });

    this.tipoServicoService.listar().subscribe(dados => {
      this.tiposServico = dados;
      this.cdr.detectChanges();
    });

    this.escalaService.listar().subscribe(dados => {
      this.escalas = dados;
      this.atualizarMapaVisualizacao();
      this.cdr.detectChanges();
    });
  }

  atualizarMapaVisualizacao() {
    this.mapaEscalas = {}; 

    this.escalas.forEach(escala => {
        const partes = escala.data.split('-'); 
        
        const anoEscala = parseInt(partes[0]);        
        const mesEscala = parseInt(partes[1]) - 1;    
        const dia = parseInt(partes[2]);              

        if (anoEscala === this.anoAtual && mesEscala === this.mesAtual) {
            
            const idServidor = escala.servidor.id;
            
            if (idServidor) {
                if (!this.mapaEscalas[idServidor]) {
                    this.mapaEscalas[idServidor] = {};
                }
                this.mapaEscalas[idServidor][dia] = escala.tipoServico.codigo;
            }
        }
    });
    console.log(`Mapa reconstruído para o mês ${this.mesAtual + 1}/${this.anoAtual}`);
  }

  calcularTotalHoras(servidorId: number | undefined): number {
    if (!servidorId) return 0;
    const escalasDoMes = this.escalas.filter(e => {
      if (e.servidor.id !== servidorId) return false;
      const partesData = e.data.split('-'); 
      const anoEscala = parseInt(partesData[0]);
      const mesEscala = parseInt(partesData[1]) - 1; 
      return anoEscala === this.anoAtual && mesEscala === this.mesAtual;
    });
    return escalasDoMes.reduce((total, escala) => total + escala.tipoServico.horasTotais, 0);
  }

 abrirModal(servidor: Servidor, data: Date) {
    const dataStr = data.toISOString().split('T')[0];
    const escalaExistente = this.escalas.find(e => 
      e.servidor.id === servidor.id && e.data === dataStr
    );

    // === INTERCEPTADOR DE PERMUTA ===
    // Se o botão permutar foi clicado antes, o próximo clique cai aqui!
    if (this.modoPermuta) {
      if (!escalaExistente) {
        alert('Para permutar, clique em um plantão que já tenha sido marcado (célula colorida).');
        return;
      }
      if (escalaExistente.id === this.escalaOrigemPermuta.id) {
        alert('Você não pode permutar um plantão com ele mesmo.');
        return;
      }
      
      // Executa a troca
      this.executarPermuta(escalaExistente.id, servidor.nomeGuerra || servidor.nome.split(' ')[0], data);
      return; // Para a execução aqui, não abre o modal normal.
    }

    // === FLUXO NORMAL (Se não estiver em permuta, abre o modal) ===
    this.escalaSelecionada = {
      id: null,
      servidorId: servidor.id,
      nomeServidor: servidor.nome,
      data: data,
      tipoServicoId: null 
    };
    
    if (escalaExistente) {
      this.escalaSelecionada.id = escalaExistente.id; 
      this.escalaSelecionada.tipoServicoId = escalaExistente.tipoServico.id;
    }
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

    const dataFormatada = this.escalaSelecionada.data.toLocaleDateString('en-CA'); 

    const dto: EscalaDTO = {
      servidorId: this.escalaSelecionada.servidorId,
      tipoServicoId: this.escalaSelecionada.tipoServicoId,
      data: dataFormatada,
      observacao: 'Inserido via Web'
    };

    this.escalaService.salvar(dto).subscribe({
      next: (novaEscala) => {
        // Atualiza a LISTA (Remove antigo se houver e põe o novo)
        this.escalas = this.escalas.filter(e => 
          !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data)
        );
        this.escalas.push(novaEscala);
        
        this.atualizarMapaVisualizacao();
        this.cdr.detectChanges(); 
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro detalhado:', err);
        let mensagem = 'Erro ao salvar escala.';
        if (err.error && err.error.message) {
             mensagem = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
             mensagem = err.error;
        }
        alert('⚠️ Não foi possível salvar:\n' + mensagem);
      }
    });
  }

  // === NOVO MÉTODO: EXCLUIR ===
  excluirEscala() {
    // Só exclui se tiver ID
    if (!this.escalaSelecionada.id) return;

    if (confirm('Tem certeza que deseja remover esta escala?')) {
      this.escalaService.excluir(this.escalaSelecionada.id).subscribe({
        next: () => {
          // 1. Remove da lista local (memória)
          this.escalas = this.escalas.filter(e => e.id !== this.escalaSelecionada.id);
          
          // === A CORREÇÃO ESTÁ AQUI ===
          // PRIMEIRO: Fecha o modal (Define modalAberto = false)
          this.fecharModal(); 

          // SEGUNDO: Atualiza o visual (tira a cor da célula)
          this.atualizarMapaVisualizacao();

          // TERCEIRO: Manda o Angular aplicar as mudanças na tela
          // Como a variável modalAberto já é false, ele vai remover o modal da tela agora.
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert('Erro ao excluir escala.');
        }
      });
    }
  }

  // === MÉTODOS DE PERMUTA ===
  iniciarPermuta() {
    this.modoPermuta = true;
    // Guarda os dados de quem vai ceder o plantão
    this.escalaOrigemPermuta = { ...this.escalaSelecionada };
    this.fecharModal(); // Fecha o modal para o usuário poder clicar no destino
  }

  cancelarPermuta() {
    this.modoPermuta = false;
    this.escalaOrigemPermuta = null;
  }

  executarPermuta(destinoId: number, nomeDestino: string, dataDestino: Date) {
    const dataOrigemStr = this.escalaOrigemPermuta.data.toLocaleDateString('pt-BR');
    const dataDestStr = dataDestino.toLocaleDateString('pt-BR');

    const msg = `Confirma a TROCA DE PLANTÕES?\n\nSAI: ${this.escalaOrigemPermuta.nomeServidor} (${dataOrigemStr})\nENTRA: ${nomeDestino} (${dataDestStr})`;

    if (confirm(msg)) {
      this.escalaService.permutar(this.escalaOrigemPermuta.id, destinoId).subscribe({
        next: () => {
          // Atualiza as listas locais para refletir a troca sem precisar recarregar a página
          const esc1 = this.escalas.find(e => e.id === this.escalaOrigemPermuta.id);
          const esc2 = this.escalas.find(e => e.id === destinoId);
          
          if (esc1 && esc2) {
              const tempServidor = esc1.servidor;
              esc1.servidor = esc2.servidor;
              esc2.servidor = tempServidor;
          }

          this.cancelarPermuta();
          this.atualizarMapaVisualizacao();
          this.cdr.detectChanges();
          alert('Permuta realizada com sucesso!');
        },
        error: (err) => {
          console.error('Erro detalhado:', err);
          let mensagem = 'Erro interno ao realizar permuta.';
          
          if (err && err.error && err.error.message) {
               mensagem = err.error.message;
          } else if (err && err.error && typeof err.error === 'string') {
               mensagem = err.error;
          }
          
          alert('⚠️ Permuta Recusada:\n' + mensagem);
          this.cancelarPermuta(); // Tira o modo amarelo se der erro
        }
      });
    }
  }

  // === NOVO MÉTODO: GERAR PDF ===
  gerarPDF() {
    // 1. Cria o documento PDF
    // 'l' = landscape (paisagem), 'mm' = milímetros, 'a4' = tamanho do papel
    const doc = new jsPDF('l', 'mm', 'a4');

    // 2. Título do Documento
    const mesFormatado = this.getDataVisualizacao().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    doc.setFontSize(18);
    doc.text(`Escala de Serviço - ${mesFormatado.toUpperCase()}`, 15, 15);

    // 3. Gera a tabela a partir do HTML
    autoTable(doc, {
      html: '#tabela-escala', // Vamos adicionar esse ID no HTML agora!
      startY: 25,             // Começa um pouco abaixo do título
      theme: 'grid',          // Estilo de grade (linhas pretas)
      styles: {
        fontSize: 7,          // Fonte pequena para caber os 31 dias
        cellPadding: 1,       // Pouco espaço interno para economizar papel
        halign: 'center',     // Centraliza o texto
        valign: 'middle'      // Centraliza verticalmente
      },
      headStyles: {
        fillColor: [52, 73, 94], // Cor do cabeçalho (Azul Escuro)
        textColor: 255           // Texto branco
      },
      // Pinta as células de acordo com o texto (A, B, C, F)
      didParseCell: (data) => {
        //const texto = data.cell.raw as string; // Pega o conteúdo(html inteiro) da célula
        const texto = data.cell.text.join(''); // Pega o conteúdo(texto) da célula
        // Se for célula de corpo (não cabeçalho)
        if (data.section === 'body' && data.column.index > 0) { // Ignora coluna 0 (Nome)
            if (texto.includes('F')) {
                data.cell.styles.fillColor = [255, 235, 59]; // Amarelo (Férias/Folga)
            } else if (texto.includes('C')) {
                data.cell.styles.fillColor = [41, 128, 185]; // Azul (Noite)
                data.cell.styles.textColor = 255;
            } else if (texto.includes('A')) {
                data.cell.styles.fillColor = [46, 204, 113]; // Verde (Manhã)
            }
        }
      }
    });

    // 4. Salva o arquivo
    doc.save(`Escala_${mesFormatado}.pdf`);
  }

  // === NOVO MÉTODO: RELATÓRIO SEMANAL CUSTOMIZADO ===
  gerarPDFSemanal() {
    // 1. Verifica se o usuário escolheu uma data
    if (!this.dataInicioSemana) {
        alert('Por favor, escolha uma data de início no calendário ao lado do botão.');
        return;
    }

    // 2. Converte a data string (YYYY-MM-DD) para Objeto Date de forma segura (sem bugar o fuso horário)
    const partes = this.dataInicioSemana.split('-');
    const dataInicio = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    // 3. Avisa se não for sábado, mas permite continuar se o usuário quiser
    if (dataInicio.getDay() !== 6) { // 6 = Sábado
        const confirma = confirm('A data escolhida não é um Sábado. Deseja gerar os 7 dias a partir deste dia mesmo assim?');
        if (!confirma) return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 4. Monta o array com os 7 dias consecutivos
    const diasDaSemana: Date[] = [];
    for (let j = 0; j < 7; j++) {
        const dia = new Date(dataInicio);
        dia.setDate(dataInicio.getDate() + j);
        diasDaSemana.push(dia);
    }

    // Textos para o título
    const inicioStr = diasDaSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fimStr = diasDaSemana[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    doc.setFontSize(14);
    doc.text(`Escala Semanal: ${inicioStr} a ${fimStr}`, 105, 20, { align: 'center' });

    // 5. Cabeçalho da Tabela
    const headRow = ['Servidor', ...diasDaSemana.map(d => 
        `${d.getDate()}/${(d.getMonth()+1).toString().padStart(2,'0')} (${d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)})`
    )];

    // 6. Corpo da Tabela
    const bodyRows = this.servidores.map(servidor => {
        const nomeExibicao = servidor.nomeGuerra || servidor.nome.split(' ')[0];
        
        const turnosSemana = diasDaSemana.map(dia => {
            // O PULO DO GATO: Busca direto no array original de escalas ("this.escalas").
            // Isso permite que a semana comece em Fevereiro e termine em Março sem perder dados.
            const dataFormatada = dia.toLocaleDateString('en-CA'); // Fica "YYYY-MM-DD"
            const escalaEncontrada = this.escalas.find(e => e.servidor.id === servidor.id && e.data === dataFormatada);
            
            return escalaEncontrada ? escalaEncontrada.tipoServico.codigo : '';
        });

        return [nomeExibicao, ...turnosSemana];
    });

    // 7. Desenha a Tabela
    autoTable(doc, {
        startY: 30,
        head: [headRow],
        body: bodyRows,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle'
        },
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index > 0) {
                let texto = '';
                if (data.cell && data.cell.text) {
                    texto = Array.isArray(data.cell.text) ? data.cell.text.join('') : String(data.cell.text);
                }
                
                if (texto.includes('F')) {
                    data.cell.styles.fillColor = [255, 235, 59];
                } else if (texto.includes('C') || texto.includes('W')) {
                    data.cell.styles.fillColor = [41, 128, 185];
                    data.cell.styles.textColor = 255;
                } else if (texto.includes('A')) {
                    data.cell.styles.fillColor = [46, 204, 113];
                } else if (texto.includes('B')) {
                    data.cell.styles.fillColor = [230, 126, 34];
                }
            }
        }
    });

    // 8. Salva o PDF com nome limpo
    const nomeArquivo = `Escala_Semanal_${inicioStr.replace(/\//g, '-')}.pdf`;
    doc.save(nomeArquivo);
  }
  
  getTurno(servidor: any, dia: number): string {
    if (!servidor.id) return '';
    if (this.mapaEscalas && this.mapaEscalas[servidor.id]) {
        return this.mapaEscalas[servidor.id][dia] || '';
    }
    return '';
  }

  obterClasseTurno(codigo: string | undefined): string {
    if (!codigo) return ''; 
    switch (codigo.toUpperCase()) {
      case 'A': return 'turno-manha';
      case 'B': return 'turno-tarde';
      case 'C': return 'turno-noite';
      case 'F': return 'turno-folga';
      case 'W': return 'turno-noite';
      default:  return 'turno-padrao'; 
    }
  }
}
