import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoAdministrador } from '../../shared/models/interfaces';
import { AdministradorService } from '../../shared/services/administrador-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmAdministrador } from '../forms/frm-administrador/frm-administrador';
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
import { InfoAdministrador } from '../forms/info-administrador/info-administrador';

@Component({
  selector: 'app-administrador',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './administrador.html',
  styleUrl: './administrador.css',
})
export class Administrador implements AfterViewInit {
  private readonly adminSrv = inject(AdministradorService);
  private readonly dialogo = inject(MatDialog);
  private readonly usuarioSrv = inject(UsuarioService);
  public readonly srvAuth = inject(AuthService);
  public readonly printSrv = inject(PrintService);

  public paginaActual = 0;
  public tamanoPagina = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = [
    'idAdministrador',
    'nombre',
    'apellido1',
    'apellido2',
    'celular',
    'correo',
    'botonera',
  ];

  datos: any;
  dataSource = signal(new MatTableDataSource<TipoAdministrador>());
  filtro: any;
  filtroP = signal({ idAdministrador: '', nombre: '', apellido1: '', apellido2: '' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoAdministrador) {
    const dialogoRef = this.dialogo.open(FrmAdministrador, {
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
    this.filtro = { idAdministrador: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.adminSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource.set(data);
      },
      error: (err) => {},
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Administrador');
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidAdministrador') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onEditar(id: number) {
    this.adminSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Administrador', data);
      },
    });
  }

  onInfo(id: number) {
    this.adminSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogRef = this.dialogo.open(InfoAdministrador, {
          width: '50vw',
          maxWidth: '35rem',
          data: {
            title: 'Información del Administrador',
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
    this.adminSrv.buscar(id).subscribe({
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
            this.usuarioSrv.resetearPassw(data.idAdministrador).subscribe(() => {
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
    // Primero buscar el administrador para verificar que no se elimine a sí mismo
    this.adminSrv.buscar(id).subscribe({
      next: (adminData) => {
        // Verificar si el usuario está intentando eliminarse a sí mismo
        const usuarioActual = this.srvAuth.UserActual;
        if (usuarioActual.idUsuario === adminData.idAdministrador) {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: 'No puede eliminar su propia cuenta. Solicite a otro administrador que realice esta acción.',
              icono: 'error',
              textoAceptar: 'Entendido',
            },
          });
          return;
        }

        // Proceder con la eliminación
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
            this.adminSrv.eliminar(id).subscribe({
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
                  // Manejar otros códigos de estado como error
                  let mensaje = data?.mensaje || 'Error al eliminar el registro';
                  
                  if (status === 404) {
                    mensaje = data?.mensaje || 'El administrador no fue encontrado o ya fue eliminado.';
                  } else if (status === 409) {
                    mensaje = data?.mensaje || 'No se puede eliminar el administrador porque tiene casos creados asignados.';
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
                let mensaje = 'Error al eliminar el registro. Por favor, intente nuevamente.';
                const status = err.status || 500;
                const data = err.data || {};
                
                if (status === 404) {
                  mensaje = data.mensaje || 'El administrador no fue encontrado o ya fue eliminado.';
                } else if (status === 409) {
                  mensaje = data.mensaje || 'No se puede eliminar el administrador porque tiene casos creados asignados.';
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
      },
      error: (err) => {
        this.dialogo.open(DialogoGeneral, {
          data: {
            texto: 'Error al verificar los datos del administrador.',
            icono: 'error',
            textoAceptar: 'Aceptar',
          },
        });
      }
    });
  }

  onImprimir() {
    const encabezado = [
      'Id Administrador', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.adminSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => [
          obj.idAdministrador,
          `${obj.nombre} ${obj.apellido1} ${obj.apellido2}`,
          obj.telefono,
          obj.celular,
          obj.correo
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de administradores', true);
      },
      error: (err) => {},
    });
  }

  onCerrar() {
    // cerrar módulo o diálogo si aplica
  }

  ngAfterViewInit(): void {
    this.filtro = { idAdministrador: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }
}
