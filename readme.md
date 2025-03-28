# SNEAELIS - Sistema de Formulários do Ministério do Esporte

[![Acesse o Projeto no Render](https://img.shields.io/badge/Render-Deploy-blue)](https://sneaelis.onrender.com)

Sistema de formulários desenvolvido para o Ministério do Esporte, permitindo a geração de declarações em layout específico. **Atualmente hospedado no Render**.

## Funcionalidades Principais

### 1. Escolha de Formulário

![Tela de Escolha de Formulário](https://i.imgur.com/VPl7RqM.png)
![Tela Alternativa de Formulários](https://i.imgur.com/MFCpCQt.png)

Interface para seleção entre diferentes tipos de formulários:
- Formulário de Documentações (OSC/Sociedade Civil)
- Formulário de Convênio
- Formulário de Dirigente

### 2. Painel do Técnico

![Painel do Técnico](https://i.imgur.com/8TSwnWN.png)

Área técnica para preenchimento de:
- **Dados do Dirigente** (Nome completo, CPF, RG, Cargo)
- **Dados da Entidade** (Nome, CNPJ, Endereço completo)
- **Dados da Proposta** (Nº da Proposta, Objetivo)

### 3. Geração de Declarações Oficiais

![Modelo de Declaração](https://i.imgur.com/yCJYxM5.png)

Geração automática de documentos como:
- Declaração de Não Utilização de Recursos
- Termos de Fomento
- Documentos comprobatórios

## Acesso ao Sistema

🔗 **Versão em Produção**: [https://sneaelis.onrender.com](https://sneaelis.onrender.com)

## Tecnologias Utilizadas
- **Backend**: Node.js, Express
- **Frontend**: EJS, CSS, JavaScript
- **Hospedagem**: Render
- **Controle de Versão**: Git/GitHub

## Estrutura do Projeto
/
├── public/ # Arquivos estáticos
│ ├── css/ # Folhas de estilo
│ └── js/ # Scripts JavaScript
├── src/
│ ├── views/ # Templates EJS
│ ├── routes/ # Definição de rotas
│ └── controllers/ # Lógica de negócios
├── app.js # Ponto de entrada
└── package.json # Dependências

## Instalação Local
```bash
git clone https://github.com/SNEAELIS/SNEAELIS.git
cd SNEAELIS
npm install
npm start