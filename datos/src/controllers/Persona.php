<?php
namespace App\controllers;

use Psr\Container\ContainerInterface;

use PDO;

class Persona
{
    protected $container;
    public function __construct(ContainerInterface $c){
        $this->container = $c;
    }

    public function createP($recurso, $rol, $datos)
    {
        $sql = "SELECT nuevo$recurso(";
        foreach ($datos as $key => $value) {
            $sql .= ":$key,";
        }
        $sql = substr($sql, 0, -1) . ");";
        reset($datos);
        $claveId = key($datos);

        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        foreach ($datos as $key => $value) {
            $TIPO = gettype($value) == "integer" ? PDO::PARAM_INT : PDO::PARAM_STR;
            $value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);
            $query->bindValue($key, $value, $TIPO);
        };
        try {
            $query->execute();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 201,
                1 => 409,
            };
            if ($status == 201) {
                $id = $datos[$claveId];
                $sql = "SELECT nuevoUsuario(:idUsuario, :correo, :rol, :passw);";

                //Hash a la contraseña
                $passw = password_hash($id, PASSWORD_BCRYPT, ['cost' => 10]);

                $query = $con->prepare($sql);
                $query->bindValue(':idUsuario', $id, PDO::PARAM_STR);
                $query->bindValue(':correo', $datos['correo'], PDO::PARAM_STR);
                $query->bindValue(':rol', $rol, PDO::PARAM_INT);
                $query->bindValue(':passw', $passw, PDO::PARAM_STR);

                $query->execute();
                $resUsuario = $query->fetch(PDO::FETCH_NUM)[0];
                
                if ($resUsuario > 0) {
                    $status = 409;
                }
            }

            if ($status == 409 || $status == 500) {
                $con->rollBack();
            } else {
                $con->commit();
            }

        } catch (\PDOException $e) {
            $status = 500;
            $con->rollBack();
        }

        $query = null;
        $con = null;
        return $status;
    }

    public function updateP($recurso, $datos, $id)
    {
        // Validar que se recibieron datos válidos
        if (empty($datos) || !is_array($datos)) {
            return 400; 
        }
        
        $sql = "SELECT editar$recurso(:id,";
        foreach ($datos as $key => $value) {
            $sql .= ":$key,";
        }
        $sql = substr($sql, 0, -1) . ");";
        $con = $this->container->get('base_datos');
        $con->beginTransaction();
        $query = $con->prepare($sql);

        $query->bindValue(':id', filter_var($id, FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_INT);

        foreach ($datos as $key => $value) {
            $TIPO = gettype($value) == "integer" ? PDO::PARAM_INT : PDO::PARAM_STR;
            $value = filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);
            $query->bindValue($key, $value, $TIPO);
        };

        $status = 200;
        try {
            $query->execute();
            $con->commit();
            $res = $query->fetch(PDO::FETCH_NUM)[0];
            $status = match ($res) {
                0 => 200,
                1 => 404
            };

        } catch (\PDOException $e) {
            $status = $e->getCode() == 23000 ? 409 : 500;
            $con->rollBack();
        }

        $query = null;
        $con = null;

        return $status;
    }

    public function deleteP($recurso, $id)
    {
        $sql = "SELECT eliminar$recurso(:id);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue('id', $id, PDO::PARAM_INT);
        $query->execute();
        $resp = $query->fetch(PDO::FETCH_NUM)[0];
        $query = null;
        $con = null;

        $status = match ($resp) {
            0 => 404,  // No encontrado
            1 => 200,  // Eliminado correctamente
            2 => 409,  // Tiene dependencias
            default => 500
        };

        $mensaje = match ($resp) {
            0 => ucfirst(strtolower($recurso)) . ' no encontrado',
            1 => ucfirst(strtolower($recurso)) . ' eliminado correctamente',
            2 => 'No se puede eliminar el ' . strtolower($recurso) . ' porque tiene registros asociados',
            default => 'Error interno del servidor'
        };

        return ['status' => $status, 'mensaje' => $mensaje, 'codigo' => $resp];
    }

    public function filtrarP($recurso, $datos, $pag, $lim)
    {
        // %idCliente%&%nombre%&%apellido1%&%apellido2%&
        $filtro = "%";
        foreach ($datos as $key => $value) {
            $filtro .= "$value%&%";
        }
        $filtro = substr($filtro, 0, -1);


        $sql = "CALL filtrar$recurso('$filtro', $pag, $lim);";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        $query->execute();
        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;

        $query = null;
        $con = null;
        return ["datos" => $res, "status" => $status];
    }

        public function buscarP($recurso, $id)
    {
        $sql = "CALL buscar$recurso($id, '');";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();
        $res = $query->fetch(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 204;
        $query = null;
        $con = null;

        return ["datos" => $res, "status" => $status];

    }
}