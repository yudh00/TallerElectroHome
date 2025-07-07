import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { MatDialog } from '@angular/material/dialog';

// Validador personalizado para confirmar contraseña
function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('passwN');
  const confirmPassword = control.get('confirmarPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'passwordMismatch': true };
  }
  return null;
}

@Component({
  selector: 'app-frm-cambiar-password',
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './frm-cambiar-password.html',
  styleUrl: './frm-cambiar-password.css'
})
export class FrmCambiarPassword {
  readonly dialogoRef = inject(MatDialogRef<FrmCambiarPassword>);
  private readonly dialog = inject(MatDialog);
  frmCambiarPassword: FormGroup;
  private builder = inject(FormBuilder);
  private srvAuth = inject(AuthService);
  public errorCambio = signal(false);
  public mensajeError = signal('');
  public cambiando = signal(false);

  constructor() {
    this.frmCambiarPassword = this.builder.group({
      passw: ['', [Validators.required, Validators.minLength(1)]],
      passwN: ['', [Validators.required, Validators.minLength(1)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  get F() {
    return this.frmCambiarPassword.controls;
  }

  onCambiarPassword() {
    if (this.frmCambiarPassword.invalid) {
      this.frmCambiarPassword.markAllAsTouched();
      return;
    }

    this.cambiando.set(true);
    this.errorCambio.set(false);
    this.mensajeError.set('');

    // Preparar datos para enviar al backend (solo passw y passwN)
    const datosEnvio = {
      passw: this.frmCambiarPassword.value.passw,
      passwN: this.frmCambiarPassword.value.passwN
    };

    this.srvAuth.cambiarPassword(datosEnvio).subscribe({
      next: (response) => {
        this.cambiando.set(false);
        this.dialog.open(DialogoGeneral, {
          data: {
            texto: 'Contraseña cambiada exitosamente',
            icono: 'check',
            textoAceptar: ' Aceptar ',
          },
        });
        this.dialogoRef.close(true);
      },
      error: (err) => {
        this.cambiando.set(false);
        this.errorCambio.set(true);
        
        let mensaje = 'Error al cambiar la contraseña';
        
        if (err === 401) {
          mensaje = 'La contraseña actual es incorrecta';
        } else if (err === 400) {
          mensaje = 'Datos inválidos. Verifique la información ingresada';
        } else if (err === 404) {
          mensaje = 'Usuario no encontrado';
        } else if (err >= 500) {
          mensaje = 'Error interno del servidor. Contacte al administrador';
        } else if (err === 0) {
          mensaje = 'Error de conexión con el servidor';
        }
        
        this.mensajeError.set(mensaje);
      }
    });
  }
}
