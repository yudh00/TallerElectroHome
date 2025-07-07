<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Artefacto extends BaseController
{
    public function listar(Request $request, Response $response, $args)
    {
        $result = $this->makeRequest('GET', '/artefacto/listar');
        return $this->sendResponse($response, $result);
    }

    public function read(Request $request, Response $response, $args)
    {
        $id = $args['id'] ?? '';
        $endpoint = '/artefacto/read' . ($id ? '/' . $id : '');
        $result = $this->makeRequest('GET', $endpoint);
        return $this->sendResponse($response, $result);
    }

    public function buscar(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $result = $this->makeRequest('GET', '/artefacto/' . $id);
        return $this->sendResponse($response, $result);
    }

    public function create(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody(), true);
        $result = $this->makeRequest('POST', '/artefacto', $data);
        return $this->sendResponse($response, $result);
    }

    public function update(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $data = json_decode($request->getBody(), true);
        $result = $this->makeRequest('PUT', '/artefacto/' . $id, $data);
        return $this->sendResponse($response, $result);
    }

    public function delete(Request $request, Response $response, $args)
    {
        $id = $args['id'];
        $result = $this->makeRequest('DELETE', '/artefacto/' . $id);
        return $this->sendResponse($response, $result);
    }

    public function filtrar(Request $request, Response $response, $args)
    {
        $pag = $args['pag'];
        $lim = $args['lim'];
        $queryParams = $request->getQueryParams();
        $result = $this->makeRequest('GET', '/artefacto/filtrar/' . $pag . '/' . $lim, null, $queryParams);
        return $this->sendResponse($response, $result);
    }
}
