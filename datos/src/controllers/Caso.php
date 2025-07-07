<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;
use PDOException;
use Exception;

class Caso
{
    protected $container;
    const RECURSO = "caso";

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args)
    {
        $sql = "CALL readCaso(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $idParam = isset($args['id']) ? (int) $args['id'] : null;
        $query->bindValue(':id', $idParam, PDO::PARAM_INT);

        $query->execute();
        $res = $query->fetchAll(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 204;
        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function create(Request $request, Response $response, $args)
    {
        $body = json_decode($request->getBody(), true);

        $sql = "SELECT nuevoCaso(:idCliente, :idTecnico, :idArtefacto, :descripcion, :fechaSalida);";
        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        // Bind parameters explicitly (sin fechaEntrada ya que el procedimiento usa CURDATE())
        $query->bindValue(':idCliente', $body['idCliente'], PDO::PARAM_STR);
        $query->bindValue(':idTecnico', $body['idTecnico'], PDO::PARAM_STR);
        $query->bindValue(':idArtefacto', $body['idArtefacto'], PDO::PARAM_INT);
        $query->bindValue(':descripcion', $body['descripcion'], PDO::PARAM_STR);
        $query->bindValue(':fechaSalida', $body['fechaSalida'] ?? null, PDO::PARAM_STR);

        try {
            $query->execute();
            $con->commit();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 201,
                1 => 409,
                default => 500
            };
        } catch (PDOException $e) {
            $status = 500;
            $con->rollBack();
        }

        $query = null;
        $con = null;
        return $response->withStatus($status);
    }

    public function update(Request $request, Response $response, $args)
    {
        $body = json_decode($request->getBody(), true);

        $sql = "SELECT editarCaso(:id, :idCliente, :idTecnico, :idArtefacto, :descripcion, :fechaSalida);";
        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        // Bind ID parameter
        $query->bindValue(':id', $args['id'], PDO::PARAM_INT);

        // Bind body parameters explicitly with null handling
        $query->bindValue(':idCliente', $body['idCliente'] ?? '', PDO::PARAM_STR);
        $query->bindValue(':idTecnico', $body['idTecnico'] ?? '', PDO::PARAM_STR);
        $query->bindValue(':idArtefacto', (int) ($body['idArtefacto'] ?? 0), PDO::PARAM_INT);
        $query->bindValue(':descripcion', $body['descripcion'] ?? '', PDO::PARAM_STR);

        // Handle fechaSalida - can be null
        if (isset($body['fechaSalida']) && !empty($body['fechaSalida'])) {
            $query->bindValue(':fechaSalida', $body['fechaSalida'], PDO::PARAM_STR);
        } else {
            $query->bindValue(':fechaSalida', null, PDO::PARAM_NULL);
        }

        try {
            $query->execute();
            $con->commit();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 200,
                1 => 404,
                default => 500
            };
        } catch (PDOException $e) {
            $status = 500;
            $con->rollBack();
        }

        $query = null;
        $con = null;
        return $response->withStatus($status);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $sql = "SELECT eliminarCaso(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();
        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $status = match ($resp) {
            0 => 404, // Caso no encontrado
            1 => 200, // Eliminado correctamente
            2 => 409  // Tiene historial, no se puede eliminar
        };

        $query = null;
        $con = null;

        // Enviar información adicional sobre el resultado
        $mensaje = match ($resp) {
            0 => 'Caso no encontrado',
            1 => 'Caso eliminado correctamente',
            2 => 'El caso tiene historial de cambios de estado y no puede ser eliminado'
        };

        $response->getBody()->write(json_encode(['mensaje' => $mensaje, 'codigo' => $resp]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function deleteConHistorial(Request $request, Response $response, $args)
    {
        $sql = "SELECT eliminarCasoConHistorial(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();
        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $status = match ($resp) {
            0 => 404, // Caso no encontrado
            1 => 200  // Eliminado correctamente con historial
        };

        $query = null;
        $con = null;

        $mensaje = match ($resp) {
            0 => 'Caso no encontrado',
            1 => 'Caso y su historial eliminados correctamente'
        };

        $response->getBody()->write(json_encode(['mensaje' => $mensaje, 'codigo' => $resp]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function filtrar(Request $request, Response $response, $args)
    {
        $datos = $request->getQueryParams();
        $filtro = "%";

        // Mapear nombres de frontend a backend
        $mapa = [
            'cliente' => 'idCliente',
            'tecnico' => 'idTecnico',
            'descripcion' => 'descripcion',
            'marca' => 'marca',
            'modelo' => 'modelo'
        ];

        // Construir filtro para los campos
        foreach ($mapa as $frontend => $backend) {
            $valor = isset($datos[$frontend]) ? $datos[$frontend] : '';
            $filtro .= "$valor%&%";
        }
        $filtro = substr($filtro, 0, -1); // Remover último %&%

        $sql = "CALL filtrarCaso('$filtro', {$args['pag']}, {$args['lim']});";

        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();
        $res = $query->fetchAll(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 204;

        $query = null;
        $con = null;
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function numRegs(Request $request, Response $response, $args)
    {
        $datos = $request->getQueryParams();
        $filtro = "%";

        // Mapear nombres de frontend a backend
        $mapa = [
            'cliente' => 'idCliente',
            'tecnico' => 'idTecnico',
            'descripcion' => 'descripcion',
            'marca' => 'marca',
            'modelo' => 'modelo'
        ];

        // Construir filtro para los campos
        foreach ($mapa as $frontend => $backend) {
            $valor = isset($datos[$frontend]) ? $datos[$frontend] : '';
            $filtro .= "$valor%&%";
        }
        $filtro = substr($filtro, 0, -1); // Remover último %&%

        $sql = "CALL numRegsCaso('$filtro');";

        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();
        $res = $query->fetch(PDO::FETCH_NUM)[0];

        $query = null;
        $con = null;
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $sql = "CALL buscarCaso(:id, 0);"; // 0 como valor dummy si no se usa idArtefacto
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();
        $res = $query->fetchAll(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 404;
        $query = null;
        $con = null;
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function cambiarEstado(Request $request, Response $response, $args)
    {
        try {

            // Obtener el cuerpo de la solicitud
            $rawBody = $request->getBody()->getContents();

            // Decodificar el JSON
            $body = json_decode($rawBody, true);

            // Validar que el body no esté vacío
            if (!$body) {
                $response->getBody()->write(json_encode(['error' => 'Datos JSON inválidos']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }

            // Validar campos requeridos
            if (!isset($body['estado']) || !isset($body['descripcion']) || !isset($body['idResponsable'])) {
                $response->getBody()->write(json_encode(['error' => 'Faltan campos requeridos: estado, descripcion, idResponsable']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }

            // Obtener parámetros
            $idCaso = (int) $args['id'];
            $nuevoEstado = (int) $body['estado'];
            $descripcion = $body['descripcion'];
            $idResponsable = $body['idResponsable'];

            if (empty(trim($idResponsable))) {
                $response->getBody()->write(json_encode(['error' => 'Se requiere un técnico responsable válido']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }

            $con = $this->container->get('base_datos');

            // Verificar que el responsable sea un técnico existente
            $sqlVerificar = "SELECT COUNT(*) FROM tecnico WHERE idTecnico = :idTecnico;";
            $queryVerificar = $con->prepare($sqlVerificar);
            $queryVerificar->bindValue(':idTecnico', $idResponsable, PDO::PARAM_STR);
            $queryVerificar->execute();
            $tecnicoExiste = $queryVerificar->fetch(PDO::FETCH_NUM)[0];

            if ($tecnicoExiste == 0) {
                $response->getBody()->write(json_encode(['error' => 'El técnico especificado no existe']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }

            // Ejecutar el procedimiento
            $sql = "SELECT cambiarEstadoCaso(:idCaso, :nuevoEstado, :idResponsable, :descripcion) as resultado;";
            $query = $con->prepare($sql);

            $query->bindValue(':idCaso', $idCaso, PDO::PARAM_INT);
            $query->bindValue(':nuevoEstado', $nuevoEstado, PDO::PARAM_INT);
            $query->bindValue(':idResponsable', $idResponsable, PDO::PARAM_STR);
            $query->bindValue(':descripcion', $descripcion, PDO::PARAM_STR);

            $query->execute();
            $result = $query->fetch(PDO::FETCH_ASSOC);

            if (!$result) {
                throw new PDOException("No se obtuvo resultado del procedimiento almacenado");
            }

            $mensaje = $result['resultado'];

            $query = null;
            $con = null;


            $response->getBody()->write(json_encode(['mensaje' => $mensaje, 'success' => true]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);

        } catch (PDOException $e) {
            $response->getBody()->write(json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error interno: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }


    public function consultarEstado(Request $request, Response $response, $args)
    {
        $sql = "SELECT consultarEstadoCaso(:idCaso);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('idCaso', $args['id'], PDO::PARAM_INT);
        $query->execute();
        $res = $query->fetch(PDO::FETCH_NUM)[0];

        $query = null;
        $con = null;
        $response->getBody()->write(json_encode(['historial' => $res]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function obtenerHistorial(Request $request, Response $response, $args)
    {
        $sql = "SELECT 
                    h.id,
                    h.idCaso,
                    h.idResponsable,
                    h.estado,
                    CASE h.estado
                        WHEN 0 THEN 'Ingresado'
                        WHEN 1 THEN 'Diagnóstico'
                        WHEN 2 THEN 'En espera de repuesto'
                        WHEN 3 THEN 'Reparado'
                        WHEN 4 THEN 'Entregado'
                        ELSE 'Desconocido'
                    END as estadoTexto,
                    h.fechaCambio,
                    h.descripcion,
                    COALESCE(t.nombre, h.idResponsable) as nombreResponsable
                FROM historialCaso h
                LEFT JOIN tecnico t ON h.idResponsable = t.idTecnico
                WHERE h.idCaso = :idCaso
                ORDER BY h.fechaCambio DESC;";

        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue('idCaso', $args['id'], PDO::PARAM_INT);
            $query->execute();
            $res = $query->fetchAll(PDO::FETCH_ASSOC);
            $status = $query->rowCount() > 0 ? 200 : 204;

            $query = null;
            $con = null;


            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Content-Type', 'application/json')->withStatus($status);

        } catch (PDOException $e) {
            $response->getBody()->write(json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
}
