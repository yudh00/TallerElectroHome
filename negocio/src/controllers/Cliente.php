<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Cliente extends BaseController
{
    private const ENDPOINT = '/cliente';

    public function listar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/listar';
        return $this->forwardRequest($request, $response, $url);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function create(Request $request, Response $response, $args)
    {
        return $this->forwardRequest($request, $response, self::ENDPOINT);
    }

    public function update(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function filtrar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/filtrar/' . $args['pag'] . '/' . $args['lim'];
        return $this->forwardRequest($request, $response, $url);
    }
}
