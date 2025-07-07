import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoCaso } from '../../shared/models/interfaces';
import { CasoService } from '../../shared/services/caso-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmCaso } from '../forms/frm-caso/frm-caso';
import { FrmHistorialCaso } from '../forms/frm-historial-caso/frm-historial-caso';
import { FrmCambiarEstado } from '../forms/frm-cambiar-estadoCaso/frm-cambiar-estado';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';
import { CommonModule } from '@angular/common';
import { Role } from '../../shared/models/role';

@Component({
  selector: 'app-casos',
  imports: [
    CommonModule, MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './casos.html',
  styleUrl: './casos.css'
})
export class Casos implements AfterViewInit {
  private readonly casoSrv = inject(CasoService);
  private readonly dialogo = inject(MatDialog);
  public readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);
  public readonly Role = Role;

  public paginaActual = 0;
  public tamanoPagina = 5;
  public opcionesTamano = [2, 5, 10, 20];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);

  columnas: string[] = [
    'cliente', 'tecnico', 'artefacto', 'descripcion', 'fechaEntrada', 'fechaSalida', 'botonera'
  ];

  datos: any;
  dataSource = signal(new MatTableDataSource<TipoCaso>());
  filtro: any;
  filtroP = signal({ cliente: '', tecnico: '', descripcion: '' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoCaso) {
    const dialogoRef = this.dialogo.open(FrmCaso, {
      width: '60vw',
      maxWidth: '40rem',
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
    const usuarioActual = this.srvAuth.userActualS();
    
    if (usuarioActual.rol === Role.Cliente) {
      // Si es cliente, filtrar solo sus casos
      this.filtro = { 
        cliente: usuarioActual.idUsuario, 
        tecnico: '', 
        marca: '', 
        modelo: '', 
        descripcion: '' 
      };
    } else {
      // Para otros roles, filtro vacío (ver todos)
      this.filtro = { 
        cliente: '', 
        tecnico: '', 
        marca: '', 
        modelo: '', 
        descripcion: '' 
      };
    }
    
    this.paginaActual = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.filtrar();
  }

  filtrar() {
    // Obtener el número total de registros
    this.casoSrv.obtenerNumeroRegistros(this.filtro).subscribe({
      next: (total) => {
        this.totalRegistros.set(total);
      },
      error: (err) => {
      }
    });

    // Obtener los datos de la página actual
    this.casoSrv.filtrar(this.filtro, this.paginaActual, this.tamanoPagina).subscribe({
      next: (data) => {
        this.dataSource.set(new MatTableDataSource<TipoCaso>(data));
      },
      error: (err) => {
      },
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Caso');
  }

  limpiar() {
    const usuarioActual = this.srvAuth.userActualS();
    
    // Limpiar los campos de input en el HTML
    (document.querySelector('#ftecnico') as HTMLInputElement).value = '';
    (document.querySelector('#fmarca') as HTMLInputElement).value = '';
    (document.querySelector('#fmodelo') as HTMLInputElement).value = '';
    (document.querySelector('#fdescripcion') as HTMLInputElement).value = '';
    
    if (usuarioActual.rol === Role.Cliente) {
      // Si es cliente, mantener su ID en el filtro pero limpiar los demás
      (document.querySelector('#fcliente') as HTMLInputElement).value = usuarioActual.idUsuario;
    } else {
      // Para otros roles, limpiar también el campo cliente
      (document.querySelector('#fcliente') as HTMLInputElement).value = '';
    }
    
    this.resetearFiltro();
  }

  onEditar(id: number) {
    this.casoSrv.buscar(id).subscribe({
      next: (data) => {
        const caso = Array.isArray(data) ? data[0] : data;
        this.mostrarDialogo('Editar Caso', caso);
      },
    });
  }

  onInfo(id: number) {
    // Obtener información completa del caso para mostrar el historial
    this.casoSrv.buscar(id).subscribe({
      next: (data) => {
        const caso = Array.isArray(data) ? data[0] : data;
        
        const dialogRef = this.dialogo.open(FrmHistorialCaso, {
          width: '90vw',
          maxWidth: '70rem',
          maxHeight: '80vh',
          data: {
            idCaso: caso.id,
            descripcionCaso: caso.descripcion,
            casoCompleto: caso  // Pasar toda la información del caso
          },
          disableClose: false,
        });

        dialogRef.afterClosed().subscribe(() => {
          // No need to refresh anything since this is read-only
        });
      },
      error: (err) => {
        this.dialogo.open(DialogoGeneral, {
          data: {
            texto: 'Error al obtener información del caso',
            icono: 'error',
            textoAceptar: 'Aceptar',
          },
        });
      }
    });
  }

  onEstado(id: number) {
    // Implementar cambio de estado del caso
    this.casoSrv.buscar(id).subscribe({
      next: (data) => {
        const caso = Array.isArray(data) ? data[0] : data;
        
        // Determinar el técnico responsable
        const usuarioActual = this.srvAuth.userActualS();
        let tecnicoResponsable = '';
        
        // Si el usuario actual es técnico (rol 3), usar su ID
        if (usuarioActual.rol === Role.Tecnico) {
          tecnicoResponsable = usuarioActual.idUsuario;
        } 
        // Si no es técnico, usar el técnico asignado al caso
        else if (caso.idTecnico) {
          tecnicoResponsable = caso.idTecnico;
        }
        // Si no hay técnico asignado, mostrar error
        else {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: 'Este caso no tiene un técnico asignado. Solo un técnico puede cambiar el estado.',
              icono: 'error',
              textoAceptar: 'Aceptar',
            },
          });
          return;
        }
        
        const dialogRef = this.dialogo.open(FrmCambiarEstado, {
          width: '60vw',
          maxWidth: '50rem',
          data: {
            idCaso: caso.id,
            descripcionCaso: caso.descripcion,
            estadoActual: caso.estado || 0, 
            idTecnico: tecnicoResponsable
          },
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado === true) {
            // Estado cambiado exitosamente, refrescar la lista
            this.filtrar();
            
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: 'Estado del caso actualizado correctamente',
                icono: 'check',
                textoAceptar: 'Aceptar',
              },
            });
          }
        });
      },
      error: (err) => {
        this.dialogo.open(DialogoGeneral, {
          data: {
            texto: 'Error al obtener información del caso',
            icono: 'error',
            textoAceptar: 'Aceptar',
          },
        });
      }
    });
  }

  togglePanel() {
    this.panelOpenState.set(!this.panelOpenState());
  }
  
  onFiltroChange(f: any) {
    this.filtro = f;
    this.paginaActual = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.filtrar();
  }

  onEliminar(id: number) {
    const dialogRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: '¿Eliminar caso seleccionado?',
        icono: 'question_mark',
        textoAceptar: 'Si',
        textoCancelar: 'No',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.casoSrv.eliminar(id).subscribe({
          next: (response) => {
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: response.mensaje || 'Caso eliminado correctamente',
                icono: 'check',
                textoAceptar: 'Aceptar',
              },
            });
            this.filtrar();
          },
          error: (error) => {
            // Si el error es 409 (conflicto), significa que tiene historial
            if (error.status === 409) {
              // Mostrar el mensaje de error y preguntar si quiere eliminar con historial
              const dialogHistorial = this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Este caso tiene un historial de cambios de estado asignado y no puede ser eliminado. ¿Desea eliminar el caso junto con su historial?',
                  icono: 'warning',
                  textoAceptar: 'Si, eliminar todo',
                  textoCancelar: 'No',
                },
              });

              dialogHistorial.afterClosed().subscribe((resultHistorial) => {
                if (resultHistorial === true) {
                  // Eliminar caso con historial
                  this.casoSrv.eliminarConHistorial(id).subscribe({
                    next: (response) => {
                      this.dialogo.open(DialogoGeneral, {
                        data: {
                          texto: response.mensaje || 'Caso y su historial eliminados correctamente',
                          icono: 'check',
                          textoAceptar: 'Aceptar',
                        },
                      });
                      this.filtrar();
                    },
                    error: (errorHistorial) => {
                      this.dialogo.open(DialogoGeneral, {
                        data: {
                          texto: 'Error al eliminar el caso con historial',
                          icono: 'error',
                          textoAceptar: 'Aceptar',
                        },
                      });
                    }
                  });
                }
              });
            } else {
              // Otro tipo de error
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Error al eliminar el caso',
                  icono: 'error',
                  textoAceptar: 'Aceptar',
                },
              });
            }
          }
        });
      }
    });
  }

  onImprimir() {
    const encabezado = ['Cliente', 'Técnico', 'Artefacto', 'Descripción', 'Fecha Entrada', 'Fecha Salida'];
    this.casoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => [
          obj.idCliente, obj.idTecnico, obj.idArtefacto, obj.descripcion, 
          obj.fechaEntrada, obj.fechaSalida
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de casos', true);
      },
      error: (err) => {},
    });
  }

  ngAfterViewInit(): void {
    // Configurar paginador
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        this.paginaActual = this.paginator.pageIndex;
        this.tamanoPagina = this.paginator.pageSize;
        this.filtrar();
      });
    }
    
    // Cargar datos iniciales
    this.resetearFiltro();
    
    // Inicializar el campo cliente si el usuario es cliente
    const usuarioActual = this.srvAuth.userActualS();
    if (usuarioActual.rol === Role.Cliente) {
      setTimeout(() => {
        const clienteInput = document.querySelector('#fcliente') as HTMLInputElement;
        if (clienteInput) {
          clienteInput.value = usuarioActual.idUsuario;
        }
      }, 100);
    }
  }
}
