import {
  aplicarMascaraTelefone,
  aplicarMascaraCPF,
  aplicarMascaraRG,
  calcularIdade,
  buscarEnderecoPorCep,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPaciente");
  const params = new URLSearchParams(window.location.search);
  const pacienteId = params.get("id");
  const tituloFormulario = document.getElementById("tituloFormulario");
  const ipServer = window.location.hostname;
  const checkboxMesmaPessoa = document.getElementById("mesmo_pagador");

  const nascimentoInput = document.getElementById("nascimento");
  const idadeInput = document.getElementById("idade");
  const telefoneInput = document.getElementById("telefone");
  const cpfInput = document.getElementById("cpf");
  const pagadorCpfInput = document.getElementById("pagador_cpf");
  const pagadorRgInput = document.getElementById("pagador_rg");
  const rgInput = document.getElementById("rg");
  const cepInput = document.getElementById("endereco_cep");

  // Aplicar utilitários
  if (nascimentoInput && idadeInput) calcularIdade(nascimentoInput, idadeInput);
  if (telefoneInput) aplicarMascaraTelefone(telefoneInput);
  if (cpfInput) aplicarMascaraCPF(cpfInput);
  if (rgInput) aplicarMascaraRG(rgInput);
  if (pagadorCpfInput) aplicarMascaraCPF(pagadorCpfInput);
  if (pagadorRgInput) aplicarMascaraRG(pagadorRgInput);

  // Preencher dados do pagador automaticamente
  checkboxMesmaPessoa.addEventListener("change", () => {
    if (checkboxMesmaPessoa.checked) {
      form.pagador_nome.value = form.nome.value;
      form.pagador_contato.value = form.telefone.value;
      form.pagador_cpf.value = form.cpf.value;
      form.pagador_rg.value = form.rg.value;
    } else {
      form.pagador_nome.value = "";
      form.pagador_contato.value = "";
      form.pagador_cpf.value = "";
      form.pagador_rg.value = "";
    }
  });

  // Buscar endereço pelo CEP
  if (cepInput) {
    cepInput.addEventListener("blur", () => {
      buscarEnderecoPorCep(cepInput.value, form);
    });
  }

  // Se for edição, buscar dados
  if (pacienteId) {
    tituloFormulario.textContent = "Editar Paciente";
    fetch(`http://${ipServer}:3000/pacientes/${pacienteId}`)
      .then((res) => res.json())
      .then((p) => {
        console.log("🧾 Dados recebidos do paciente:", p);
        if (p) {
          form.id.value = p.id || "";
          form.nome.value = p.nome || "";
          form.nascimento.value = p.nascimento || "";
          form.telefone.value = p.telefone || "";
          form.email.value = p.email || "";
          form.cpf.value = p.cpf || "";
          form.rg.value = p.rg || "";
          form.valor_sessao.value = p.valor_sessao || "";
          form.pagador_nome.value = p.pagador_nome || "";
          form.pagador_contato.value = p.pagador_contato || "";
          form.pagador_cpf.value = p.pagador_cpf || "";
          form.pagador_rg.value = p.pagador_rg || "";
          form.endereco_cep.value = p.endereco_cep || "";
          form.endereco_rua.value = p.endereco_rua || "";
          form.endereco_numero.value = p.endereco_numero || "";
          form.endereco_complemento.value = p.endereco_complemento || "";
          form.endereco_bairro.value = p.endereco_bairro || "";
          form.endereco_cidade.value = p.endereco_cidade || "";
          form.endereco_estado.value = p.endereco_estado || "";
          checkboxMesmaPessoa.checked = !!p.mesmo_pagador;
          nascimentoInput.dispatchEvent(new Event("change"));
        }
      })
      .catch((error) => {
        console.error("❌ Erro ao buscar paciente:", error);
      });
  }

  // Submissão do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const psicologoId = localStorage.getItem("psicologoId"); // Recuperar o ID do psicólogo

    if (!psicologoId) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "../index.html";
      return;
    }

    const paciente = {
      psicologo_id: psicologoId, // ✅ Aqui está a correção
      nome: form.nome.value.trim(),
      nascimento: form.nascimento.value,
      telefone: form.telefone.value.trim(),
      email: form.email.value.trim(),
      cpf: form.cpf.value.trim(),
      rg: form.rg.value.trim(),
      valor_sessao: form.valor_sessao.value,
      mesmo_pagador: checkboxMesmaPessoa.checked ? 1 : 0,
      pagador_nome: form.pagador_nome.value.trim(),
      pagador_contato: form.pagador_contato.value.trim(),
      pagador_cpf: form.pagador_cpf.value.trim(),
      pagador_rg: form.pagador_rg.value.trim(),
      endereco_cep: form.endereco_cep.value.trim(),
      endereco_rua: form.endereco_rua.value.trim(),
      endereco_numero: form.endereco_numero.value.trim(),
      endereco_complemento: form.endereco_complemento.value.trim(),
      endereco_bairro: form.endereco_bairro.value.trim(),
      endereco_cidade: form.endereco_cidade.value.trim(),
      endereco_estado: form.endereco_estado.value.trim(),
    };
    const method = pacienteId ? "PUT" : "POST";
    const url = pacienteId
      ? `http://${ipServer}:3000/pacientes/${pacienteId}`
      : `http://${ipServer}:3000/pacientes`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paciente),
      });

      if (response.ok) {
        alert("Paciente salvo com sucesso!");
        window.location.href = "pacientes.html";
      } else {
        const errorData = await response.json();
        console.error("Erro ao salvar paciente:", errorData);
        alert("Erro ao salvar paciente.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });
});
