import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-info-oficinista',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './info-oficinista.html',
  styleUrl: './info-oficinista.css',
})
export class InfoOficinista implements OnInit {
  titulo!: string;
  private data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<InfoOficinista>);
  private builder = inject(FormBuilder);
  myForm!: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [{ value: 0, disabled: true }],
      idOficinista: [{ value: '', disabled: true }],
      nombre: [{ value: '', disabled: true }],
      apellido1: [{ value: '', disabled: true }],
      apellido2: [{ value: '', disabled: true }],
      telefono: [{ value: '', disabled: true }],
      celular: [{ value: '', disabled: true }],
      direccion: [{ value: '', disabled: true }],
      correo: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.titulo = this.data.title;
    
    if (this.data.datos) {
      this.myForm.patchValue(this.data.datos);
    }
  }

  get F() {
    return this.myForm.controls;
  }

  onCerrar() {
    this.dialogRef.close(false);
  }
}
