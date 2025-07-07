export interface TipoCliente {
  id?: number,
  idCliente: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoAdministrador {
  id?: number,
  idAdministrador: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoTecnico {
  id?: number,
  idTecnico: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoOficinista {
  id?: number,
  idOficinista: string,
  nombre: string,
  apellido1: string,
  apellido2: string,
  telefono: string,
  celular: string,
  direccion: string,
  correo: string
};

export interface TipoArtefacto {
  id?: number;
  idCliente: string;
  serie: string;
  marca: string;
  modelo: string;
  categoria: string;
  descripcion: string;
};
export interface IToken{
  token : string,
  tkRef : string
}
export interface PageCliente {
  contenido: TipoCliente[];
  total:     number;
}

export interface TipoCaso {
  id?: number;
  idCliente: string;
  nombreCliente?: string;
  idTecnico: string;
  nombreTecnico?: string;
  idArtefacto: number;
  marcaArtefacto?: string;
  modeloArtefacto?: string;
  serieArtefacto?: string;
  descripcion: string;
  fechaEntrada: string | Date;
  fechaSalida?: string | Date | null;
};

export interface ServiceResponse {
  status: number;
  data: any;
}