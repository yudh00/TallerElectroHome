<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;

use PDO;

class Usuario extends Autenticar
{

    private function editarUsuario(string $idUsuario, int $rol = -1, string $passw = "")
    {
        $sql = $rol == -1 ? "CALL passwUsuario(:idUsuario, :passw);" : "CALL rolUsuario(:idUsuario, :rol);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue(':idUsuario', $idUsuario, PDO::PARAM_STR);
        if ($passw != "") {
            $query->bindValue(':passw', $passw, PDO::PARAM_STR);
        } else {
            $query->bindValue(':rol', $rol, PDO::PARAM_INT);
        }
        $query->execute();
        $afec = $query->rowCount();
        $query = null;
        $con = null;
        return $afec;
    }

    public function changePassw(Request $request, Response $response, $args)
    {
        $body = json_decode($request->getBody());
        if ($this->autenticar($args['idUsuario'], $body->passw, true)) {
            $passwN = password_hash($body->passwN, PASSWORD_BCRYPT, ['cost' => 10]);
            //$passwN= $body->passwN; //borrar
            $resp = $this->editarUsuario(idUsuario: $args['idUsuario'], passw: $passwN);
            $status = 200;
        } else {
            $status = 401;
        }
        return $response->withStatus($status);
    }

    public function resetPassw(Request $request, Response $response, $args)
    {
        $passwN = password_hash($args['idUsuario'], PASSWORD_BCRYPT, ['cost' => 10]);
        $status = $this->editarUsuario(idUsuario: $args['idUsuario'], passw: $passwN)
            == 0 ? 404 : 200;
        return $response->withStatus($status);
    }

    public function changeRol(Request $request, Response $response, $args)
    {
        $body = json_decode($request->getBody());
        $status = $this->editarUsuario(idUsuario: $args['idUsuario'], rol: $body->rol)
            == 0 ? 404 : 200;
        return $response->withStatus($status);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $sql = "CALL buscarUsuario('$id', '');";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        $query->execute();
        $res = $query->fetch(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 204;
        $query = null;
        $con = null;

        $response->getbody()->write(json_encode($res));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}