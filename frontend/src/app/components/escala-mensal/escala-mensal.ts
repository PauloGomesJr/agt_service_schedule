import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HeaderComponent } from '../header/header';

// Services
import { ServidorService } from '../../services/servidor.service'; 
import { TipoServicoService } from '../../services/tipo-servico';
import { EscalaService } from '../../services/escala';
import { DeterminacaoService } from '../../services/determinacao.service'; // <-- ADICIONADO

// Models
import { Servidor } from '../../models/servidor.model';
import { TipoServico } from '../../models/tipo-servico.model';
import { Escala, EscalaDTO } from '../../models/escala.model';
import { Determinacao } from '../../models/determinacao'; // <-- ADICIONADO

// === IMPORTAÇÕES PARA O PDF E ALERTAS ===
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-escala-mensal',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './escala-mensal.html',
  styleUrl: './escala-mensal.scss'
})
export class EscalaMensalComponent implements OnInit {

  // Dados do Banco
  servidores: Servidor[] = [];
  tiposServico: TipoServico[] = [];
  escalas: Escala[] = []; 
  determinacoes: Determinacao[] = []; // <-- ADICIONADO PARA O PDF
  
  // Mapa visual
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
    id: null,
    servidorId: null,
    nomeServidor: '',
    data: null, 
    tipoServicoId: null
  };

  constructor(
    private servidorService: ServidorService,
    private tipoServicoService: TipoServicoService,
    private escalaService: EscalaService,
    private determinacaoService: DeterminacaoService, // <-- INJETADO
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
    this.atualizarMapaVisualizacao();
  }

  getDataVisualizacao(): Date {
    return new Date(this.anoAtual, this.mesAtual, 1);
  }

  carregarDados() {
    this.servidorService.listar().subscribe(dados => {
      this.servidores = dados.filter(s => s.situacao === 'ATIVO');
      this.servidores.sort((a, b) => {
        const nomeA = (a.nomeGuerra || a.nome.split(' ')[0] || '').trim().toUpperCase();
        const nomeB = (b.nomeGuerra || b.nome.split(' ')[0] || '').trim().toUpperCase();
        return nomeA.localeCompare(nomeB);
      });
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

    // BUSCA AS DETERMINAÇÕES PARA DEIXAR PRONTO PARA O PDF
    this.determinacaoService.listarTodas().subscribe({
      next: (dados: any) => this.determinacoes = dados,
      error: (err: any) => console.error('Erro ao buscar determinações para o PDF', err)
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

    if (this.modoPermuta) {
      if (!escalaExistente) {
        Swal.fire({
          title: 'Atenção!',
          text: 'Para permutar, clique em um plantão que já tenha sido marcado (célula colorida).',
          icon: 'info',
          confirmButtonColor: '#3498db'
        });
        return;
      }
      if (escalaExistente.id === this.escalaOrigemPermuta.id) {
        Swal.fire({
          title: 'Não permitido',
          text: 'Você não pode permutar um plantão com ele mesmo.',
          icon: 'warning',
          confirmButtonColor: '#e67e22'
        });
        return;
      }
      
      this.executarPermuta(escalaExistente.id, servidor.nomeGuerra || servidor.nome.split(' ')[0], data);
      return;
    }

     this.escalaSelecionada = {
      id: null,
      servidorId: servidor.id,
      nomeServidor: servidor.nome,
      data: data,
      tipoServicoId: null,
      determinacao: '' 
    };
    
    if (escalaExistente) {
      this.escalaSelecionada.id = escalaExistente.id; 
      this.escalaSelecionada.tipoServicoId = escalaExistente.tipoServico.id;
      this.escalaSelecionada.determinacao = escalaExistente.determinacao || ''; 
    }
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEscala() {
    if (!this.escalaSelecionada.tipoServicoId) {
      Swal.fire({ text: 'Por favor, selecione um turno para este plantão.', icon: 'warning', confirmButtonColor: '#f39c12' });
      return;
    }

    const dataFormatada = this.escalaSelecionada.data.toLocaleDateString('en-CA'); 

    const dto: EscalaDTO = {
      servidorId: this.escalaSelecionada.servidorId,
      tipoServicoId: this.escalaSelecionada.tipoServicoId,
      data: dataFormatada,
      observacao: 'Inserido via Web',
      determinacao: this.escalaSelecionada.determinacao 
    };

    this.escalaService.salvar(dto).subscribe({
      next: (novaEscala) => {
        this.escalas = this.escalas.filter(e => !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data));
        this.escalas.push(novaEscala);
        this.atualizarMapaVisualizacao();
        this.cdr.detectChanges(); 
        this.fecharModal();
      },
      error: (err) => {
        let mensagem = err.error?.message || err.error || 'Erro ao salvar escala.';
        Swal.fire({ title: 'Bloqueado!', text: mensagem, icon: 'error', confirmButtonColor: '#e74c3c' });
      }
    });
  }

  excluirEscala() {
    if (!this.escalaSelecionada.id) return;

    Swal.fire({
      title: 'Remover plantão?', text: "Esta ação não pode ser desfeita.", icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sim, remover!', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.escalaService.excluir(this.escalaSelecionada.id).subscribe({
          next: () => {
            this.escalas = this.escalas.filter(e => e.id !== this.escalaSelecionada.id);
            this.fecharModal(); 
            this.atualizarMapaVisualizacao();
            this.cdr.detectChanges();
            Swal.fire('Removido!', 'O plantão foi excluído.', 'success');
          },
          error: (err) => Swal.fire('Erro!', 'Não foi possível excluir o plantão.', 'error')
        });
      }
    });
  }

  iniciarPermuta() {
    this.modoPermuta = true;
    this.escalaOrigemPermuta = { ...this.escalaSelecionada };
    this.fecharModal();
  }

  cancelarPermuta() {
    this.modoPermuta = false;
    this.escalaOrigemPermuta = null;
  }

  executarPermuta(destinoId: number, nomeDestino: string, dataDestino: Date) {
    const dataOrigemStr = this.escalaOrigemPermuta.data.toLocaleDateString('pt-BR');
    const dataDestStr = dataDestino.toLocaleDateString('pt-BR');

    Swal.fire({
      title: 'Confirmar Troca?',
      html: `Deseja permutar os plantões entre:<br><br><b>${this.escalaOrigemPermuta.nomeServidor}</b> (${dataOrigemStr})<br><b>${nomeDestino}</b> (${dataDestStr})`,
      icon: 'question', showCancelButton: true, confirmButtonColor: '#27ae60', cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sim, permutar!', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.escalaService.permutar(this.escalaOrigemPermuta.id, destinoId).subscribe({
          next: () => {
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
            Swal.fire('Sucesso!', 'Permuta realizada com sucesso!', 'success');
          },
          error: (err) => {
            let mensagem = err?.error?.message || err?.error || 'Erro interno ao realizar permuta.';
            Swal.fire('Permuta Recusada', mensagem, 'error');
            this.cancelarPermuta();
          }
        });
      }
    });
  }

  gerarPDF() {
    const doc = new jsPDF('l', 'mm', 'a4');
    const mesFormatado = this.getDataVisualizacao().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    doc.setFontSize(18);
    doc.text(`Escala de Serviço - ${mesFormatado.toUpperCase()}`, 15, 15);

    autoTable(doc, {
      html: '#tabela-escala',
      startY: 25, theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [52, 73, 94], textColor: 255 },
      didParseCell: (data) => {
        const texto = data.cell.text.join('');
        if (data.section === 'body' && data.column.index > 0) {
            if (texto.includes('F')) data.cell.styles.fillColor = [255, 235, 59];
            else if (texto.includes('C')) { data.cell.styles.fillColor = [41, 128, 185]; data.cell.styles.textColor = 255; } 
            else if (texto.includes('A')) data.cell.styles.fillColor = [46, 204, 113];
        }
      }
    });
    doc.save(`Escala_${mesFormatado}.pdf`);
  }

  // === FLUXO ATUALIZADO DO PDF SEMANAL ===
  gerarPDFSemanal() {
    if (!this.dataInicioSemana) {
        Swal.fire('Atenção', 'Por favor, escolha uma data de início no calendário.', 'info');
        return;
    }

    const partes = this.dataInicioSemana.split('-');
    const dataInicio = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    if (dataInicio.getDay() !== 6) { 
        Swal.fire({
          title: 'Data diferente de Sábado',
          text: 'Deseja gerar os 7 dias a partir deste dia mesmo assim?',
          icon: 'question', showCancelButton: true, confirmButtonText: 'Sim, gerar!', cancelButtonText: 'Não, cancelar'
        }).then((res) => {
          if (res.isConfirmed) this.perguntarSobreDeterminacoes(dataInicio);
        });
    } else {
        this.perguntarSobreDeterminacoes(dataInicio);
    }
  }

  private perguntarSobreDeterminacoes(dataInicio: Date) {
    Swal.fire({
      title: 'Determinações Operacionais',
      text: 'Deseja anexar uma segunda página neste PDF contendo as instruções de cada agente?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#8e44ad',
      denyButtonColor: '#34495e',
      confirmButtonText: 'Sim, incluir',
      denyButtonText: 'Não, apenas Escala',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processarGeracaoSemanal(dataInicio, true);
      } else if (result.isDenied) {
        this.processarGeracaoSemanal(dataInicio, false);
      }
    });
  }

  private processarGeracaoSemanal(dataInicio: Date, incluirDeterminacoes: boolean) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const diasDaSemana: Date[] = [];
    for (let j = 0; j < 7; j++) {
        const dia = new Date(dataInicio);
        dia.setDate(dataInicio.getDate() + j);
        diasDaSemana.push(dia);
    }

    const inicioStr = diasDaSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fimStr = diasDaSemana[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // --- PÁGINA 1: A GRADE DE ESCALAS ---
    doc.setFontSize(14);
    doc.text(`Escala Semanal: ${inicioStr} a ${fimStr}`, 105, 20, { align: 'center' });

    const headRow = ['Servidor', ...diasDaSemana.map(d => 
        `${d.getDate()}/${(d.getMonth()+1).toString().padStart(2,'0')} (${d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)})`
    )];

    const bodyRows = this.servidores.map(servidor => {
        const nomeExibicao = servidor.nomeGuerra || servidor.nome.split(' ')[0];
        const turnosSemana = diasDaSemana.map(dia => {
            const dataFormatada = dia.toLocaleDateString('en-CA'); 
            const escalaEncontrada = this.escalas.find(e => e.servidor.id === servidor.id && e.data === dataFormatada);
            return escalaEncontrada ? escalaEncontrada.tipoServico.codigo : '';
        });
        return [nomeExibicao, ...turnosSemana];
    });

    autoTable(doc, {
        startY: 30, head: [headRow], body: bodyRows, theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index > 0) {
                let texto = data.cell.text.join('');
                if (texto.includes('F')) data.cell.styles.fillColor = [255, 235, 59];
                else if (texto.includes('C') || texto.includes('W')) {
                    data.cell.styles.fillColor = [41, 128, 185]; data.cell.styles.textColor = 255;
                } else if (texto.includes('A')) data.cell.styles.fillColor = [46, 204, 113];
                else if (texto.includes('B')) data.cell.styles.fillColor = [230, 126, 34];
            }
        }
    });

    // --- PÁGINA 2: AS DETERMINAÇÕES (SE O USUÁRIO PEDIU) ---
    if (incluirDeterminacoes) {
        doc.addPage(); // Cria uma folha nova!
        doc.setFontSize(14);
        doc.text(`Determinações Operacionais: ${inicioStr} a ${fimStr}`, 105, 20, { align: 'center' });

        // Coleta todas as escalas que caem nesta semana exata
        const datasSemanaStr = diasDaSemana.map(d => d.toLocaleDateString('en-CA'));
        const escalasDaSemana = this.escalas.filter(e => datasSemanaStr.includes(e.data));

        // Filtra as determinações para exibir apenas as que pertencem aos plantões desta semana
        const determinacoesDaSemana = this.determinacoes.filter(det => 
            escalasDaSemana.some(e => e.id === det.escala.id)
        );

        // Organiza a lista por Data, e depois por Turno
        determinacoesDaSemana.sort((a, b) => {
             const dataA = a.escala.data || '';
             const dataB = b.escala.data || '';
             if (dataA !== dataB) return dataA.localeCompare(dataB);
             const turnoA = a.escala.tipoServico?.codigo || '';
             const turnoB = b.escala.tipoServico?.codigo || '';
             return turnoA.localeCompare(turnoB);
        });

        // Monta as linhas da Tabela de Instruções
       // Monta as linhas da Tabela de Instruções
        const bodyDet = determinacoesDaSemana.map(det => {
            // O ': any' diz ao TypeScript para não inspecionar o formato desse objeto estritamente
            const esc: any = escalasDaSemana.find(e => e.id === det.escala.id) || det.escala;
            
            // Travas de segurança para evitar erro de "undefined"
            const dataStr = esc.data || '';
            const partes = dataStr.split('-');
            const dataBr = partes.length === 3 ? `${partes[2]}/${partes[1]}` : '-'; // Ex: 09/04
            
            const turno = esc.tipoServico?.codigo || '';
            
            // O símbolo '?.' protege o código caso o servidor venha nulo
            const agente = esc.servidor?.nomeGuerra || esc.servidor?.nome?.split(' ')[0] || '-';

            return [
                dataBr, turno, agente, det.areaAtuacao, (det.setor || '-'), det.instrucoes
            ];
        });

        if (bodyDet.length > 0) {
            autoTable(doc, {
                startY: 30,
                head: [['Data', 'Turno', 'Agente', 'Área', 'Setor', 'Instrução Operacional']],
                body: bodyDet,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [142, 68, 173], textColor: 255, fontStyle: 'bold' }, // Cabeçalho Roxo
                columnStyles: {
                    2: { halign: 'left', fontStyle: 'bold', cellWidth: 35 }, // Coluna Agente
                    5: { halign: 'left', cellWidth: 80 } // Coluna Instrução (Mais larga para o texto caber bem)
                }
            });
        } else {
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text("Nenhuma determinação cadastrada para as equipes desta semana.", 105, 40, { align: 'center' });
        }
    }

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
      case 'D': return 'turno-manha';
      case 'E': return 'turno-noite';
      case 'F': return 'turno-folga';
      case 'W': return 'turno-noite';
      default:  return 'turno-padrao'; 
    }
  }
}