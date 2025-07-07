import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoOficinista } from '../../shared/models/interfaces';
import { OficinistaService } from '../../shared/services/oficinista-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmOficinista } from '../forms/frm-oficinista/frm-oficinista';
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
import { InfoOficinista } from '../forms/info-oficinista/info-oficinista';

@Component({
  selector: 'app-oficinista',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './oficinista.html',
  styleUrl: './oficinista.css',
})
export class Oficinista implements AfterViewInit {
  private readonly oficinistaSrv = inject(OficinistaService);
  private readonly dialogo = inject(MatDialog);
  private readonly usuarioSrv = inject(UsuarioService);
  public readonly srvAuth = inject(AuthService);
  public readonly printSrv = inject(PrintService);

  public paginaActual = 0;
  public tamanoPagina = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = [
    'idOficinista',
    'nombre',
    'apellido1',
    'apellido2',
    'celular',
    'correo',
    'botonera',
  ];

  datos: any;
  dataSource = signal(new MatTableDataSource<TipoOficinista>());
  filtro: any;
  filtroP = signal({ idOficinista: '', nombre: '', apellido1: '', apellido2: '' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoOficinista) {
    const dialogoRef = this.dialogo.open(FrmOficinista, {
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
    this.filtro = { idOficinista: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.oficinistaSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource.set(data);
      },
      error: (err) => {},
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Oficinista');
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidOficinista') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onEditar(id: number) {
    this.oficinistaSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Oficinista', data);
      },
    });
  }

  onInfo(id: number) {
    this.oficinistaSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogRef = this.dialogo.open(InfoOficinista, {
          width: '50vw',
          maxWidth: '35rem',
          data: {
            title: 'Información del Oficinista',
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
    this.oficinistaSrv.buscar(id).subscribe({
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
            this.usuarioSrv.resetearPassw(data.idOficinista).subscribe(() => {
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
        this.oficinistaSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: 'Registro eliminado correctamente',
              icono: 'check',
              textoAceptar: 'Aceptar',
            },
          });
          this.filtrar();
        });
      }
    });
  }

  onImprimir() {
    const encabezado = [
      'Id Oficinista', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.oficinistaSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => [
          obj.idOficinista,
          `${obj.nombre} ${obj.apellido1} ${obj.apellido2}`,
          obj.telefono,
          obj.celular,
          obj.correo
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de oficinistas', true);
      },
      error: (err) => {},
    });
  }

  onCerrar() {
    // cerrar módulo o diálogo si aplica
  }

  ngAfterViewInit(): void {
    this.filtro = { idOficinista: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }
}
