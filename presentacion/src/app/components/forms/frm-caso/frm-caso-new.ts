import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ClienteService } from '../../../shared/services/cliente-service';
import { ArtefactoService } from '../../../shared/services/artefacto-service';
import { TecnicoService } from '../../../shared/services/tecnico-service';
import { CasoService } from '../../../shared/services/caso-service';
import { TipoCaso } from '../../../shared/models/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-frm-caso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './frm-caso.html',
})
export class FrmCaso implements OnInit {
  titulo!: string;
  clientes: any[] = [];
  tecnicos: any[] = [];
  artefactos: any[] = [];
  clientesCargados = false;
  tecnicosCargados = false;
  artefactosCargados = false;

  private readonly dialogRef = inject(MatDialogRef<FrmCaso>);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly clienteSrv = inject(ClienteService);
  private readonly tecnicoSrv = inject(TecnicoService);
  private readonly artefactoSrv = inject(ArtefactoService);
  private readonly casoSrv = inject(CasoService);
  private readonly datos = inject(MAT_DIALOG_DATA) as { title: string, datos?: TipoCaso };

  form = this.fb.group({
    id: [0],
    idCliente: ['', Validators.required],
    idTecnico: ['', Validators.required],
    idArtefacto: [0, Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    fechaEntrada: [new Date(), Validators.required],
    fechaSalida: [null as Date | null],
  });

  ngOnInit(): void {
    this.titulo = this.datos.title;

    // Cargar clientes
    this.clienteSrv.listar().subscribe({
      next: (res) => {
        this.clientes = res;
        this.clientesCargados = true;
        this.verificarYCargarDatos();
      },
      error: (err) => {},
    });

    // Cargar técnicos
    this.tecnicoSrv.listar().subscribe({
      next: (res) => {
        this.tecnicos = res;
        this.tecnicosCargados = true;
        this.verificarYCargarDatos();
      },
      error: (err) => {},
    });

    // Cargar artefactos
    this.artefactoSrv.listar().subscribe({
      next: (res) => {
        this.artefactos = res;
        this.artefactosCargados = true;
        this.verificarYCargarDatos();
      },
      error: (err) => {},
    });
  }

  verificarYCargarDatos() {
    if (this.clientesCargados && this.tecnicosCargados && this.artefactosCargados) {
      if (this.datos?.datos) {
        this.form.patchValue({
          id: this.datos.datos.id ?? 0,
          idCliente: this.datos.datos.idCliente,
          idTecnico: this.datos.datos.idTecnico,
          idArtefacto: this.datos.datos.idArtefacto,
          descripcion: this.datos.datos.descripcion,
          fechaEntrada: new Date(this.datos.datos.fechaEntrada),
          fechaSalida: this.datos.datos.fechaSalida ? new Date(this.datos.datos.fechaSalida) : null,
        });
      }
    }
  }

  guardar() {
    if (this.form.invalid) return;

    const formData = this.form.getRawValue();
    
    const caso: TipoCaso = {
      id: formData.id || undefined,
      idCliente: formData.idCliente || '',
      idTecnico: formData.idTecnico || '',
      idArtefacto: formData.idArtefacto || 0,
      descripcion: formData.descripcion || '',
      fechaEntrada: formData.fechaEntrada?.toISOString().split('T')[0] || '',
      fechaSalida: formData.fechaSalida?.toISOString().split('T')[0] || undefined,
    };

    const peticion = this.datos?.datos
      ? this.casoSrv.guardar(caso, caso.id)
      : this.casoSrv.guardar(caso);

    peticion.subscribe({
      next: () => {
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: this.datos?.datos
              ? 'Caso modificado correctamente'
              : 'Caso agregado correctamente',
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
