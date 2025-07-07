import { AfterViewInit, Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { TipoArtefacto } from '../../shared/models/interfaces';
import { ArtefactoService } from '../../shared/services/artefacto-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmArtefacto } from '../forms/frm-artefacto/frm-artefacto';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';
import { InfoArtefacto } from '../forms/info-artefacto/info-artefacto';

@Component({
  selector: 'app-artefacto',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './artefacto.html',
  styleUrl: './artefacto.css',
})
export class Artefacto implements AfterViewInit {
  private readonly artefactoSrv = inject(ArtefactoService);
  private readonly dialogo = inject(MatDialog);
  public readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);

  public paginaActual = 0;
  public tamanoPagina = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('fserie') serieInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fmarca') marcaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fmodelo') modeloInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fcategoria') categoriaInput!: ElementRef<HTMLInputElement>;
  panelOpenState = signal(false);

  columnas: string[] = [
    'serie', 'marca', 'modelo', 'categoria', 'descripcion', 'botonera'
  ];

  datos: any;
  dataSource = signal(new MatTableDataSource<TipoArtefacto>());
  filtro: any;
  filtroP = signal({ serie: '', marca: '', modelo: '', categoria: '' });
  totalRegistros = signal(0);

  mostrarDialogo(titulo: string, datos?: TipoArtefacto) {
    const dialogoRef = this.dialogo.open(FrmArtefacto, {
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
    this.filtro = { serie: '', marca: '', modelo: '', categoria: '' };
    this.filtrar();
  }

  filtrar() {
    this.artefactoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource.set(data);
      },
      error: (err) => {},
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Artefacto');
  }

  limpiar() {
    this.resetearFiltro();
    
    // Limpiar los campos de filtro usando ViewChild de forma segura
    if (this.serieInput?.nativeElement) {
      this.serieInput.nativeElement.value = '';
    }
    if (this.marcaInput?.nativeElement) {
      this.marcaInput.nativeElement.value = '';
    }
    if (this.modeloInput?.nativeElement) {
      this.modeloInput.nativeElement.value = '';
    }
    if (this.categoriaInput?.nativeElement) {
      this.categoriaInput.nativeElement.value = '';
    }
  }

  onEditar(id: number) {
    this.artefactoSrv.buscar(id).subscribe({
      next: (data) => {
        // data es un array, pasa el primer elemento si existe
        const artefacto = Array.isArray(data) ? data[0] : data;
        this.mostrarDialogo('Editar Artefacto', artefacto);
      },
    });
  }

  onInfo(id: number) {
    this.artefactoSrv.buscar(id).subscribe({
      next: (data) => {
        // Si data es array, tomar el primer elemento
        const datosArtefacto = Array.isArray(data) ? data[0] : data;
        const dialogRef = this.dialogo.open(InfoArtefacto, {
          width: '50vw',
          maxWidth: '35rem',
          data: {
            title: 'Información del Artefacto',
            datos: datosArtefacto,
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

  onEliminar(id: number) {
    const dialogRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: '¿Eliminar artefacto seleccionado?',
        icono: 'question_mark',
        textoAceptar: 'Si',
        textoCancelar: 'No',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.artefactoSrv.eliminar(id).subscribe({
          next: (response) => {
            const mensaje = response?.mensaje || 'Artefacto eliminado correctamente';
            this.dialogo.open(DialogoGeneral, {
              data: {
                texto: mensaje,
                icono: 'check',
                textoAceptar: 'Aceptar',
              },
            });
            this.filtrar();
          },
          error: (err) => {
            let mensaje = 'Error al eliminar el artefacto. Por favor, intente nuevamente.';
            
            const statusCode = err.status || err;
            if (statusCode === 404) {
              mensaje = 'El artefacto no fue encontrado o ya fue eliminado.';
            } else if (statusCode === 409) {
              mensaje = 'No se puede eliminar el artefacto porque tiene casos asignados.';
            } else if (statusCode >= 500) {
              mensaje = 'Error interno del servidor. Contacte al administrador del sistema.';
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
    const encabezado = ['Serie', 'Marca', 'Modelo', 'Categoría', 'Descripción'];
    this.artefactoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => [
          obj.serie, obj.marca, obj.modelo, obj.categoria, obj.descripcion
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de artefactos', true);
      },
      error: (err) => {},
    });
  }


  ngAfterViewInit(): void {
    this.filtro = { serie: '', marca: '', modelo: '', categoria: '' };
    this.filtrar();
  }
}
