<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Usuario extends BaseController
{
    private const ENDPOINT = '/user';

    public function buscar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function resetPassw(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/reset/' . $args['idUsuario'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function changePassw(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/change/' . $args['idUsuario'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function changeRol(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/rol/' . $args['idUsuario'];
        return $this->forwardRequest($request, $response, $url);
    }
}