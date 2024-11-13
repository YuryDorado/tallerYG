document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const registerButton = document.querySelector("#registerForm button");

  const adminPassword = "admin123"; // Contraseña para ADMIN (debe ser cambiada por una segura)
  const profesorPassword = "profesor123"; // Contraseña para PROFESOR (debe ser cambiada por una segura)

  // Función para generar contraseña aleatoria
  function generateRandomPassword(length) {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Función para validar las contraseñas
  function validatePasswords() {
    const tipoUsuario = document.getElementById("tipoUsuario").value;
    const inputPasswordAdmin = document.getElementById("passwordAdmin").value;
    const inputPasswordProfesor =
      document.getElementById("passwordProfesor").value;

    if (tipoUsuario === "ADMIN" && inputPasswordAdmin !== adminPassword) {
      registerButton.disabled = true;
      return false;
    }

    if (
      tipoUsuario === "PROFESOR" &&
      inputPasswordProfesor !== profesorPassword
    ) {
      registerButton.disabled = true;
      return false;
    }

    registerButton.disabled = false;
    return true;
  }

  // Manejo de registro de usuario
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Validar contraseñas según el tipo de usuario
    if (!validatePasswords()) {
      document.getElementById("registerMessage").textContent =
        "Contraseña incorrecta.";
      return;
    }

    const username = document.getElementById("username").value;
    const numero = document.getElementById("numero").value;
    const tipoUsuario = document.getElementById("tipoUsuario").value;

    // Generar una contraseña aleatoria si el tipo de usuario es Admin o Profesor
    const randomPassword = generateRandomPassword(12);

    // Crear el objeto token con los datos y la contraseña generada
    const token = { username, numero, tipoUsuario, password: randomPassword };

    // Llamar a la función Lambda para guardar los datos en la base de datos
    fetch("/.netlify/functions/register", {
      method: "POST",
      body: JSON.stringify(token),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Usuario registrado correctamente.") {
          const blob = new Blob([JSON.stringify(token)], {
            type: "application/json",
          });

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${username}_token.json`; // Nombre del archivo token con el username
          link.click();

          document.getElementById("registerMessage").textContent =
            "Usuario registrado. Archivo de token generado.";
        } else {
          document.getElementById("registerMessage").textContent =
            "Error al registrar el usuario. Intenta de nuevo.";
        }
      })
      .catch((error) => {
        console.error("Error al registrar el usuario:", error);
        document.getElementById("registerMessage").textContent =
          "Error al registrar el usuario. Intenta de nuevo.";
      });
  });

  // Manejo de autenticación
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fileInput = document.getElementById("tokenFile");
    const file = fileInput.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const token = JSON.parse(e.target.result);
        console.log("Token cargado:", token);

        // Verificar el usuario en la base de datos
        fetch("/.netlify/functions/verify-token", {
          method: "POST",
          body: JSON.stringify({
            username: token.username,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "Usuario validado y sesión iniciada.") {
              // Guardar el estado de inicio de sesión en localStorage
              localStorage.setItem("isLoggedIn", "true");

              // Redirigir a la página profesor.html
              window.location.href = "/profesor.html";
            } else {
              document.getElementById("loginMessage").textContent =
                "Token inválido. Intenta de nuevo.";
            }
          })
          .catch((error) => {
            console.error("Error al verificar el token:", error);
            document.getElementById("loginMessage").textContent =
              "Error en la verificación. Intenta de nuevo.";
          });
      };
      reader.readAsText(file);
    } else {
      document.getElementById("loginMessage").textContent =
        "Por favor, selecciona un archivo .json válido.";
    }
  });

  // Función para limpiar la tabla de sesión y agregar el usuario actual
  function actualizarSesion(username) {
    // Elimina todos los datos de la tabla sesión y agrega el nuevo usuario
    fetch("/.netlify/functions/update-session", {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Sesión actualizada") {
          console.log("Sesión actualizada correctamente");
        } else {
          console.error("Error al actualizar la sesión:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error al actualizar la sesión:", error);
      });
  }

  // Mostrar y ocultar contraseñas según el tipo de usuario
  const tipoUsuario = document.getElementById("tipoUsuario");
  const adminPasswordField = document.getElementById("passwordAdmin");
  const profesorPasswordField = document.getElementById("passwordProfesor");

  tipoUsuario.addEventListener("change", () => {
    adminPasswordField.style.display = "none";
    profesorPasswordField.style.display = "none";
    if (tipoUsuario.value === "ADMIN") {
      adminPasswordField.style.display = "block";
    } else if (tipoUsuario.value === "PROFESOR") {
      profesorPasswordField.style.display = "block";
    }

    // Validar contraseñas cuando se cambia el tipo de usuario
    validatePasswords();
  });

  // Validar contraseñas cuando se introducen
  document
    .getElementById("passwordAdmin")
    .addEventListener("input", validatePasswords);
  document
    .getElementById("passwordProfesor")
    .addEventListener("input", validatePasswords);
});
