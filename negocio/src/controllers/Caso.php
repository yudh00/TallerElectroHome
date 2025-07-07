<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Caso extends BaseController
{
    private const ENDPOINT = '/caso';

    public function read(Request $request, Response $response, $args)
    {
        $id = isset($args['id']) ? '/' . $args['id'] : '';
        $url = self::ENDPOINT . '/read' . $id;
        return $this->forwardRequest($request, $response, $url);
    }

    public function filtrar(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/filtrar/' . $args['pag'] . '/' . $args['lim'];
        $queryString = $this->buildQueryString($request->getQueryParams());
        $url .= $queryString;
        return $this->forwardRequest($request, $response, $url);
    }

    public function numRegs(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/numRegs';
        $queryString = $this->buildQueryString($request->getQueryParams());
        $url .= $queryString;
        return $this->forwardRequest($request, $response, $url);
    }

    public function consultarEstado(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/estado/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function obtenerHistorial(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/historial/' . $args['id'];
        return $this->forwardRequest($request, $response, $url);
    }

    public function cambiarEstado(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/estado/' . $args['id'];
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

    public function deleteConHistorial(Request $request, Response $response, $args)
    {
        $url = self::ENDPOINT . '/' . $args['id'] . '/completo';
        return $this->forwardRequest($request, $response, $url);
    }
}