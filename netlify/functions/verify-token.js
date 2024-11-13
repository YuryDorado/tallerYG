const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost", // Cambia esto si usas una base de datos remota
  user: "root", // Cambia estos valores si no usas localhost
  password: "1234", // Cambia la contraseña
  database: "cursos", // Cambia el nombre de la base de datos si es necesario
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Conectado a la base de datos MySQL.");
});

exports.handler = async function (event, context) {
  // Verificar que es una solicitud POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405, // Método no permitido
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  // Obtener los datos enviados en la solicitud
  const { username } = JSON.parse(event.body);

  // Verificar que el nombre de usuario esté presente
  if (!username) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: "Falta el nombre de usuario." }),
    };
  }

  // Consultar si el usuario existe en la tabla Usuarios
  const checkUserQuery =
    "SELECT id, username, tipo_usuario FROM usuarios WHERE username = ?";
  try {
    const [results] = await db.promise().query(checkUserQuery, [username]);

    if (results.length === 0) {
      return {
        statusCode: 404, // Usuario no encontrado
        body: JSON.stringify({ message: "Usuario no encontrado." }),
      };
    }

    // Eliminar todos los datos existentes en la tabla Sesion
    const deleteSessionQuery = "DELETE FROM Sesion";
    await db.promise().query(deleteSessionQuery);

    // Insertar los datos del usuario en la tabla Sesion
    const insertSessionQuery = `
      INSERT INTO Sesion (Id_Usuario, Nombre_Usuario, Rol)
      VALUES (?, ?, ?)
    `;

    // Ejecutar la inserción de la sesión en la tabla Sesion
    await db.promise().query(insertSessionQuery, [
      results[0].id, // id del usuario
      results[0].username, // Nombre de usuario
      results[0].tipo_usuario, // Rol del usuario
    ]);

    // Responder al cliente con el mensaje de éxito
    return {
      statusCode: 200, // OK
      body: JSON.stringify({
        message: "Usuario validado y sesión iniciada.",
        redirectUrl: "/profesor.html", // Indicar la URL a la que se debe redirigir
      }),
    };
  } catch (err) {
    console.error("Error al verificar el usuario:", err);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: "Error al verificar el usuario." }),
    };
  }
};
