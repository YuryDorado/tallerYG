const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "cursos",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Conectado a la base de datos MySQL.");
});

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  const { username } = JSON.parse(event.body);

  try {
    // Eliminar todos los registros de la tabla sesión
    await db.promise().query("DELETE FROM sesion");

    // Insertar el nuevo usuario en la tabla sesión
    const insertQuery = "INSERT INTO sesion (username) VALUES (?)";
    await db.promise().query(insertQuery, [username]);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Sesión actualizada" }),
    };
  } catch (err) {
    console.error("Error al actualizar la sesión:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al actualizar la sesión" }),
    };
  }
};
