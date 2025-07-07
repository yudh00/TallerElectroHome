import { inject, Injectable } from '@angular/core';
import { IToken } from '../models/interfaces';
import {JwtHelperService} from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Token {
  private  readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private http = inject(HttpClient);

  private refrescando = false;
  
  constructor() { }
  setToken(token : string) : void{
    localStorage.setItem(this.JWT_TOKEN, token);
  }
  setRefreshToken(token : string) : void{
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }
  setTokens(token : IToken) : void{
    this.setToken(token.token);
    this.setRefreshToken(token.tkRef);
  }

  get token() : any {
    return localStorage.getItem(this.JWT_TOKEN);
  }
  get RefreshToken() : string | null{
    return localStorage.getItem(this.REFRESH_TOKEN);  
  }

  eliminarTokens(){
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }

  decodeToken() : any{
    const helper = new JwtHelperService();
    return helper.decodeToken(this.token);
  }

  jwtTokenExp(): boolean | Promise<boolean>{
    const helper = new JwtHelperService();
    return helper.isTokenExpired(this.token);
  }

  tiempoExpToken(){
    return this.decodeToken().exp - (Date.now()/1000);
  }

  refrescarToken(){
    if (!this.refrescando) {
      this.refrescando=true;
      return this.http.patch<IToken>(`${environment.servidor}/api/auth/refresh`,
      {
        idUsuario: (this.decodeToken().sub),
        tkRef : this.RefreshToken
      })
      .subscribe(
        tokens=>{
          this.setTokens(tokens);
          this.refrescando=false;
        }
      )
    }
    return false;
  }
}