document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const ipServer = window.location.hostname;

    try {
      const response = await fetch(`http://${ipServer}:3000/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Salva o ID e o nome do psicólogo logado
        localStorage.setItem("psicologoId", data.id);
        localStorage.setItem("nomePsicologo", data.nome);

        alert(data.message);
        window.location.href = "../pages/dashboard.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });
