import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { OficinistaService } from '../../../shared/services/oficinista-service';

@Component({
  selector: 'app-frm-oficinista',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './frm-oficinista.html',
  styleUrl: './frm-oficinista.css',
})
export class FrmOficinista implements OnInit {
  titulo!: string;
  srvOficinista = inject(OficinistaService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<FrmOficinista>);
  private builder = inject(FormBuilder);
  myForm!: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idOficinista: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(15),
          Validators.pattern('^[A-Za-z0-9]+$'), // Solo letras y números
        ],
      ],
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^[A-Za-zÑñáéíóúÁÉÍÓÚ ]+$'),
        ],
      ],
      apellido1: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^[A-Za-zÑñáéíóúÁÉÍÓÚ ]+$'),
        ],
      ],
      apellido2: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
          Validators.pattern('^[A-Za-zÑñáéíóúÁÉÍÓÚ ]+$'),
        ],
      ],
      telefono: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(9),
          Validators.pattern('^[0-9]+$'), // Solo números
        ],
      ],
      celular: [
        '',
        [
          Validators.minLength(8),
          Validators.maxLength(9),
          Validators.pattern('^[0-9]*$'), // Solo números, opcional
        ],
      ],
      direccion: [
        '',
        [
          Validators.maxLength(255)
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\\.[a-zA-Z]{2,}$'), // Solo letras, números, puntos y @
        ],
      ],
    });
  }

  get F() {
    return this.myForm.controls;
  }

  onGuardar() {
    if (this.myForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      this.myForm.markAllAsTouched();
      return;
    }

    if (this.myForm.value.id === 0) {
      this.srvOficinista.guardar(this.myForm.value).subscribe({
        next: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Oficinista agregado correctamente',
              icono: 'check',
              textoAceptar: ' Aceptar ',
            },
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          let mensaje = 'Error al agregar el oficinista';
          
          if (err === 409) {
            mensaje = 'Ya existe un usuario registrado con el mismo ID o correo electrónico en el sistema';
          } else if (err === 400) {
            mensaje = 'Datos inválidos. Verifique la información ingresada';
          } else if (err >= 500) {
            mensaje = 'Error interno del servidor. Contacte al administrador';
          }
          
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: mensaje,
              icono: 'error',
              textoAceptar: ' Aceptar ',
            },
          });
        },
      });
    } else {
      this.srvOficinista
        .guardar(this.myForm.value, this.myForm.value.id)
        .subscribe({
          next: () => {
            this.dialog.open(DialogoGeneral, {
              data: {
                texto: 'Oficinista modificado correctamente',
                icono: 'check',
                textoAceptar: ' Aceptar ',
              },
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            let mensaje = 'Error al modificar el oficinista';
            
            if (err === 409) {
              mensaje = 'Ya existe un usuario registrado con el mismo ID o correo electrónico en el sistema';
            } else if (err === 400) {
              mensaje = 'Datos inválidos. Verifique la información ingresada';
            } else if (err === 404) {
              mensaje = 'Oficinista no encontrado';
            } else if (err >= 500) {
              mensaje = 'Error interno del servidor. Contacte al administrador';
            }
            
            this.dialog.open(DialogoGeneral, {
              data: {
                texto: mensaje,
                icono: 'error',
                textoAceptar: ' Aceptar ',
              },
            });
          },
        });
    }
  }

  ngOnInit(): void {
    this.titulo = this.data.title;
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idOficinista: this.data.datos.idOficinista,
        nombre: this.data.datos.nombre,
        apellido1: this.data.datos.apellido1,
        apellido2: this.data.datos.apellido2,
        telefono: this.data.datos.telefono,
        celular: this.data.datos.celular,
        direccion: this.data.datos.direccion,
        correo: this.data.datos.correo,
      });
    }
  }
}
