import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../shared/services/auth-service';
import { RouterModule } from '@angular/router';
import { FrmCambiarPassword } from '../forms/frm-cambiar-password/frm-cambiar-password';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatDividerModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  srvAuth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  logOut(){
    this.srvAuth.loggOut();
  }
  
  loggin(){
    
  }
  
  changePasswForm(){
    this.dialog.open(FrmCambiarPassword, {
      width: '500px',
      disableClose: true
    });
  }
}
