import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Cliente } from './components/cliente/cliente';
import { Administrador } from './components/administrador/administrador';
import { Tecnico } from './components/tecnico/tecnico';
import { Oficinista } from './components/oficinista/oficinista';
import { Casos } from './components/casos/casos';
import { Artefacto } from './components/artefacto/artefacto';
import { Page404 } from './components/page404/page404';
import { Login } from './components/login/login';
import { authGuard } from './shared/helpers/guards/auth-guard';
import { Role } from './shared/models/role';
import { loguinGuard } from './shared/helpers/guards/loguin-guard';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full' },
    {path: 'home', component: Home },
    {path: 'cliente', component: Cliente,
        canActivate : [authGuard], 
        data : {
            roles : [Role.Admin, Role.Oficinista]
        }
    },
    {path: 'administrador', component: Administrador,
        canActivate : [authGuard],
        data : {
            roles : [Role.Admin]
        }
    },
    {path: 'tecnico', component: Tecnico,
        canActivate : [authGuard],
        data : {
            roles : [Role.Admin, Role.Oficinista]
        }
    },
    {path: 'oficinista', component: Oficinista,
        canActivate : [authGuard],
        data : {
            roles : [Role.Admin]
        }
    },
    {path: 'casos', component: Casos,
        canActivate : [authGuard],
        data : {
            roles : [Role.Admin, Role.Oficinista, Role.Tecnico, Role.Cliente]
        }
    },
    {path: 'artefacto', component: Artefacto,
        canActivate : [authGuard],
        data : {
            roles : [Role.Admin, Role.Oficinista]
        }
    },
    {path: 'login', component: Login},
    {path: '**', component: Page404}
];
