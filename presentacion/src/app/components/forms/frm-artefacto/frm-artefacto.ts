import { Component, inject, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ClienteService } from '../../../shared/services/cliente-service';
import { ArtefactoService } from '../../../shared/services/artefacto-service';
import { TipoArtefacto } from '../../../shared/models/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-frm-artefacto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './frm-artefacto.html',
})
export class FrmArtefacto implements OnInit, AfterViewInit {
  titulo!: string;
  clientes: any[] = [];
  clientesCargados = false;

  private readonly dialogRef = inject(MatDialogRef<FrmArtefacto>);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly clienteSrv = inject(ClienteService);
  private readonly artefactoSrv = inject(ArtefactoService);
  private readonly datos = inject(MAT_DIALOG_DATA) as { title: string, datos?: TipoArtefacto };
  private readonly cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    id: [0],
    idCliente: ['', Validators.required],
    serie: ['', [Validators.required, Validators.maxLength(45)]],
    marca: ['', [Validators.required, Validators.maxLength(45)]],
    modelo: ['', [Validators.required, Validators.maxLength(45)]],
    categoria: ['', [Validators.required, Validators.maxLength(45)]],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    this.titulo = this.datos.title;
  }

  ngAfterViewInit(): void {
    this.clienteSrv.listar().subscribe({
      next: (res) => {
        this.clientes = res;
        this.clientesCargados = true;
        this.cdr.markForCheck();
        // Si hay datos para editar, setéalos solo después de cargar clientes
        if (this.datos?.datos) {
          this.form.setValue({
            id: this.datos.datos.id ?? null,
            idCliente: this.datos.datos.idCliente,
            serie: this.datos.datos.serie,
            marca: this.datos.datos.marca,
            modelo: this.datos.datos.modelo,
            categoria: this.datos.datos.categoria,
            descripcion: this.datos.datos.descripcion,
          });
        }
      },
      error: (err) => {},
    });
  }

  guardar() {
    if (this.form.invalid) return;

    const artefacto = this.form.getRawValue() as TipoArtefacto;

    const peticion = this.datos?.datos
      ? this.artefactoSrv.guardar(artefacto, artefacto.id)
      : this.artefactoSrv.guardar(artefacto);

    peticion.subscribe({
      next: () => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: this.datos?.datos
              ? 'Artefacto modificado correctamente'
              : 'Artefacto agregado correctamente',
            icono: 'check',
            textoAceptar: 'Aceptar',
          },
        });
        this.dialogRef.close(true);
      },
      error: (err) => {},
    });
  }

  cerrar() {
    this.dialogRef.close(false);
  }

  get F() {
    return this.form.controls;
  }
}
