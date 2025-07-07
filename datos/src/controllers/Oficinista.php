<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use PDO;

class Oficinista extends Persona
{
    private const ROL = 2;
    private const RECURSO = "Oficinista";

    public function read(Request $request, Response $response, $args)
    {
        $sql = "SELECT * FROM oficinista ";
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
        $sql = "SELECT eliminarOficinista(:id);";
        $con = $this->container->get('base_datos');

        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();

        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $status = match ($resp) {
            0 => 404,  // Oficinista no encontrado
            1 => 200,  // Eliminado correctamente
            default => 500
        };

        $mensaje = match ($resp) {
            0 => 'Oficinista no encontrado',
            1 => 'Oficinista eliminado correctamente',
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
