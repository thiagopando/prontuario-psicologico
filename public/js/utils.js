export function aplicarMascaraTelefone(input) {
  input.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (value.length > 0) value = "(" + value;
    if (value.length > 3) value = value.slice(0, 3) + ") " + value.slice(3);
    if (value.length > 10) value = value.slice(0, 10) + "-" + value.slice(10);
    else if (value.length > 6) value = value.slice(0, 6) + "-" + value.slice(6);
    e.target.value = value;
  });
}

export function aplicarMascaraCPF(input) {
  input.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });
}

export function aplicarMascaraRG(input) {
  input.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\W/g, "").slice(0, 9);
    value = value.replace(/(\d{2})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})([0-9Xx])$/, "$1-$2");
    e.target.value = value.toUpperCase();
  });
}

export function calcularIdade(nascimento, destino) {
  nascimento.addEventListener("change", function () {
    const data = new Date(this.value);
    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const mes = hoje.getMonth() - data.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) idade--;
    destino.value = idade >= 0 ? idade + " anos" : "";
  });
}

export async function buscarEnderecoPorCep(cep, form) {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    alert("CEP inválido!");
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      alert("CEP não encontrado!");
    } else {
      form.endereco_rua.value = data.logradouro;
      form.endereco_bairro.value = data.bairro;
      form.endereco_cidade.value = data.localidade;
      form.endereco_estado.value = data.uf;
    }
  } catch (error) {
    console.error("Erro ao buscar o CEP:", error);
    alert("Erro ao buscar o CEP.");
  }
}

export function preencherDataAtual(input) {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  input.value = `${yyyy}-${mm}-${dd}`;
}
