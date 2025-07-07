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

DROP PROCEDURE IF EXISTS numRegsCaso$$
CREATE PROCEDURE numRegsCaso (
    _parametros VARCHAR(250))
BEGIN
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

DELIMITER ;
