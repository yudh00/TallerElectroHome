<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

use PDO;
class Artefacto
{
    protected $container;
    public function __construct(ContainerInterface $c)
    {
        $this->container = $c;
    }

    public function listar(Request $request, Response $response, $args)
    {
        $con = $this->container->get('base_datos');
        $sql = "SELECT id, serie, marca, modelo, categoria FROM artefacto ORDER BY marca ASC, modelo ASC";
        $query = $con->prepare($sql);
        $query->execute();
        $artefactos = $query->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($artefactos));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function read(Request $request, Response $response, $args)
    {
        $sql = "SELECT * FROM artefacto ";
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

        $body = json_decode($request->getBody());

        $sql = "SELECT nuevoArtefacto(:idCliente, :serie, :modelo, :marca, :categoria, :descripcion);";

        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        foreach ($body as $key => $value) {
            $TIPO = gettype($value) == "integer" ? PDO::PARAM_INT : PDO::PARAM_STR;

            $value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);

            $query->bindValue($key, $value, $TIPO);
        }
        ;
        try {
            $query->execute();
            $con->commit();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 201,
                1 => 409,
                2 => 428
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
        $body = json_decode($request->getBody());
        $sql = "SELECT editarArtefacto(:id, :serie, :modelo, :marca, :categoria, :descripcion);";
        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        $value = filter_var($args['id'], FILTER_SANITIZE_SPECIAL_CHARS);

        $query->bindValue(':id', $value, PDO::PARAM_INT);
        $campos = ['serie', 'modelo', 'marca', 'categoria', 'descripcion'];
        foreach ($campos as $campo) {
            $valor = filter_var($body->$campo, FILTER_SANITIZE_SPECIAL_CHARS);
            $query->bindValue(":$campo", $valor, PDO::PARAM_STR);
        }
        ;

        try {
            $query->execute();
            $con->commit();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 404,
                1 => 200,
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

        $sql = "SELECT eliminarArtefacto(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $args['id'], PDO::PARAM_INT);
        $query->execute();

        $resp = $query->fetch(PDO::FETCH_NUM)[0];

        $status = match ($resp) {
            0 => 404,  // Artefacto no encontrado
            1 => 200,  // Eliminado correctamente
            2 => 409,  // Tiene casos asignados
            default => 500
        };

        $mensaje = match ($resp) {
            0 => 'Artefacto no encontrado',
            1 => 'Artefacto eliminado correctamente',
            2 => 'No se puede eliminar el artefacto porque tiene casos asignados',
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
        // %serie%&%modelo%&%marca%&%categoria%&

        $datos = $request->getQueryParams();
        $filtro = "%";
        foreach ($datos as $key => $value) {
            $filtro .= "$value%&%";
        }
        $filtro = substr($filtro, 0, -1);

        $sql = "CALL filtrarArtefacto('$filtro', {$args['pag']},{$args['lim']});";

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
        $sql = "SELECT * FROM artefacto WHERE id = :id LIMIT 1;";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
        $query->execute();

        $res = $query->fetch(PDO::FETCH_ASSOC);
        $status = $res ? 200 : 404;

        $query = null;
        $con = null;

        $response->getBody()->write(json_encode($res));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
