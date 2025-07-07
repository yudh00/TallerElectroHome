<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Auth extends BaseController
{
    private const ENDPOINT = '/auth';

    public function iniciar(Request $request, Response $response, $args)
    {
        return $this->forwardRequest($request, $response, self::ENDPOINT);
    }

    public function refrescar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/refrescar';
        return $this->forwardRequest($request, $response, $url);
    }

    public function cerrar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/cerrar/' . $args['idUsuario'];
        return $this->forwardRequest($request, $response, $url);
    }
}