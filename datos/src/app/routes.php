<?php
namespace App\controllers;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

$app->get('/', function (Request $request, Response $response, $args) {

});

$app->group('/api', function (RouteCollectorProxy $api) {

    $api->group('/artefacto', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/listar', Artefacto::class . ':listar');
        $endpoint->get('/read[/{id}]', Artefacto::class . ':read');
        $endpoint->get('/{id}', Artefacto::class . ':buscar');
        $endpoint->post('', Artefacto::class . ':create');
        $endpoint->put('/{id}', Artefacto::class . ':update');
        $endpoint->delete('/{id}', Artefacto::class . ':delete');
        $endpoint->get('/filtrar/{pag}/{lim}', Artefacto::class . ':filtrar');
    });


    $api->group('/caso', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/read[/{id}]', Caso::class . ':read');
        $endpoint->get('/filtrar/{pag}/{lim}', Caso::class . ':filtrar');
        $endpoint->get('/numRegs', Caso::class . ':numRegs');
        $endpoint->get('/estado/{id}', Caso::class . ':consultarEstado');
        $endpoint->get('/historial/{id}', Caso::class . ':obtenerHistorial');
        $endpoint->post('/estado/{id}', Caso::class . ':cambiarEstado');

        $endpoint->get('/{id}', Caso::class . ':buscar');
        $endpoint->post('', Caso::class . ':create');
        $endpoint->put('/{id}', Caso::class . ':update');
        $endpoint->delete('/{id}', Caso::class . ':delete');
        $endpoint->delete('/{id}/completo', Caso::class . ':deleteConHistorial');
    });


    $api->group('/cliente', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/listar', Cliente::class . ':listar');
        $endpoint->get('/{id}', Cliente::class . ':buscar');
        $endpoint->post('', Cliente::class . ':create');
        $endpoint->put('/{id}', Cliente::class . ':update');
        $endpoint->delete('/{id}', Cliente::class . ':delete');
        $endpoint->get('/filtrar/{pag}/{lim}', Cliente::class . ':filtrar');
    });

    $api->group('/administrador', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/read[/{id}]', Administrador::class . ':read');
        $endpoint->get('/{id}', Administrador::class . ':buscar');
        $endpoint->post('', Administrador::class . ':create');
        $endpoint->put('/{id}', Administrador::class . ':update');
        $endpoint->delete('/{id}', Administrador::class . ':delete');
        $endpoint->get('/filtrar/{pag}/{lim}', Administrador::class . ':filtrar');
    });

    $api->group('/oficinista', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/read[/{id}]', Oficinista::class . ':read');
        $endpoint->get('/{id}', Oficinista::class . ':buscar');
        $endpoint->post('', Oficinista::class . ':create');
        $endpoint->put('/{id}', Oficinista::class . ':update');
        $endpoint->delete('/{id}', Oficinista::class . ':delete');
        $endpoint->get('/filtrar/{pag}/{lim}', Oficinista::class . ':filtrar');
    });

    $api->group('/tecnico', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/listar', Tecnico::class . ':listar');
        $endpoint->get('/read[/{id}]', Tecnico::class . ':read');
        $endpoint->get('/{id}', Tecnico::class . ':buscar');
        $endpoint->post('', Tecnico::class . ':create');
        $endpoint->put('/{id}', Tecnico::class . ':update');
        $endpoint->delete('/{id}', Tecnico::class . ':delete');
        $endpoint->get('/filtrar/{pag}/{lim}', Tecnico::class . ':filtrar');
    });

    $api->group('/user', function (RouteCollectorProxy $endpoint) {
        $endpoint->get('/{id}', Usuario::class . ':buscar');
        $endpoint->patch('/reset/{idUsuario}', Usuario::class . ':resetPassw');
        $endpoint->patch('/change/{idUsuario}', Usuario::class . ':changePassw');
        $endpoint->patch('/rol/{idUsuario}', Usuario::class . ':changeRol');
    });

    $api->group('/auth', function (RouteCollectorProxy $endpoint) {
        $endpoint->patch('', Auth::class . ':iniciar');
        $endpoint->patch('/refrescar', Auth::class . ':refrescar');
        $endpoint->delete('/{idUsuario}', Auth::class . ':cerrar');
    });


});