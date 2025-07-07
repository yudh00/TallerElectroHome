import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CasoService } from '../../../shared/services/caso-service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-frm-historial-caso',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './frm-historial-caso.html',
  styleUrls: ['./frm-historial-caso.css']
})
export class FrmHistorialCaso implements OnInit {

  historial: any[] = [];
  cargando: boolean = false;
  error: string = '';

  constructor(
    private casoService: CasoService,
    private dialogRef: MatDialogRef<FrmHistorialCaso>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { idCaso: number, descripcionCaso: string, casoCompleto?: any }
  ) { }

  ngOnInit(): void {
    if (this.data.idCaso > 0) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();
    
    this.casoService.obtenerHistorialCaso(this.data.idCaso).subscribe({
      next: (response) => {
        try {
          if (Array.isArray(response) && response.length > 0) {
            this.historial = response;
          } else if (Array.isArray(response) && response.length === 0) {
            this.historial = [];
            this.error = 'No se encontró historial para este caso.';
          } else {
            this.historial = [];
            this.error = 'Formato de respuesta inválido del servidor.';
          }
        } catch (processingError) {
          this.error = 'Error procesando la respuesta del servidor.';
          this.historial = [];
        }
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        
        let errorMessage = 'Error al cargar el historial del caso.';
        
        if (err?.status === 401) {
          errorMessage = 'Error de autenticación. Por favor, inicie sesión nuevamente.';
        } else if (err?.status === 403) {
          errorMessage = 'No tiene permisos para ver el historial de este caso.';
        } else if (err?.status === 404) {
          errorMessage = 'El caso no existe o no se encontró.';
        } else if (err?.status === 0) {
          errorMessage = 'Error de conexión con el servidor. Verifique su conexión.';
        } else if (err?.status >= 500) {
          errorMessage = 'Error interno del servidor. Contacte al administrador.';
        } else {
          errorMessage = `Error del servidor (${err?.status || 'desconocido'}): ${err?.statusText || err?.message || 'Sin detalles'}`;
        }
        
        this.error = errorMessage;
        this.cargando = false;
        this.historial = [];
        this.cdr.detectChanges();
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0: return 'Ingresado';
      case 1: return 'Diagnóstico';
      case 2: return 'En espera de repuesto';
      case 3: return 'Reparado';
      case 4: return 'Entregado';
      default: return 'Desconocido';
    }
  }

  getEstadoClase(estado: number): string {
    switch (estado) {
      case 0: return 'badge-info';
      case 1: return 'badge-warning';
      case 2: return 'badge-secondary';
      case 3: return 'badge-success';
      case 4: return 'badge-primary';
      default: return 'badge-light';
    }
  }
}
