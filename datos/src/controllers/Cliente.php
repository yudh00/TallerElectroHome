<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use PDO;


class Cliente extends Persona
{
    private const ROL = 4;
    private const RECURSO = "Cliente";


    //new
    public function listar(Request $request, Response $response, $args)
    {
        $con = $this->container->get('base_datos');
        $sql = "SELECT idCliente, nombre, apellido1, apellido2 FROM cliente ORDER BY nombre ASC";
        $query = $con->prepare($sql);
        $query->execute();

        $clientes = $query->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($clientes));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }


    public function read(Request $request, Response $response, $args)
    {
        $sql = "SELECT * FROM cliente ";

        if (isset($args['id'])) {
            $sql .= "WHERE id = :id ";
        }

        $sql .= " LIMIT 0,5;";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        if (isset($args['id'])) {
            $query->execute(['id' => $args['id']]);
        } else {
            $query->execute();
        }

        $res = $query->fetchAll();

        $status = $query->rowCount() > 0 ? 200 : 204;

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($res));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    public function create(Request $request, Response $response, $args)
    {
        $rawBody = $request->getBody()->getContents();
        $request->getBody()->rewind();
        $body = json_decode($request->getBody(), true);
        $status = $this->createP(self::RECURSO, self::ROL, $body);

        return $response->withStatus($status);
    }

    public function update(Request $request, Response $response, $args)
    {
        $body = json_decode($request->getBody(), true);
        $status = $this->updateP(self::RECURSO, $body, $args['id']);
        return $response->withStatus($status);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $sql = "SELECT eliminarCliente(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();

        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $status = match ($resp) {
            0 => 404,  // Cliente no encontrado
            1 => 200,  // Eliminado correctamente
            2 => 409,  // Tiene artefactos asignados
            default => 500
        };

        $mensaje = match ($resp) {
            0 => 'Cliente no encontrado',
            1 => 'Cliente eliminado correctamente',
            2 => 'No se puede eliminar el cliente porque tiene artefactos registrados',
            default => 'Error interno del servidor'
        };

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode(['mensaje' => $mensaje, 'codigo' => $resp]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    public function filtrar(Request $request, Response $response, $args)
    {
        $datos = $request->getQueryParams();
        $resp = $this->filtrarP(self::RECURSO, $datos, $args['pag'], $args['lim']);
        $response->getBody()->write(json_encode($resp['datos']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($resp['status']);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $resp = $this->buscarP(self::RECURSO, $args['id']);
        $response->getBody()->write(json_encode($resp['datos']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($resp['status']);
    }
}
