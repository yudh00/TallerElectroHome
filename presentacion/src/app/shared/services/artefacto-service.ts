// src/app/services/artefacto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoArtefacto } from '../models/interfaces';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class ArtefactoService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros: any) {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/artefacto/filtrar/0/5`, { params });
  }

  guardar(datos: TipoArtefacto, id?: number): Observable<TipoArtefacto> {
    
    delete datos.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/artefacto/${id}`, datos);
    }
    return this.http.post<any>(`${_SERVER}/api/artefacto`, datos);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/artefacto/${id}`).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  buscar(id: number) {
    return this.http.get<TipoArtefacto>(`${_SERVER}/api/artefacto/read/${id}`);
  }

  listar() {
    return this.http.get<TipoArtefacto[]>(`${_SERVER}/api/artefacto/listar`);
  }

  private handleError(error: any) {
    return throwError(() => {
      return error.status;
    });
  }
}
