# SNEAELIS - Sistema de Formulários do Ministério do Esporte

Este projeto é um sistema de formulários desenvolvido para o Ministério do Esporte, permitindo a geração de declarações em layout específico através de formulários web.

## Estrutura do Projeto

![Estrutura de Arquivos](image.png)

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

![Tela de Escolha de Formulário](image.png)

Os usuários podem selecionar entre diferentes tipos de formulários, como:
- Formulário de Documentações (OSC/Sociedade Civil)
- Formulário de Convênio
- Formulário de Dirigente
- Entre outros

### 2. Painel do Técnico

![Painel do Técnico](image.png)

Interface para preenchimento de dados:
- Dados do Dirigente da Entidade
- Dados da Entidade
- Dados da Proposta

### 3. Geração de Declarações

![Modelo de Declaração](image.png)

O sistema gera automaticamente declarações oficiais como:
- Declaração de Não Utilização de Recursos para Finalidade Alheia ao Objeto da Parceira

## Tecnologias Utilizadas

- Node.js
- Express
- EJS (Embedded JavaScript templates)
- Git para controle de versão

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/SNEAELIS/SNEAELIS.git