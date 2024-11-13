document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // Función para generar una contraseña aleatoria
  function generateRandomPassword(length) {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const randomPassword = generateRandomPassword(12); // Genera una contraseña aleatoria de 12 caracteres

    const token = { password: randomPassword };

    // Generar un archivo token.json
    const blob = new Blob([JSON.stringify(token)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "token.json";
    link.click();

    document.getElementById("registerMessage").textContent =
      "Usuario registrado. Archivo de token generado.";
  });
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const fileInput = document.getElementById("tokenFile");
    const file = fileInput.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const token = JSON.parse(e.target.result);
        console.log(token); // Aquí podrías validar el token si es necesario

        fetch("/run-command", {
          method: "POST",
        })
          .then((response) => response.json())
          .then((data) => {
            document.getElementById("loginMessage").textContent = data.message;
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      };
      reader.readAsText(file);
    } else {
      document.getElementById("loginMessage").textContent =
        "Por favor, selecciona un archivo .json válido.";
    }
  });

  // Lógica para cambiar entre pestañas
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === tabId);
      });
      tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });
    });
  });
});
