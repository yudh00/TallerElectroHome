<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Administrador extends BaseController
{
    private const ENDPOINT = '/administrador';

    public function read(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/read';
        if (isset($args['id'])) {
            $url .= '/' . $args['id'];
        }
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
        $queryString = $this->buildQueryString($request->getQueryParams());
        $url .= $queryString;
        return $this->forwardRequest($request, $response, $url);
    }
}
