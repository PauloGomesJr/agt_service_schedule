import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HeaderComponent } from '../header/header';

// Services
import { ServidorService } from '../../services/servidor.service'; 
import { TipoServicoService } from '../../services/tipo-servico';
import { EscalaService } from '../../services/escala';

// Models
import { Servidor } from '../../models/servidor.model';
import { TipoServico } from '../../models/tipo-servico.model';
import { Escala, EscalaDTO } from '../../models/escala.model';

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
  
  // Lista original
  escalas: Escala[] = []; 
  
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
      determinacao: '' // <--- Campo zerado ao abrir para novo plantão
    };
    
    if (escalaExistente) {
      this.escalaSelecionada.id = escalaExistente.id; 
      this.escalaSelecionada.tipoServicoId = escalaExistente.tipoServico.id;
      // Carrega a determinação se ela existir no banco
      this.escalaSelecionada.determinacao = escalaExistente.determinacao || ''; 
    }
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  salvarEscala() {
    if (!this.escalaSelecionada.tipoServicoId) {
      Swal.fire({
        text: 'Por favor, selecione um turno para este plantão.',
        icon: 'warning',
        confirmButtonColor: '#f39c12'
      });
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
        this.escalas = this.escalas.filter(e => 
          !(e.servidor.id === novaEscala.servidor.id && e.data === novaEscala.data)
        );
        this.escalas.push(novaEscala);
        this.atualizarMapaVisualizacao();
        this.cdr.detectChanges(); 
        this.fecharModal();
        
        // Alerta discreto de sucesso (opcional)
        // Swal.fire({ title: 'Salvo!', icon: 'success', timer: 1000, showConfirmButton: false });
      },
      error: (err) => {
        let mensagem = 'Erro ao salvar escala.';
        if (err.error && err.error.message) mensagem = err.error.message;
        else if (err.error && typeof err.error === 'string') mensagem = err.error;

        Swal.fire({
          title: 'Bloqueado!',
          text: mensagem,
          icon: 'error',
          confirmButtonColor: '#e74c3c'
        });
      }
    });
  }

  excluirEscala() {
    if (!this.escalaSelecionada.id) return;

    Swal.fire({
      title: 'Remover plantão?',
      text: "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar'
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
          error: (err) => {
            Swal.fire('Erro!', 'Não foi possível excluir o plantão.', 'error');
          }
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
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sim, permutar!',
      cancelButtonText: 'Cancelar'
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
            let mensagem = 'Erro interno ao realizar permuta.';
            if (err && err.error && err.error.message) mensagem = err.error.message;
            else if (err && err.error && typeof err.error === 'string') mensagem = err.error;
            
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
      startY: 25,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255
      },
      didParseCell: (data) => {
        const texto = data.cell.text.join('');
        if (data.section === 'body' && data.column.index > 0) {
            if (texto.includes('F')) {
                data.cell.styles.fillColor = [255, 235, 59];
            } else if (texto.includes('C')) {
                data.cell.styles.fillColor = [41, 128, 185];
                data.cell.styles.textColor = 255;
            } else if (texto.includes('A')) {
                data.cell.styles.fillColor = [46, 204, 113];
            }
        }
      }
    });
    doc.save(`Escala_${mesFormatado}.pdf`);
  }

  gerarPDFSemanal() {
    if (!this.dataInicioSemana) {
        Swal.fire('Atenção', 'Por favor, escolha uma data de início no calendário.', 'info');
        return;
    }

    const partes = this.dataInicioSemana.split('-');
    const dataInicio = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));

    // Lógica para data diferente de Sábado com SweetAlert2
    if (dataInicio.getDay() !== 6) { 
        Swal.fire({
          title: 'Data diferente de Sábado',
          text: 'Deseja gerar os 7 dias a partir deste dia mesmo assim?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim, gerar!',
          cancelButtonText: 'Não, cancelar'
        }).then((res) => {
          if (res.isConfirmed) this.processarGeracaoSemanal(dataInicio);
        });
    } else {
        this.processarGeracaoSemanal(dataInicio);
    }
  }

  private processarGeracaoSemanal(dataInicio: Date) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const diasDaSemana: Date[] = [];
    for (let j = 0; j < 7; j++) {
        const dia = new Date(dataInicio);
        dia.setDate(dataInicio.getDate() + j);
        diasDaSemana.push(dia);
    }

    const inicioStr = diasDaSemana[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fimStr = diasDaSemana[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
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
        startY: 30,
        head: [headRow],
        body: bodyRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 } },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index > 0) {
                let texto = data.cell.text.join('');
                if (texto.includes('F')) data.cell.styles.fillColor = [255, 235, 59];
                else if (texto.includes('C') || texto.includes('W')) {
                    data.cell.styles.fillColor = [41, 128, 185];
                    data.cell.styles.textColor = 255;
                } else if (texto.includes('A')) data.cell.styles.fillColor = [46, 204, 113];
                else if (texto.includes('B')) data.cell.styles.fillColor = [230, 126, 34];
            }
        }
    });

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