# Tasks

- Quando clicamos em editar na tela de paciente.html,
  e clicamos novamente no botão voltar ele volta para a tela de
  pacientes.html e não do paciente.html que estávamos editando..

- cor do botão imprimir na paciente.html está errada

- ao clicar em Nova Sessão no paciente.html o sistema não pré-carrega
  o paciente em questão na tela de prontuarios.html - RESOLVIDO

## Nova fase de implementações (adaptação ao que o CFP pede)

- No cadastros_paciente.html adicionar os novos campos:

  - Queixa principal (textarea) --------OK
  - Objeitco terapêutico (textarea) ----OK
  - Hipóteses iniciais (textarea) ---- OK

- em prontuarios.html

  - Tecnicas utilizadas (input - precisamos criar um ambiente para que o próprio psicologo possa cadastrar seus inputs)
  - emoções predominantemente oservadas
  - comportamentos notáveis
  - reações do paciente
  - Adicionar área "Status do caso" que por padrão fica com o status Em processo terapêutico mas que quando mudado para Encerrado abra um formulário para registrar:
    - Motivo do encerramento (textarea)
    - Encaminhamentos realizados (textarea)
    - Profissional/Destino (também um campo de input onde podemos pedir para o prórprio psicologo cadastrar seus Profissionais/Destinos)
  - Adicionar recomendações sobre os requisitos de formatação do CFP nº 06/2019
    - Linguagem formal, terceira pessoa

- impressoes.html

  - Identificação do psicologo, nome, CRP, endereço, telefone e e-mail (todos esses dados carregados da tela de cadastro do psicologo(perfil))
  - Paginação e campo para assinatura (futuramente com suporte a assinatura eletrônica)
  - informar a validade do documento conforme resolução do CFP (pode pré-carregar da tela do perfil do usuário onde podemos definir uma área de preferencias e definir o número de dias, ao enviar o documento para a impressão o programa automaticamente define a data de validade do documeto baseada no número digitado/précarregado)

- cadastro_psicologo.html
  - criar a página do zero
