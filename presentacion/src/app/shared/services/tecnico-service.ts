import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, retry, throwError, tap } from 'rxjs';
import { TipoTecnico } from '../models/interfaces';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private readonly http = inject(HttpClient);

  constructor() {}

  filtrar(parametros: any) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/tecnico/filtrar/0/5`, { params });
  }

  guardar(datos: TipoTecnico, id?: number): Observable<TipoTecnico> {
    delete datos.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/tecnico/${id}`, datos).pipe(
        catchError(this.handleError)
      );
    }
    return this.http.post<any>(`${_SERVER}/api/tecnico`, datos).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number) {
    return this.http.delete(`${_SERVER}/api/tecnico/${id}`, { 
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        try {
          const body = response.body ? JSON.parse(response.body) : null;
          return {
            status: response.status,
            data: body
          };
        } catch (parseError) {
          return {
            status: response.status,
            data: { mensaje: 'Error en la respuesta del servidor', codigo: -1 }
          };
        }
      }),
      catchError((error) => {
        return throwError(() => ({
          status: error.status || 500,
          data: { mensaje: 'Error de conexión', codigo: -1 }
        }));
      })
    );
  }

  buscar(id: number) {
    return this.http.get<TipoTecnico>(`${_SERVER}/api/tecnico/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  listar() {
    return this.http.get<TipoTecnico[]>(`${_SERVER}/api/tecnico/listar`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}
// This service provides methods to manage technicians, including filtering, saving, deleting, and searching for technicians.