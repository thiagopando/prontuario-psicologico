document.addEventListener("DOMContentLoaded", async () => {
  const psicologoId = localStorage.getItem("psicologoId"); // Recuperar o ID do psicólogo logado
  const mensagemBoasVindas = document.getElementById("mensagemBoasVindas");
  const btnFinanceiro = document.getElementById("btnFinanceiro");

  if (!psicologoId) {
    mensagemBoasVindas.textContent = "Bem-vindo(a)!";
    return;
  }

  try {
    const res = await fetch(
      `https://localhost:3000/psicologoRoutes/${psicologoId}`
    );
    if (!res.ok) throw new Error("Erro ao buscar dados do psicólogo.");

    const psicologo = await res.json();
    mensagemBoasVindas.textContent = `Bem-vindo(a), ${psicologo.nome}!`;
  } catch (error) {
    console.error(error);
    mensagemBoasVindas.textContent = "Bem-vindo(a)!";
  }

  // Redirecionar para financeiro.html ao clicar no botão
  btnFinanceiro.addEventListener("click", () => {
    window.location.href = "financeiro.html";
  });
});
