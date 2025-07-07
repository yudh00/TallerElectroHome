USE taller;

DELIMITER $$


DROP PROCEDURE IF EXISTS buscarAdministrador$$
CREATE PROCEDURE buscarAdministrador (_id INT, _idAdministrador VARCHAR(15))
BEGIN
    SELECT * FROM administrador WHERE id = _id OR idAdministrador = _idAdministrador;
END$$


DROP PROCEDURE IF EXISTS filtrarAdministrador$$
CREATE PROCEDURE filtrarAdministrador (
    _parametros VARCHAR(250), -- %idAdministrador%&%nombre%&%apellido1%&%apellido2%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    SELECT cadenaFiltro(_parametros, 'idAdministrador&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT * FROM administrador WHERE ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$


DROP PROCEDURE IF EXISTS numRegsAdministrador$$
CREATE PROCEDURE numRegsAdministrador (
    _parametros VARCHAR(250))
BEGIN
    SELECT cadenaFiltro(_parametros, 'idAdministrador&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT COUNT(id) FROM administrador WHERE ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$


DROP FUNCTION IF EXISTS nuevoAdministrador$$
CREATE FUNCTION nuevoAdministrador (
    _idAdministrador VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _direccion VARCHAR(255),
    _correo VARCHAR(100))
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    -- Verificar si el ID ya existe en la tabla administrador o en la tabla usuario
    SELECT COUNT(*) INTO _cant FROM (
        SELECT idAdministrador AS id FROM administrador WHERE idAdministrador = _idAdministrador
        UNION
        SELECT correo AS id FROM administrador WHERE correo = _correo
        UNION
        SELECT idUsuario AS id FROM usuario WHERE idUsuario = _idAdministrador
        UNION
        SELECT correo AS id FROM usuario WHERE correo = _correo
    ) AS duplicados;
    
    -- Si hay cualquier duplicado, devolver 1
    IF _cant > 0 THEN
        SET _cant = 1;
    END IF;
    
    IF _cant < 1 THEN
        INSERT INTO administrador(idAdministrador, nombre, apellido1, apellido2, telefono, 
                                  celular, direccion, correo)
        VALUES (_idAdministrador, _nombre, _apellido1, _apellido2, _telefono, 
                _celular, _direccion, _correo);
    END IF;
    RETURN _cant;
END$$


DROP FUNCTION IF EXISTS editarAdministrador$$
CREATE FUNCTION editarAdministrador (
    _id INT, 
    _idAdministrador VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _direccion VARCHAR(255),
    _correo VARCHAR(100))
RETURNS INT(1)
BEGIN
    DECLARE no_encontrado INT DEFAULT 0;
    IF NOT EXISTS(SELECT id FROM administrador WHERE id = _id) THEN
        SET no_encontrado = 1;
    ELSE
        UPDATE administrador SET
            idAdministrador = _idAdministrador,
            nombre = _nombre,
            apellido1 = _apellido1,
            apellido2 = _apellido2,
            telefono = _telefono,
            celular = _celular,
            direccion = _direccion,
            correo = _correo
        WHERE id = _id;
    END IF;
    RETURN no_encontrado;
END$$


DROP FUNCTION IF EXISTS eliminarAdministrador$$
CREATE FUNCTION eliminarAdministrador (_id INT(1)) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    DECLARE _idAdministrador VARCHAR(15);
    SET _resp = 0;
    
    SELECT COUNT(id) INTO _cant FROM administrador WHERE id = _id;
    IF _cant > 0 THEN
        -- Los administradores no tienen restricciones de dependencias en la tabla caso
        -- Se pueden eliminar directamente
        -- Obtener el idAdministrador antes de eliminarlo
        SELECT idAdministrador INTO _idAdministrador FROM administrador WHERE id = _id;
        -- Eliminar administrador
        DELETE FROM administrador WHERE id = _id;
        -- Eliminar usuario asociado
        DELETE FROM usuario WHERE idUsuario = _idAdministrador;
        SET _resp = 1;
    END IF;

    RETURN _resp;
END$$


DROP TRIGGER IF EXISTS actualizar_Administrador$$
CREATE TRIGGER actualizar_Administrador AFTER UPDATE ON administrador FOR EACH ROW
BEGIN
    UPDATE usuario
    SET idUsuario = NEW.idAdministrador, 
        correo = NEW.correo
    WHERE idUsuario = OLD.idAdministrador;
END$$

DROP FUNCTION IF EXISTS eliminarAdministradorPorId$$
CREATE FUNCTION eliminarAdministradorPorId (_idAdministrador VARCHAR(15)) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    SET _resp = 0;
    
    SELECT COUNT(id) INTO _cant FROM administrador WHERE idAdministrador = _idAdministrador;
    IF _cant > 0 THEN
        -- Los administradores no tienen restricciones de dependencias en la tabla caso
        -- Se pueden eliminar directamente
        DELETE FROM administrador WHERE idAdministrador = _idAdministrador;
        SET _resp = 1;
    END IF;

    RETURN _resp;
END$$

DROP TRIGGER IF EXISTS eliminar_Administrador$$
CREATE TRIGGER eliminar_Administrador AFTER DELETE ON administrador FOR EACH ROW
BEGIN
    DELETE FROM usuario
    WHERE idUsuario = OLD.idAdministrador;
END$$

DELIMITER ;
