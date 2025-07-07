<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

abstract class BaseController
{
    protected $dataServiceUrl = 'http://web_datos:80/api';

    protected function makeRequest($method, $endpoint, $data = null, $queryParams = [])
    {
        $url = $this->dataServiceUrl . $endpoint;
        
        // Agregar query parameters si existen
        if (!empty($queryParams)) {
            $url .= '?' . http_build_query($queryParams);
        }

        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);

        switch (strtoupper($method)) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                if ($data) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'PUT':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
                if ($data) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
            case 'PATCH':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
                if ($data) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'GET':
            default:
                // GET es el default, no necesita configuración adicional
                break;
        }

        $responseData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return [
                'success' => false,
                'error' => $error,
                'httpCode' => 500
            ];
        }

        return [
            'success' => true,
            'data' => $responseData,
            'httpCode' => $httpCode
        ];
    }

    protected function sendResponse(Response $response, $result)
    {
        $response = $response->withStatus($result['httpCode']);
        
        if ($result['success']) {
            $response->getBody()->write($result['data']);
        } else {
            $response->getBody()->write(json_encode(['error' => $result['error']]));
        }
        
        return $response->withHeader('Content-Type', 'application/json');
    }

    protected function forwardRequest(Request $request, Response $response, $endpoint)
    {
        $method = $request->getMethod();
        $data = null;
        
        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $body = $request->getBody()->getContents();
            $data = json_decode($body, true);
        }
        
        $result = $this->makeRequest($method, $endpoint, $data);
        return $this->sendResponse($response, $result);
    }

    protected function buildQueryString($params)
    {
        if (empty($params)) {
            return '';
        }
        return '?' . http_build_query($params);
    }
}
