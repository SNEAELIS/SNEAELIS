# SNEAELIS - Sistema de Formulários do Ministério do Esporte

[![Acesse o Projeto no Render](https://img.shields.io/badge/Render-Deploy-blue)](https://sneaelis.onrender.com)

Sistema de formulários desenvolvido para o Ministério do Esporte, permitindo a geração de declarações em layout específico. **Atualmente hospedado no Render**.

## Estrutura do Projeto

O projeto possui a seguinte estrutura principal:
- `config/`: Configurações do sistema
- `public/`: Arquivos públicos (CSS, JS, imagens)
- `src/`: 
  - `views/`: Templates EJS
  - `routes/`: Rotas da aplicação
  - `models/`: Modelos de dados
  - `controllers/`: Lógica de controle
  - `middleware/`: Middlewares

## Funcionalidades Principais

### 1. Escolha de Formulário

[![Tela de Escolha de Formulário](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EQm9ik9d8mBKkSFd4VvscZIBCknJN50mZv_oGolRX2EAHA?e=t56bRJ)](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EQm9ik9d8mBKkSFd4VvscZIBCknJN50mZv_oGolRX2EAHA?e=t56bRJ)

[![Tela Alternativa de Formulários](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EXpEFvzBpTpApSP6c50UXN8Bu4aOO5AJ2bxU8WfvyimowQ?e=GzLy6W)](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EXpEFvzBpTpApSP6c50UXN8Bu4aOO5AJ2bxU8WfvyimowQ?e=GzLy6W)

Interface para seleção entre diferentes tipos de formulários:
- Formulário de Documentações (OSC/Sociedade Civil)
- Formulário de Convênio
- Formulário de Dirigente

### 2. Painel do Técnico

[![Painel do Técnico](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/Ea1vUgsxQ3NHl0j9wbD1gB0BFH_r__C5Z2wGOmWibCTWFA?e=sLv5NN)](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/Ea1vUgsxQ3NHl0j9wbD1gB0BFH_r__C5Z2wGOmWibCTWFA?e=sLv5NN)

Área para preenchimento de:
- Dados do Dirigente da Entidade
- Dados da Entidade
- Dados da Proposta

### 3. Geração de Declarações Oficiais

[![Modelo de Declaração](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EQGiN_y52e1KgrN4P5M45eIBf2EZd2Xb_6iEibsevir2Hg?e=Yc0L7i)](https://mdsgov-my.sharepoint.com/:i:/g/personal/pedro_pneto_esporte_gov_br/EQGiN_y52e1KgrN4P5M45eIBf2EZd2Xb_6iEibsevir2Hg?e=Yc0L7i)

Geração automática de documentos como:
- Declaração de Não Utilização de Recursos
- Termos de Fomento
- Documentos comprobatórios

## Acesso ao Sistema

🔗 **Versão em Produção**: [https://sneaelis.onrender.com](https://sneaelis.onrender.com)

## Tecnologias Utilizadas

- Node.js
- Express
- EJS (Embedded JavaScript templates)
- Git/GitHub
- Render (Hospedagem)

## Instalação Local

```bash
git clone https://github.com/SNEAELIS/SNEAELIS.git
cd SNEAELIS
npm install
npm start