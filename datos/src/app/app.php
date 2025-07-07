<?php
use Slim\Factory\AppFactory;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

$container = new Container();
AppFactory::SetContainer($container);
$app = AppFactory::create();
require 'config.php';

$app->add(new Tuupola\Middleware\JwtAuthentication([
  "secure" => false,
  "path" => ["/api"],
  "ignore" => ["/api/auth"],
  "secret" => ["acme" => $container->get('key')],
  "algorithm" => ["acme" => "HS256"],
]));

require 'conexion.php';
require 'routes.php';

$app->run();