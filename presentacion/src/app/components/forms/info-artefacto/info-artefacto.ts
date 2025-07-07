import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TipoArtefacto } from '../../../shared/models/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-info-artefacto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './info-artefacto.html',
  styleUrl: './info-artefacto.css',
})
export class InfoArtefacto implements OnInit {
  titulo!: string;

  private readonly dialogRef = inject(MatDialogRef<InfoArtefacto>);
  private readonly fb = inject(FormBuilder);
  private readonly datos = inject(MAT_DIALOG_DATA) as { title: string, datos?: TipoArtefacto };

  form = this.fb.group({
    id: [{ value: 0, disabled: true }],
    idCliente: [{ value: '', disabled: true }],
    serie: [{ value: '', disabled: true }],
    marca: [{ value: '', disabled: true }],
    modelo: [{ value: '', disabled: true }],
    categoria: [{ value: '', disabled: true }],
    descripcion: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    this.titulo = this.datos.title;
    
    // Cargar los datos del artefacto si existen
    if (this.datos?.datos) {
      this.form.patchValue({
        id: this.datos.datos.id ?? 0,
        idCliente: this.datos.datos.idCliente ?? '',
        serie: this.datos.datos.serie ?? '',
        marca: this.datos.datos.marca ?? '',
        modelo: this.datos.datos.modelo ?? '',
        categoria: this.datos.datos.categoria ?? '',
        descripcion: this.datos.datos.descripcion ?? '',
      });
    }
  }

  get F() {
    return this.form.controls;
  }

  onCerrar() {
    this.dialogRef.close(false);
  }
}
