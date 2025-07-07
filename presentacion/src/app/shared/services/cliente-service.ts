import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { PageCliente, TipoCliente, ServiceResponse } from '../models/interfaces';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const _SERVER = environment.servidor;
@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros: any) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/cliente/filtrar/0/5`, { params });
  }
  

  guardar(datos: TipoCliente, id?: number): Observable<TipoCliente> {
    delete datos.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/cliente/${id}`, datos).pipe(
        catchError(this.handleError)
      );
    }
    return this.http.post<any>(`${_SERVER}/api/cliente`, datos).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<ServiceResponse> {
    return this.http.delete(`${_SERVER}/api/cliente/${id}`, { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        try {
          const body = response.body ? JSON.parse(response.body) : null;
          return {
            status: response.status,
            data: body
          } as ServiceResponse;
        } catch (parseError) {
          return {
            status: response.status,
            data: { mensaje: 'Error en la respuesta del servidor', codigo: -1 }
          } as ServiceResponse;
        }
      }),
      catchError((error) => {
        return throwError(() => ({
          status: error.status || 500,
          data: { mensaje: 'Error de conexión', codigo: -1 }
        } as ServiceResponse));
      })
    );
  }

  buscar(id: number) {
    return this.http.get<TipoCliente>(`${_SERVER}/api/cliente/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    return throwError(() => {
      return error.status;
    });
  }

  listar() {
  return this.http.get<any[]>(`${_SERVER}/api/cliente/listar`);
  }

  
}