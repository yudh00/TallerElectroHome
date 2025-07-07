import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, retry, tap } from 'rxjs';
import { Token } from './token';
import { IToken } from '../models/interfaces';
import { User } from '../models/User';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const _SERVER = environment.servidor;
const LIMITE_REFRESH = 20;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private srvToken = inject(Token);
  private router = inject(Router);
  //private usrActualSubject = new BehaviorSubject<User>(new User());
  //public userActualObs = this.usrActualSubject.asObservable();
  public userActualS = signal(new User);

  constructor() { }

  public login(datos : {idUsuario : '', passw : ''}) : Observable<any>{
    return this.http
      .patch<IToken>(`${_SERVER}/api/auth`, datos)
      .pipe(
        retry(1),
        tap((tokens)=>{
          this.doLogin(tokens)
          this.router.navigate(['/home']);
          //
        }),
        map(()=>true),
        catchError((error)=>{
          return of(error.status)
        })
      )
  }

  public loggOut(){
    if (this.isLoggedIn()) {
      this.http
        .delete(`${_SERVER}/api/auth/cerrar/${this.UserActual.idUsuario}`)
        .subscribe();
      this.doLoggOut();
      //this.router.navigate(['/login']);
    }
  }

  private doLogin(tokens : IToken){
    //guardar los tokens
    this.srvToken.setTokens(tokens);
    //actualizar datos globales para user y rol
    // this.usrActualSubject.next(this.UserActual);
    this.userActualS.set(this.UserActual);
  }

  private doLoggOut(){
    if (this.srvToken.token) {
      this.srvToken.eliminarTokens();
    }
    this.userActualS.set(this.UserActual);
    this.router.navigate(['/login']);
  }

  public isLoggedIn() : boolean{
    return !!this.srvToken.token && !this.srvToken.jwtTokenExp();
  }

  public get UserActual() : User{
    if (!this.srvToken.token) {
      return new User();
    }
    const tokenD = this.srvToken.decodeToken();
    return new User({idUsuario : tokenD.sub, nombre: tokenD.nom, rol : Number(tokenD.rol)})
  }

  public cambiarPassword(datos: { passw: string, passwN: string }): Observable<any> {
    const idUsuario = this.UserActual.idUsuario;
    return this.http
      .patch(`${_SERVER}/api/user/change/${idUsuario}`, datos)
      .pipe(
        retry(1),
        map(() => true),
        catchError((error) => {
          return of(error.status);
        })
      );
  }

  verificarRefresh():boolean{
    if (this.isLoggedIn()) {
      const tiempo = this.srvToken.tiempoExpToken();
      if (tiempo<=0) {
        this.loggOut();
        return false;
      }
      if (tiempo>0 && tiempo<= LIMITE_REFRESH) {
        this.srvToken.refrescarToken();
      }
      return true;
    }else{
      this.loggOut();
      return false;
    }
  }

}
