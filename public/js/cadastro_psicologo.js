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
  const passwordInput = document.getElementById("password");
  const nfsCampos = document.getElementById("nfsCampos");
  const cpfCnpjInput = document.getElementById("cpf_cnpj");
  const inscricaoMunicipalInput = document.getElementById(
    "inscricao_municipal"
  );
  const razaoSocialInput = document.getElementById("razao_social");
  const regimeTributarioInput = document.getElementById("regime_tributario");
  const issRetidoInput = document.getElementById("iss_retido");
  const codigoServicoInput = document.getElementById("codigo_servico");

  // Variável global para controlar se as notas fiscais estão ativadas
  let notasAtivadas = false;

  // Mostrar o modal de sucesso
  function mostrarModalSucesso(mensagem) {
    const modal = document.getElementById("modalSucesso");
    const modalMensagem = document.getElementById("modalMensagem");
    const fecharModal = document.getElementById("fecharModal");

    modalMensagem.textContent = mensagem;
    modal.classList.remove("hidden");

    fecharModal.addEventListener("click", () => {
      modal.classList.add("hidden");
      window.location.reload();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
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

    // Adicionar os campos de NFS-e apenas se notasAtivadas for true
    if (notasAtivadas) {
      dados.cpf_cnpj = cpfCnpjInput.value.trim();
      dados.inscricao_municipal = inscricaoMunicipalInput.value.trim();
      dados.razao_social = razaoSocialInput.value.trim();
      dados.regime_tributario = regimeTributarioInput.value.trim();
      dados.iss_retido = issRetidoInput.value.trim();
      dados.codigo_servico = codigoServicoInput.value.trim();
    }

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

      // Forçar ativação dos campos de NFS-e para teste
      notasAtivadas = true;

      if (notasAtivadas) {
        nfsCampos.classList.remove("hidden");

        cpfCnpjInput.value = p.cpf_cnpj || "";
        inscricaoMunicipalInput.value = p.inscricao_municipal || "";
        razaoSocialInput.value = p.razao_social || "";
        regimeTributarioInput.value = p.regime_tributario || "";
        issRetidoInput.value = p.iss_retido || "2";
        codigoServicoInput.value = p.codigo_servico || "801";
      } else {
        nfsCampos.classList.add("hidden");
      }

      if (passwordInput) {
        passwordInput.parentElement.style.display = "none";
        passwordInput.removeAttribute("required");
      }

      if (telefoneInput) telefoneInput.dispatchEvent(new Event("input"));
    } catch (error) {
      console.error("Erro ao carregar dados do psicólogo:", error);
    }
  }
});
