USE taller;
DELIMITER $$

DROP PROCEDURE IF EXISTS buscarOficinista$$
CREATE PROCEDURE buscarOficinista (_id INT, _idOficinista VARCHAR(15))
BEGIN
    SELECT * FROM oficinista WHERE id = _id OR idOficinista = _idOficinista;
END$$

DROP PROCEDURE IF EXISTS filtrarOficinista$$
CREATE PROCEDURE filtrarOficinista (
    _parametros VARCHAR(250),
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    SELECT cadenaFiltro(_parametros, 'idOficinista&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT * FROM oficinista WHERE ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS numRegsOficinista$$
CREATE PROCEDURE numRegsOficinista (_parametros VARCHAR(250))
BEGIN
    SELECT cadenaFiltro(_parametros, 'idOficinista&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT COUNT(id) FROM oficinista WHERE ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP FUNCTION IF EXISTS nuevoOficinista$$
CREATE FUNCTION nuevoOficinista (
    _idOficinista VARCHAR(15),
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
    -- Verificar si el ID ya existe en la tabla oficinista o en la tabla usuario
    SELECT COUNT(*) INTO _cant FROM (
        SELECT idOficinista AS id FROM oficinista WHERE idOficinista = _idOficinista
        UNION
        SELECT correo AS id FROM oficinista WHERE correo = _correo
        UNION
        SELECT idUsuario AS id FROM usuario WHERE idUsuario = _idOficinista
        UNION
        SELECT correo AS id FROM usuario WHERE correo = _correo
    ) AS duplicados;
    
    -- Si hay cualquier duplicado, devolver 1
    IF _cant > 0 THEN
        SET _cant = 1;
    END IF;
    
    IF _cant < 1 THEN
        INSERT INTO oficinista(idOficinista, nombre, apellido1, apellido2, telefono, 
                               celular, direccion, correo)
        VALUES (_idOficinista, _nombre, _apellido1, _apellido2, _telefono, 
                _celular, _direccion, _correo);
    END IF;
    RETURN _cant;
END$$

DROP FUNCTION IF EXISTS editarOficinista$$
CREATE FUNCTION editarOficinista (
    _id INT, 
    _idOficinista VARCHAR(15),
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
    IF NOT EXISTS(SELECT id FROM oficinista WHERE id = _id) THEN
        SET no_encontrado = 1;
    ELSE
        UPDATE oficinista SET
            idOficinista = _idOficinista,
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

DROP FUNCTION IF EXISTS eliminarOficinista$$
CREATE FUNCTION eliminarOficinista (_id INT(1)) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    DECLARE _idOficinista VARCHAR(15);
    SET _resp = 0;

    SELECT COUNT(id) INTO _cant FROM oficinista WHERE id = _id;
    IF _cant > 0 THEN
        -- Los oficinistas no tienen restricciones de dependencias en la tabla caso
        -- Se pueden eliminar directamente
        -- Obtener el idOficinista antes de eliminarlo
        SELECT idOficinista INTO _idOficinista FROM oficinista WHERE id = _id;
        -- Eliminar oficinista
        DELETE FROM oficinista WHERE id = _id;
        -- Eliminar usuario asociado
        DELETE FROM usuario WHERE idUsuario = _idOficinista;
        SET _resp = 1;
    END IF;

    RETURN _resp;
END$$

DROP TRIGGER IF EXISTS actualizar_Oficinista$$
CREATE TRIGGER actualizar_Oficinista AFTER UPDATE ON oficinista FOR EACH ROW
BEGIN
    UPDATE usuario
    SET idUsuario = NEW.idOficinista, 
        correo = NEW.correo
    WHERE idUsuario = OLD.idOficinista;
END$$

DROP TRIGGER IF EXISTS eliminar_Oficinista$$
CREATE TRIGGER eliminar_Oficinista AFTER DELETE ON oficinista FOR EACH ROW
BEGIN
    DELETE FROM usuario
    WHERE idUsuario = OLD.idOficinista;
END$$

DELIMITER ;
