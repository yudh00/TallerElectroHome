<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

use PDO;

class Administrador extends Persona
{
    protected $container;
    private const ROL = 1; //Rol de administrador
    private const RECURSO = "Administrador"; // Recurso para las operaciones de búsqueda

    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args)
    {
        $sql = "SELECT * FROM administrador ";

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

        $response->getbody()->write(json_encode($res));
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
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $response
                ->withStatus(400)
                ->withHeader('Content-Type', 'application/json');
        }
        $status = $this->updateP(self::RECURSO, $body, $args['id']);
        return $response->withStatus($status);
    }


    public function delete(Request $request, Response $response, $args)
    {
        $sql = "SELECT eliminarAdministrador(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();
        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $status = match ($resp) {
            0 => 404,  // Administrador no encontrado
            1 => 200,  // Eliminado correctamente
            default => 500
        };

        $mensaje = match ($resp) {
            0 => 'Administrador no encontrado',
            1 => 'Administrador eliminado correctamente',
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

        // %idAdministrador%&%nombre%&%apellido1%&%apellido2%&
        $datos = $request->getQueryParams();
        $filtro = "%";
        foreach ($datos as $key => $value) {
            $filtro .= "$value%&%";
        }
        $filtro = substr($filtro, 0, -1);
        $sql = "CALL filtrarAdministrador('$filtro', {$args['pag']},{$args['lim']});";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();
        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;
        $query = null;
        $con = null;
        $response->getbody()->write(json_encode($res));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $resp = $this->buscarP(self::RECURSO, $args['id']);
        $response->getbody()->write(json_encode($resp['datos']));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($resp['status']);
    }
}
