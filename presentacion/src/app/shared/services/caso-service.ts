import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs';
import { TipoCaso } from '../models/interfaces';
import { environment } from '../../../environments/environment';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class CasoService {
  private readonly http = inject(HttpClient);

  constructor() {}

  filtrar(parametros: any, pagina: number = 0, limite: number = 5) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/caso/filtrar/${pagina}/${limite}`, { params });
  }

  obtenerNumeroRegistros(parametros: any) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<number>(`${_SERVER}/api/caso/numRegs`, { params });
  }

  guardar(datos: TipoCaso, id?: number): Observable<TipoCaso> {
    delete datos.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/caso/${id}`, datos).pipe(
        catchError(this.handleError)
      );
    } else {
      return this.http.post<any>(`${_SERVER}/api/caso`, datos).pipe(
        catchError(this.handleError)
      );
    }
  }

  buscar(id: number): Observable<TipoCaso> {
    return this.http.get<TipoCaso>(`${_SERVER}/api/caso/read/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/caso/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  eliminarConHistorial(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/caso/${id}/completo`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  cambiarEstado(id: number, estado: number, descripcion: string, idResponsable?: string): Observable<any> {
    const body = { 
      estado, 
      descripcion,
      idResponsable: idResponsable
    };
    
    return this.http.post(`${_SERVER}/api/caso/estado/${id}`, body).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  obtenerHistorialCaso(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${_SERVER}/api/caso/historial/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}
