USE taller;
DELIMITER $$

DROP PROCEDURE IF EXISTS buscarTecnico$$
CREATE PROCEDURE buscarTecnico (_id INT, _idTecnico VARCHAR(15))
BEGIN
    SELECT * FROM tecnico WHERE id = _id OR idTecnico = _idTecnico;
END$$

DROP PROCEDURE IF EXISTS filtrarTecnico$$
CREATE PROCEDURE filtrarTecnico (
    _parametros VARCHAR(250),
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    SELECT cadenaFiltro(_parametros, 'idTecnico&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT * FROM tecnico WHERE ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS numRegsTecnico$$
CREATE PROCEDURE numRegsTecnico (_parametros VARCHAR(250))
BEGIN
    SELECT cadenaFiltro(_parametros, 'idTecnico&nombre&apellido1&apellido2&') INTO @filtro;
    SELECT CONCAT("SELECT COUNT(id) FROM tecnico WHERE ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP FUNCTION IF EXISTS nuevoTecnico$$
CREATE FUNCTION nuevoTecnico (
    _idTecnico VARCHAR(15),
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
    -- Verificar si el ID ya existe en la tabla tecnico o en la tabla usuario
    SELECT COUNT(*) INTO _cant FROM (
        SELECT idTecnico AS id FROM tecnico WHERE idTecnico = _idTecnico
        UNION
        SELECT correo AS id FROM tecnico WHERE correo = _correo
        UNION
        SELECT idUsuario AS id FROM usuario WHERE idUsuario = _idTecnico
        UNION
        SELECT correo AS id FROM usuario WHERE correo = _correo
    ) AS duplicados;
    
    -- Si hay cualquier duplicado, devolver 1
    IF _cant > 0 THEN
        SET _cant = 1;
    END IF;
    
    IF _cant < 1 THEN
        INSERT INTO tecnico(idTecnico, nombre, apellido1, apellido2, telefono, 
                            celular, direccion, correo)
        VALUES (_idTecnico, _nombre, _apellido1, _apellido2, _telefono, 
                _celular, _direccion, _correo);
    END IF;
    RETURN _cant;
END$$

DROP FUNCTION IF EXISTS editarTecnico$$
CREATE FUNCTION editarTecnico (
    _id INT, 
    _idTecnico VARCHAR(15),
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
    IF NOT EXISTS(SELECT id FROM tecnico WHERE id = _id) THEN
        SET no_encontrado = 1;
    ELSE
        UPDATE tecnico SET
            idTecnico = _idTecnico,
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

DROP FUNCTION IF EXISTS eliminarTecnico$$
CREATE FUNCTION eliminarTecnico (_id INT(1)) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    DECLARE _idTecnico VARCHAR(15);
    SET _resp = 0;

    SELECT COUNT(id) INTO _cant FROM tecnico WHERE id = _id;
    IF _cant > 0 THEN
        -- Verificamos si tiene casos asignados
        SELECT COUNT(id) INTO _cant 
        FROM caso 
        WHERE idTecnico = (SELECT idTecnico FROM tecnico WHERE id = _id);
        
        IF _cant = 0 THEN
            -- Obtener el idTecnico antes de eliminarlo
            SELECT idTecnico INTO _idTecnico FROM tecnico WHERE id = _id;
            -- Eliminar técnico
            DELETE FROM tecnico WHERE id = _id;
            -- Eliminar usuario asociado
            DELETE FROM usuario WHERE idUsuario = _idTecnico;
            SET _resp = 1;
        ELSE
            SET _resp = 2;
        END IF;
    END IF;

    RETURN _resp;
END$$

DROP TRIGGER IF EXISTS actualizar_Tecnico$$
CREATE TRIGGER actualizar_Tecnico AFTER UPDATE ON tecnico FOR EACH ROW
BEGIN
    UPDATE usuario
    SET idUsuario = NEW.idTecnico, 
        correo = NEW.correo
    WHERE idUsuario = OLD.idTecnico;
END$$

DROP TRIGGER IF EXISTS eliminar_Tecnico$$
CREATE TRIGGER eliminar_Tecnico AFTER DELETE ON tecnico FOR EACH ROW
BEGIN
    DELETE FROM usuario
    WHERE idUsuario = OLD.idTecnico;
END$$

DELIMITER ;
