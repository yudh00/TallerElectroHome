import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoCliente, ServiceResponse } from '../../shared/models/interfaces';
import { ClienteService } from '../../shared/services/cliente-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmCliente } from '../forms/frm-cliente/frm-cliente';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { UsuarioService } from '../../shared/services/usuario-service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../shared/services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { InfoCliente } from '../forms/info-cliente/info-cliente';


@Component({
  selector: 'app-cliente',
  imports: [MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, 
    RouterModule, MatPaginatorModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class Cliente implements AfterViewInit {
  private readonly clienteSrv = inject(ClienteService);
  private readonly dialogo = inject(MatDialog);
  private readonly usuarioSrv = inject(UsuarioService);
  public readonly srvAuth = inject(AuthService);
  public readonly printSrv= inject(PrintService);
  public paginaActual = 0;
  public tamanoPagina = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);
  columnas: string[] = [
    'idCliente',
    'nombre',
    'apellido1',
    'apellido2',
    'celular',
    'correo',
    'botonera',
  ];
  datos: any;
   dataSource = signal(new MatTableDataSource<TipoCliente>());
  //dataSource = new MatTableDataSource<TipoCliente>();
  filtro: any;
  filtroP = signal({ idCliente:'', nombre:'', apellido1:'', apellido2:'' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoCliente) {
    const dialogoRef = this.dialogo.open(FrmCliente, {
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
        if (res != false) {
          this.resetearFiltro();
        }
      },
      error: (err) => {
      },
    });
  }

  resetearFiltro() {
    this.filtro = { idCliente: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  filtrar() {
    this.clienteSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource.set(data);
      },
      error: (err) => {},
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Cliente');
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidUsuario') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onEditar(id: number) {
    this.clienteSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Cliente', data);
      },
    });
  }

  onInfo(id: number) {
    this.clienteSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogRef = this.dialogo.open(InfoCliente, {
          width: '50vw',
          maxWidth: '35rem',
          data: {
            title: 'Información del Cliente',
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
    this.clienteSrv.buscar(id)
      .subscribe({
        next: (data) => {
          const dialogRef = this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `¿Resetear contraseña de ${data.nombre}?`,
              icono: 'question_mark',
              textoAceptar: 'Si',
              textoCancelar: 'No',
            }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              this.usuarioSrv.resetearPassw(data.idCliente).subscribe(() => {
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
        }
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
        this.clienteSrv.eliminar(id).subscribe({
          next: (response: ServiceResponse) => {
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
              let mensaje = data?.mensaje || 'Error al eliminar el registro';
              
              if (status === 404) {
                mensaje = data?.mensaje || 'El cliente no fue encontrado o ya fue eliminado.';
              } else if (status === 409) {
                mensaje = data?.mensaje || 'No se puede eliminar el cliente porque tiene casos asignados.';
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
          error: (err: any) => {
            let mensaje = 'No se puede eliminar el cliente porque tiene casos asignados.';
            
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

  onImprimir(){
    const encabezado = [
      'Id Cliente', 'Nombre', 'Teléfono', 'Celular', 'Correo'
    ];
    this.clienteSrv.filtrar(this.filtro)
      .subscribe({
        next: (data)=>{
          const cuerpo = 
          Object(data).map((Obj:any)=>{
              const datos = [
                Obj.idCliente,
                `${Obj.nombre} ${Obj.apellido1} ${Obj.apellido2}`,
                Obj.telefono,
                Obj.celular,
                Obj.correo
              ];
              return datos;
          });
          this.printSrv.print(encabezado, cuerpo, 'Listado de clientes', true)
          //env impresion
        },
        error:(err)=>{}
      });
  }

  onCerrar(){

  }

  ngAfterViewInit(): void {
    this.filtro = { idCliente: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
    // this.cargarPagina();
  }

}
