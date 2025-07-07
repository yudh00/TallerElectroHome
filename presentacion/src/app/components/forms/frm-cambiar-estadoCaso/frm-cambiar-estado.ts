import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CasoService } from '../../../shared/services/caso-service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-frm-cambiar-estado',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './frm-cambiar-estado.html',
  styleUrls: ['./frm-cambiar-estado.css']
})
export class FrmCambiarEstado implements OnInit {

  form: FormGroup;
  cargando: boolean = false;
  error: string = '';

  estados = [
    { valor: 0, texto: 'Ingresado', descripcion: 'Caso recién ingresado al sistema' },
    { valor: 1, texto: 'Diagnóstico', descripcion: 'En proceso de diagnóstico' },
    { valor: 2, texto: 'En espera de repuesto', descripcion: 'Esperando repuestos para reparación' },
    { valor: 3, texto: 'Reparado', descripcion: 'Reparación completada' },
    { valor: 4, texto: 'Entregado', descripcion: 'Entregado al cliente' }
  ];

  constructor(
    private fb: FormBuilder,
    private casoService: CasoService,
    private dialogRef: MatDialogRef<FrmCambiarEstado>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public datos: { 
      idCaso: number, 
      descripcionCaso: string, 
      estadoActual?: number,
      idTecnico?: string 
    }
  ) {
    this.form = this.fb.group({
      nuevoEstado: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Si hay un estado actual, seleccionar el siguiente lógico
    if (this.datos.estadoActual !== undefined) {
      const siguienteEstado = Math.min(this.datos.estadoActual + 1, 4);
      this.form.patchValue({
        nuevoEstado: siguienteEstado
      });
      // Autocompletar descripción inicial
      this.autocompletarDescripcion(siguienteEstado);
    }
  }

  onEstadoChange(nuevoEstado: number): void {
    this.autocompletarDescripcion(nuevoEstado);
    this.cdr.detectChanges(); // Forzar actualización del contenedor visual
  }

  private autocompletarDescripcion(nuevoEstado: number): void {
    const estadoSeleccionado = this.estados.find(e => e.valor === nuevoEstado);
    if (estadoSeleccionado) {
      const descripcionActual = this.form.get('descripcion')?.value || '';
      
      // Solo autocompletar si el campo está vacío o contiene solo la descripción base del estado anterior
      const esDescripcionVacia = !descripcionActual.trim();
      const esDescripcionBaseDiferente = this.estados.some(e => 
        e.descripcion === descripcionActual && e.valor !== nuevoEstado
      );
      
      if (esDescripcionVacia || esDescripcionBaseDiferente) {
        this.form.patchValue({
          descripcion: estadoSeleccionado.descripcion
        });
      } else if (!descripcionActual.includes(estadoSeleccionado.descripcion)) {
        // Si ya hay texto personalizado, agregar la descripción del estado como sugerencia
        this.form.patchValue({
          descripcion: `${descripcionActual.trim()} - ${estadoSeleccionado.descripcion}`
        });
      }
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.cargando = true;
      this.error = '';
      this.cdr.detectChanges(); // Forzar detección de cambios

      const formData = this.form.value;
      // Usar idTecnico como responsable
      const idResponsable = this.datos.idTecnico;
      
      this.casoService.cambiarEstado(
        this.datos.idCaso,
        formData.nuevoEstado,
        formData.descripcion,
        idResponsable
      ).subscribe({
        next: (response) => {
          this.cargando = false;
          this.cdr.detectChanges();
          this.dialogRef.close(true); // Cerrar con éxito
        },
        error: (err) => {
          
          // Mostrar mensaje de error más específico
          let errorMessage = 'Error al cambiar el estado del caso.';
          if (err.status === 0) {
            errorMessage = 'No se puede conectar al servidor. Verifique su conexión.';
          } else if (err.status === 401) {
            errorMessage = 'No tiene permisos para realizar esta acción.';
          } else if (err.status === 404) {
            errorMessage = 'El caso no fue encontrado.';
          } else if (err.status === 500) {
            errorMessage = 'Error interno del servidor. Intente nuevamente.';
          } else if (err.error && err.error.error) {
            errorMessage = err.error.error;
          }
          this.error = errorMessage;
          this.cargando = false;
          this.cdr.detectChanges(); // Forzar detección de cambios
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getEstadoTexto(valor: number): string {
    const estado = this.estados.find(e => e.valor === valor);
    return estado ? estado.texto : 'Desconocido';
  }

  getEstadoDescripcion(valor: number): string {
    const estado = this.estados.find(e => e.valor === valor);
    return estado ? estado.descripcion : '';
  }
}
