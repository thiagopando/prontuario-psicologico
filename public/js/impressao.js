document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ids = urlParams.get("sessaoId");
  const ipServer = window.location.hostname;

  const container = document.getElementById("conteudoImpresso");

  if (!ids) {
    container.innerHTML =
      '<p class="text-red-600">Nenhuma sessão foi informada.</p>';
    return;
  }

  const idArray = ids
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter(Boolean);

  for (const sessaoId of idArray) {
    try {
      const res = await fetch(`http://${ipServer}:3000/sessoes/${sessaoId}`);
      if (!res.ok) throw new Error(`Sessão ${sessaoId} não encontrada`);
      const s = await res.json();

      const div = document.createElement("div");
      div.className = "bg-white border border-gray-300 p-4 rounded-lg shadow";

      div.innerHTML = `
        <p><span class="font-semibold">Data:</span> ${s.data}</p>
        <p><span class="font-semibold">Pago:</span> ${
          s.pago ? "Sim" : "Não"
        }</p>
        <p><span class="font-semibold">Descrição:</span></p>
        <p class="mt-2 whitespace-pre-wrap">${s.descricao}</p>
      `;

      container.appendChild(div);
    } catch (error) {
      console.error(`Erro ao buscar sessão ${sessaoId}:`, error);
    }
  }
});
