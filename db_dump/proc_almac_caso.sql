USE taller;
SET GLOBAL log_bin_trust_function_creators = 1;
DELIMITER $$

DROP PROCEDURE IF EXISTS filtrarCaso$$
CREATE PROCEDURE filtrarCaso (
    _parametros VARCHAR(250), -- %idCliente%&%idTecnico%&%descripcion%&%marca%&%modelo%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    DECLARE _offset INT;
    SET _offset = _pagina * _cantRegs;
    
    -- Query base con JOIN para obtener datos expandidos
    SET @base_query = "
        SELECT 
            c.id,
            c.idCliente,
            CONCAT(cl.nombre, ' ', cl.apellido1, ' ', cl.apellido2) AS nombreCliente,
            c.idTecnico,
            CONCAT(t.nombre, ' ', t.apellido1, ' ', t.apellido2) AS nombreTecnico,
            c.idArtefacto,
            a.marca AS marcaArtefacto,
            a.modelo AS modeloArtefacto,
            a.serie AS serieArtefacto,
            c.descripcion,
            c.fechaEntrada,
            c.fechaSalida
        FROM caso c
        LEFT JOIN artefacto a ON c.idArtefacto = a.id
        LEFT JOIN cliente cl ON c.idCliente = cl.idCliente
        LEFT JOIN tecnico t ON c.idTecnico = t.idTecnico
    ";
    
    -- Si hay parámetros de filtro, construir la condición WHERE
    IF _parametros IS NOT NULL AND _parametros != '' AND _parametros != '%' THEN
        -- Parsear parámetros: %idCliente%&%idTecnico%&%descripcion%&%marca%&%modelo%&
        SET @where_conditions = '';
        SET @param_parts = _parametros;
        
        -- Extraer cada parámetro
        SET @idCliente = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 1), '%', -2));
        SET @idTecnico = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 2), '%', -2));
        SET @descripcion = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 3), '%', -2));
        SET @marca = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 4), '%', -2));
        SET @modelo = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 5), '%', -2));
        
        SET @where_conditions = ' WHERE 1=1 ';
        
        IF @idCliente IS NOT NULL AND @idCliente != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.idCliente LIKE "%', @idCliente, '%" ');
        END IF;
        
        IF @idTecnico IS NOT NULL AND @idTecnico != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.idTecnico LIKE "%', @idTecnico, '%" ');
        END IF;
        
        IF @descripcion IS NOT NULL AND @descripcion != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.descripcion LIKE "%', @descripcion, '%" ');
        END IF;
        
        IF @marca IS NOT NULL AND @marca != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND a.marca LIKE "%', @marca, '%" ');
        END IF;
        
        IF @modelo IS NOT NULL AND @modelo != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND a.modelo LIKE "%', @modelo, '%" ');
        END IF;
        
        SET @base_query = CONCAT(@base_query, @where_conditions);
    END IF;
    
    -- Agregar ORDER BY y LIMIT
    SET @final_query = CONCAT(@base_query, ' ORDER BY c.id DESC LIMIT ', _offset, ', ', _cantRegs);
    
    PREPARE stmt FROM @final_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Procedimiento para contar registros filtrados con datos expandidos
DROP PROCEDURE IF EXISTS numRegsCaso$$
CREATE PROCEDURE numRegsCaso (
    _parametros VARCHAR(250))
BEGIN
    -- Query base para contar
    SET @base_query = "
        SELECT COUNT(c.id)
        FROM caso c
        LEFT JOIN artefacto a ON c.idArtefacto = a.id
        LEFT JOIN cliente cl ON c.idCliente = cl.idCliente
        LEFT JOIN tecnico t ON c.idTecnico = t.idTecnico
    ";
    
    -- Si hay parámetros de filtro, construir la condición WHERE
    IF _parametros IS NOT NULL AND _parametros != '' AND _parametros != '%' THEN
        -- Parsear parámetros: %idCliente%&%idTecnico%&%descripcion%&%marca%&%modelo%&
        SET @where_conditions = '';
        SET @param_parts = _parametros;
        
        -- Extraer cada parámetro
        SET @idCliente = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 1), '%', -2));
        SET @idTecnico = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 2), '%', -2));
        SET @descripcion = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 3), '%', -2));
        SET @marca = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 4), '%', -2));
        SET @modelo = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@param_parts, '&', 5), '%', -2));
        
        SET @where_conditions = ' WHERE 1=1 ';
        
        IF @idCliente IS NOT NULL AND @idCliente != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.idCliente LIKE "%', @idCliente, '%" ');
        END IF;
        
        IF @idTecnico IS NOT NULL AND @idTecnico != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.idTecnico LIKE "%', @idTecnico, '%" ');
        END IF;
        
        IF @descripcion IS NOT NULL AND @descripcion != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND c.descripcion LIKE "%', @descripcion, '%" ');
        END IF;
        
        IF @marca IS NOT NULL AND @marca != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND a.marca LIKE "%', @marca, '%" ');
        END IF;
        
        IF @modelo IS NOT NULL AND @modelo != '' THEN
            SET @where_conditions = CONCAT(@where_conditions, ' AND a.modelo LIKE "%', @modelo, '%" ');
        END IF;
        
        SET @base_query = CONCAT(@base_query, @where_conditions);
    END IF;
    
    PREPARE stmt FROM @base_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Procedimiento para buscar un caso específico con datos expandidos
DROP PROCEDURE IF EXISTS buscarCaso$$
CREATE PROCEDURE buscarCaso (_id INT, _idArtefacto INT)
BEGIN
    SELECT 
        c.id,
        c.idCliente,
        CONCAT(cl.nombre, ' ', cl.apellido1, ' ', cl.apellido2) AS nombreCliente,
        c.idTecnico,
        CONCAT(t.nombre, ' ', t.apellido1, ' ', t.apellido2) AS nombreTecnico,
        c.idArtefacto,
        a.marca AS marcaArtefacto,
        a.modelo AS modeloArtefacto,
        a.serie AS serieArtefacto,
        c.descripcion,
        c.fechaEntrada,
        c.fechaSalida
    FROM caso c
    LEFT JOIN artefacto a ON c.idArtefacto = a.id
    LEFT JOIN cliente cl ON c.idCliente = cl.idCliente
    LEFT JOIN tecnico t ON c.idTecnico = t.idTecnico
    WHERE c.id = _id OR c.idArtefacto = _idArtefacto;
END$$

-- Procedimiento para obtener todos los casos con datos expandidos (read expandido)
DROP PROCEDURE IF EXISTS readCaso$$
CREATE PROCEDURE readCaso (_id INT)
BEGIN
    IF _id IS NOT NULL THEN
        SELECT 
            c.id,
            c.idCliente,
            CONCAT(cl.nombre, ' ', cl.apellido1, ' ', cl.apellido2) AS nombreCliente,
            c.idTecnico,
            CONCAT(t.nombre, ' ', t.apellido1, ' ', t.apellido2) AS nombreTecnico,
            c.idArtefacto,
            a.marca AS marcaArtefacto,
            a.modelo AS modeloArtefacto,
            a.serie AS serieArtefacto,
            c.descripcion,
            c.fechaEntrada,
            c.fechaSalida
        FROM caso c
        LEFT JOIN artefacto a ON c.idArtefacto = a.id
        LEFT JOIN cliente cl ON c.idCliente = cl.idCliente
        LEFT JOIN tecnico t ON c.idTecnico = t.idTecnico
        WHERE c.id = _id;
    ELSE
        SELECT 
            c.id,
            c.idCliente,
            CONCAT(cl.nombre, ' ', cl.apellido1, ' ', cl.apellido2) AS nombreCliente,
            c.idTecnico,
            CONCAT(t.nombre, ' ', t.apellido1, ' ', t.apellido2) AS nombreTecnico,
            c.idArtefacto,
            a.marca AS marcaArtefacto,
            a.modelo AS modeloArtefacto,
            a.serie AS serieArtefacto,
            c.descripcion,
            c.fechaEntrada,
            c.fechaSalida
        FROM caso c
        LEFT JOIN artefacto a ON c.idArtefacto = a.id
        LEFT JOIN cliente cl ON c.idCliente = cl.idCliente
        LEFT JOIN tecnico t ON c.idTecnico = t.idTecnico
        ORDER BY c.id DESC
        LIMIT 0, 5;
    END IF;
END$$

-- Función para insertar nuevo caso
DROP FUNCTION IF EXISTS nuevoCaso$$
CREATE FUNCTION nuevoCaso (
    _idCliente VARCHAR(15),
    _idTecnico VARCHAR(15),
    _idArtefacto INT,
    _descripcion VARCHAR(255),
    _fechaSalida DATE
) RETURNS INT(1)
BEGIN
    DECLARE _cant INT DEFAULT 0;
    DECLARE _nuevoCasoId INT;
    
    -- Verificar si ya existe un caso abierto para este artefacto
    SELECT COUNT(id) INTO _cant 
    FROM caso 
    WHERE idArtefacto = _idArtefacto AND fechaSalida IS NULL;
    
    IF _cant > 0 THEN
        RETURN 1; -- Ya existe un caso abierto para este artefacto
    END IF;
    
    -- Insertar el nuevo caso
    INSERT INTO caso (idCliente, idTecnico, idArtefacto, descripcion, fechaEntrada, fechaSalida)
    VALUES (_idCliente, _idTecnico, _idArtefacto, _descripcion, CURDATE(), _fechaSalida);
    
    SET _nuevoCasoId = LAST_INSERT_ID();
    
    -- Insertar en el historial
    INSERT INTO historialCaso (idCaso, idResponsable, estado, fechaCambio, descripcion)
    VALUES (_nuevoCasoId, _idTecnico, 0, NOW(), CONCAT('Caso creado: ', _descripcion));
    
    RETURN 0; -- Éxito
END$$

-- Función para editar caso
DROP FUNCTION IF EXISTS editarCaso$$
CREATE FUNCTION editarCaso (
    _id INT,
    _idCliente VARCHAR(15),
    _idTecnico VARCHAR(15),
    _idArtefacto INT,
    _descripcion VARCHAR(255),
    _fechaSalida DATE
) RETURNS INT(1)
BEGIN
    DECLARE _cant INT DEFAULT 0;
    
    -- Verificar si el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _id;
    
    IF _cant = 0 THEN
        RETURN 1; -- Caso no encontrado
    END IF;
    
    -- Actualizar el caso
    UPDATE caso 
    SET 
        idCliente = _idCliente,
        idTecnico = _idTecnico,
        idArtefacto = _idArtefacto,
        descripcion = _descripcion,
        fechaSalida = _fechaSalida
    WHERE id = _id;
    
    RETURN 0; -- Éxito
END$$

-- Función para eliminar caso
DROP FUNCTION IF EXISTS eliminarCaso$$
CREATE FUNCTION eliminarCaso (_id INT) RETURNS INT(1)
BEGIN
    DECLARE _cant INT DEFAULT 0;
    
    -- Verificar si el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _id;
    
    IF _cant = 0 THEN
        RETURN 0; -- Caso no encontrado
    END IF;
    
    -- Verificar si tiene historial (dependencias)
    SELECT COUNT(id) INTO _cant FROM historialCaso WHERE idCaso = _id;
    
    IF _cant > 0 THEN
        RETURN 2; -- Tiene dependencias, no se puede eliminar
    END IF;
    
    -- Eliminar el caso
    DELETE FROM caso WHERE id = _id;
    
    RETURN 1; -- Eliminado correctamente
END$$

-- Función para eliminar caso con su historial
DROP FUNCTION IF EXISTS eliminarCasoConHistorial$$
CREATE FUNCTION eliminarCasoConHistorial (_id INT) RETURNS INT(1)
BEGIN
    DECLARE _cant INT DEFAULT 0;
    
    -- Verificar si el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _id;
    
    IF _cant = 0 THEN
        RETURN 0; -- Caso no encontrado
    END IF;
    
    -- Eliminar primero el historial
    DELETE FROM historialCaso WHERE idCaso = _id;
    
    -- Eliminar el caso
    DELETE FROM caso WHERE id = _id;
    
    RETURN 1; -- Eliminado correctamente con historial
END$$

-- Función para cambiar estado de caso
DROP FUNCTION IF EXISTS cambiarEstadoCaso$$
CREATE FUNCTION cambiarEstadoCaso (
    _idCaso INT,
    _nuevoEstado INT,
    _idResponsable VARCHAR(15),
    _descripcion VARCHAR(255)
) RETURNS VARCHAR(255)
BEGIN
    DECLARE _cant INT DEFAULT 0;
    DECLARE _mensaje VARCHAR(255);
    
    -- Verificar si el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _idCaso;
    
    IF _cant = 0 THEN
        RETURN 'Error: El caso no existe';
    END IF;
    
    -- Si el estado es 4 (Entregado), actualizar la fecha de salida
    IF _nuevoEstado = 4 THEN
        UPDATE caso SET fechaSalida = CURDATE() WHERE id = _idCaso;
    END IF;
    
    -- Insertar el cambio de estado en el historial
    INSERT INTO historialCaso (idCaso, idResponsable, estado, fechaCambio, descripcion)
    VALUES (_idCaso, _idResponsable, _nuevoEstado, NOW(), _descripcion);
    
    SET _mensaje = CONCAT('Estado cambiado exitosamente a: ', 
        CASE _nuevoEstado
            WHEN 0 THEN 'Ingresado'
            WHEN 1 THEN 'Diagnóstico'
            WHEN 2 THEN 'En espera de repuesto'
            WHEN 3 THEN 'Reparado'
            WHEN 4 THEN 'Entregado'
            ELSE 'Estado desconocido'
        END);
    
    -- Si se marcó como entregado, agregar información sobre la fecha de salida
    IF _nuevoEstado = 4 THEN
        SET _mensaje = CONCAT(_mensaje, '. Fecha de salida actualizada a: ', CURDATE());
    END IF;
    
    RETURN _mensaje;
END$$

-- Función para consultar estado actual de caso
DROP FUNCTION IF EXISTS consultarEstadoCaso$$
CREATE FUNCTION consultarEstadoCaso (_idCaso INT) RETURNS VARCHAR(500)
BEGIN
    DECLARE _historial VARCHAR(500) DEFAULT '';
    
    SELECT GROUP_CONCAT(
        CONCAT(
            'Estado: ', 
            CASE h.estado
                WHEN 0 THEN 'Ingresado'
                WHEN 1 THEN 'Diagnóstico'
                WHEN 2 THEN 'En espera de repuesto'
                WHEN 3 THEN 'Reparado'
                WHEN 4 THEN 'Entregado'
                ELSE 'Desconocido'
            END,
            ' - Fecha: ', DATE_FORMAT(h.fechaCambio, '%Y-%m-%d %H:%i'),
            ' - Responsable: ', h.idResponsable,
            ' - Descripción: ', h.descripcion
        ) SEPARATOR ' | '
    ) INTO _historial
    FROM historialCaso h
    WHERE h.idCaso = _idCaso
    ORDER BY h.fechaCambio DESC;
    
    RETURN COALESCE(_historial, 'No hay historial para este caso');
END$$

DELIMITER ;
