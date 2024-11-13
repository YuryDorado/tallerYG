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
  const { username, numero, tipoUsuario, password } = JSON.parse(event.body);

  // Verificar que todos los campos sean proporcionados
  if (
    !username ||
    !numero ||
    !tipoUsuario ||
    (tipoUsuario !== "ESTUDIANTE" && !password)
  ) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ message: "Faltan datos o contraseña incorrecta" }),
    };
  }

  // Verificar si el usuario ya existe
  const checkUserQuery = "SELECT * FROM usuarios WHERE username = ?";
  try {
    const [results] = await db.promise().query(checkUserQuery, [username]);

    if (results.length > 0) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: "El usuario ya existe." }),
      };
    }

    // Insertar usuario en la base de datos
    const insertQuery =
      "INSERT INTO usuarios (username, numero, tipo_usuario) VALUES (?, ?, ?)";
    await db.promise().query(insertQuery, [username, numero, tipoUsuario]);

    return {
      statusCode: 200, // OK
      body: JSON.stringify({ message: "Usuario registrado correctamente." }),
    };
  } catch (err) {
    console.error("Error al insertar en la base de datos", err);
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ message: "Error al registrar el usuario." }),
    };
  }
};
