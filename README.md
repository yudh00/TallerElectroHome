# Sistema de Gestión de Taller de Reparaciones

## Descripción

Sistema web para la gestión integral de un taller de reparaciones, desarrollado como proyecto académico para el curso de **Lenguajes para Aplicaciones Comerciales**.

## Características Principales

- **Gestión de Usuarios**: Administradores, oficinistas, técnicos y clientes
- **Control de Acceso**: Sistema de roles y permisos diferenciados
- **Gestión de Casos**: Creación, seguimiento y actualización de casos de reparación
- **Historial de Estados**: Trazabilidad completa de cambios en los casos
- **Gestión de Artefactos**: Registro y control de equipos en reparación
- **Reportes**: Generación de reportes e impresión de listados

## Arquitectura

### Frontend
- **Angular 18+** con TypeScript
- **Angular Material** para componentes UI
- **Tailwind CSS** para estilos
- Arquitectura por componentes con servicios dedicados

### Backend
- **Capa de Datos** (Puerto 8000): API REST con PHP y Slim Framework
- **Capa de Negocio** (Puerto 9000): Proxy transparente para escalabilidad
- **Base de Datos**: MySQL con procedimientos almacenados

### Infraestructura
- **Docker Compose** para orquestación de servicios
- Contenedores separados para cada capa
- Configuración de red interna para comunicación entre servicios

## Roles de Usuario

1. **Administrador**: Acceso completo al sistema
2. **Oficinista**: Gestión de casos y usuarios (excepto administradores)
3. **Técnico**: Consulta y cambio de estado de casos asignados
4. **Cliente**: Consulta de sus propios casos

## Tecnologías Utilizadas

- Angular 18
- TypeScript
- PHP 8
- MySQL 8
- Docker & Docker Compose
- Slim Framework
- Angular Material
- Tailwind CSS

## Instalación y Ejecución

1. Clonar el repositorio
2. Ejecutar `docker-compose up -d` en el directorio raíz
3. Acceder a la aplicación en `http://localhost:4200`

## Puertos de Servicio

- **Frontend**: 4200
- **Capa de Negocio**: 9000
- **Capa de Datos**: 8000
- **Base de Datos**: 3306

## Autor

**Yudhansell Paniagua Montenegro**  
Estudiante del curso de Lenguajes para Aplicaciones Comerciales

---

