import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoTecnico } from '../../shared/models/interfaces';
import { TecnicoService } from '../../shared/services/tecnico-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmTecnico } from '../forms/frm-tecnico/frm-tecnico';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { UsuarioService } from '../../shared/services/usuario-service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../shared/services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { InfoTecnico } from '../forms/info-tecnico/info-tecnico';

@Component({
  selector: 'app-tecnico',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './tecnico.html',
  styleUrl: './tecnico.css',
})
export class Tecnico implements AfterViewInit {
  private readonly tecnicoSrv = inject(TecnicoService);
  private readonly dialogo = inject(MatDialog);
  private readonly usuarioSrv = inject(UsuarioService);
  public readonly srvAuth = inject(AuthService);
  public readonly printSrv = inject(PrintService);

  public paginaActual = 0;
  public tamanoPagina = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = [
    'idTecnico',
    'nombre',
    'apellido1',
    'apellido2',
    'celular',
    'correo',
    'botonera',
  ];

  datos: any;
  dataSource = signal(new MatTableDataSource<TipoTecnico>());
  filtro: any;
  filtroP = signal({ idTecnico: '', nombre: '', apellido1: '', apellido2: '' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoTecnico) {
    const dialogoRef = this.dialogo.open(FrmTecnico, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: titulo,
        datos: datos,
      },
      disableClose: true,
    });

    dialogoRef.afterClosed().subscribe({
      next: (res) => {
        if (res !== false) {
          this.resetearFiltro();
        }
      },
      error: (err) => {},
    });
  }

  resetearFiltro() {
    this.filtro = { idTecnico: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.tecnicoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource.set(data);
      },
      error: (err) => {},
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Técnico');
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidTecnico') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onEditar(id: number) {
    this.tecnicoSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Técnico', data);
      },
    });
  }

  onInfo(id: number) {
    this.tecnicoSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogRef = this.dialogo.open(InfoTecnico, {
          width: '50vw',
          maxWidth: '35rem',
          data: {
            title: 'Información del Técnico',
            datos: data,
          },
        });

        dialogRef.afterClosed().subscribe(result => {
        });
      },
      error: (err) => {
      },
    });
  }

  togglePanel() {
    this.panelOpenState.set(!this.panelOpenState());
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onResetearPassword(id: number) {
    this.tecnicoSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogRef = this.dialogo.open(DialogoGeneral, {
          data: {
            texto: `¿Resetear contraseña de ${data.nombre}?`,
            icono: 'question_mark',
            textoAceptar: 'Si',
            textoCancelar: 'No',
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === true) {
            this.usuarioSrv.resetearPassw(data.idTecnico).subscribe(() => {
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Contraseña restablecida',
                  icono: 'check',
                  textoAceptar: 'Aceptar',
                },
              });
            });
          }
        });
      },
    });
  }

  onEliminar(id: number) {
    const dialogRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: '¿Eliminar registro seleccionado?',
        icono: 'question_mark',
        textoAceptar: 'Si',
        textoCancelar: 'No',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.tecnicoSrv.eliminar(id).subscribe({
          next: (response) => {
            const status = response.status;
            const data = response.data;
            
            if (status === 200) {
              const mensaje = data?.mensaje || 'Registro eliminado correctamente';
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: mensaje,
                  icono: 'check',
                  textoAceptar: 'Aceptar',
                },
              });
              this.filtrar();
            } else {
              // Manejar otros códigos de estado como advertencia
              let mensaje = data?.mensaje || 'Error al eliminar el registro';
              
              if (status === 404) {
                mensaje = data?.mensaje || 'El técnico no fue encontrado o ya fue eliminado.';
              } else if (status === 409) {
                mensaje = data?.mensaje || 'No se puede eliminar el técnico porque tiene casos asignados.';
              }
              
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: mensaje,
                  icono: 'warning',
                  textoAceptar: 'Aceptar',
                },
              });
            }
          },
          error: (err) => {
            let mensaje = 'Error al eliminar el técnico. Por favor, intente nuevamente.';
            const status = err.status || 500;
            const data = err.data || {};
            
            if (status === 404) {
              mensaje = data.mensaje || 'El técnico no fue encontrado o ya fue eliminado.';
            } else if (status === 409) {
              mensaje = data.mensaje || 'No se puede eliminar el técnico porque tiene casos asignados.';
            } else if (status >= 500) {
              mensaje = data.mensaje || 'Error interno del servidor. Contacte al administrador del sistema.';
            }
            
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: mensaje,
                icono: 'error',
                textoAceptar: 'Aceptar',
              },
            });
          }
        });
      }
    });
  }

  onImprimir() {
    const encabezado = [
      'Id Técnico', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.tecnicoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => [
          obj.idTecnico,
          `${obj.nombre} ${obj.apellido1} ${obj.apellido2}`,
          obj.telefono,
          obj.celular,
          obj.correo
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de técnicos', true);
      },
      error: (err) => {},
    });
  }

  onCerrar() {
    // cerrar módulo o diálogo si aplica
  }

  ngAfterViewInit(): void {
    this.filtro = { idTecnico: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }
}
