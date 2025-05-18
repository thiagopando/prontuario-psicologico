import {
  aplicarMascaraTelefone,
  aplicarMascaraCPF,
  aplicarMascaraRG,
  buscarEnderecoPorCep,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const ipServer = window.location.hostname;
  const psicologoId = localStorage.getItem("psicologoId");
  const form = document.getElementById("formPsicologo");
  const feedback = document.getElementById("feedback");
  const nomeInput = document.getElementById("nome");
  const crpInput = document.getElementById("crp");
  const emailInput = document.getElementById("email");
  const telefoneInput = document.getElementById("telefone");
  const cpfInput = document.getElementById("cpf");
  const rgInput = document.getElementById("rg");
  const cepInput = document.getElementById("endereco_cep");
  const ruaInput = document.getElementById("endereco_rua");
  const numeroInput = document.getElementById("endereco_numero");
  const complementoInput = document.getElementById("endereco_complemento");
  const bairroInput = document.getElementById("endereco_bairro");
  const cidadeInput = document.getElementById("endereco_cidade");
  const estadoInput = document.getElementById("endereco_estado");
  const passwordInput = document.getElementById("password"); // Campo de senha (apenas para criação)

  // Mostrar o modal de sucesso
  function mostrarModalSucesso(mensagem) {
    const modal = document.getElementById("modalSucesso");
    const modalMensagem = document.getElementById("modalMensagem");
    const fecharModal = document.getElementById("fecharModal");

    // Atualizar a mensagem do modal
    modalMensagem.textContent = mensagem;

    // Exibir o modal
    modal.classList.remove("hidden");

    // Fechar o modal ao clicar no botão
    fecharModal.addEventListener("click", () => {
      modal.classList.add("hidden");
      // Recarregar a página
      window.location.reload();
    });

    // Fechar o modal ao clicar fora dele
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        // Recarregar a página
        window.location.reload();
      }
    });
  }

  // Verificar autenticação
  if (!psicologoId) {
    alert("Usuário não autenticado. Faça login novamente.");
    window.location.href = "../index.html";
    return;
  } else carregarPsicologo();

  // Aplicar utilitários
  if (telefoneInput) aplicarMascaraTelefone(telefoneInput);
  if (cpfInput) aplicarMascaraCPF(cpfInput);
  if (rgInput) aplicarMascaraRG(rgInput);

  // Buscar endereço pelo CEP
  if (cepInput) {
    cepInput.addEventListener("blur", () => {
      buscarEnderecoPorCep(cepInput.value, form);
    });
  }

  // Submissão do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: nomeInput.value.trim(),
      crp: crpInput.value.trim(),
      email: emailInput.value.trim(),
      telefone: telefoneInput.value.trim(),
      endereco_cep: cepInput.value.trim(),
      endereco_rua: ruaInput.value.trim(),
      endereco_numero: numeroInput.value.trim(),
      endereco_complemento: complementoInput.value.trim(),
      endereco_bairro: bairroInput.value.trim(),
      endereco_cidade: cidadeInput.value.trim(),
      endereco_estado: estadoInput.value.trim(),
    };

    // Adicionar senha apenas no modo de criação
    if (!psicologoId && passwordInput) {
      dados.password = passwordInput.value.trim();
    }

    const url = psicologoId
      ? `https://${ipServer}:3000/psicologoRoutes/${psicologoId}`
      : `https://${ipServer}:3000/psicologoRoutes`;
    const method = psicologoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!res.ok) throw new Error("Erro ao salvar dados.");

      // Exibir o modal de sucesso
      mostrarModalSucesso("Cadastro atualizado com sucesso!");

      form.reset();
    } catch (error) {
      feedback.textContent = "Erro ao salvar dados.";
      feedback.className = "text-red-600";
      console.error(error);
    }
  });

  // Carregar dados do psicólogo (edição)
  async function carregarPsicologo() {
    try {
      const res = await fetch(
        `https://${ipServer}:3000/psicologoRoutes/${psicologoId}`
      );
      if (!res.ok) throw new Error("Erro ao carregar psicólogo.");

      const p = await res.json();

      nomeInput.value = p.nome || "";
      crpInput.value = p.crp || "";
      emailInput.value = p.email || "";
      telefoneInput.value = p.telefone || "";
      cepInput.value = p.endereco_cep || "";
      ruaInput.value = p.endereco_rua || "";
      numeroInput.value = p.endereco_numero || "";
      complementoInput.value = p.endereco_complemento || "";
      bairroInput.value = p.endereco_bairro || "";
      cidadeInput.value = p.endereco_cidade || "";
      estadoInput.value = p.endereco_estado || "";

      // Ocultar o campo de senha no modo de edição
      if (passwordInput) {
        passwordInput.parentElement.style.display = "none";
      }

      if (telefoneInput) telefoneInput.dispatchEvent(new Event("input"));
    } catch (error) {
      console.error("Erro ao carregar dados do psicólogo:", error);
    }
  }
});
