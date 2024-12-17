document.addEventListener('DOMContentLoaded', () => {
    const imagensInput = document.getElementById('imagens');

    if (imagensInput) {
        imagensInput.addEventListener('change', function () {
            const descricaoContainer = document.getElementById('descricaoImagens');
            descricaoContainer.innerHTML = ''; // Limpa descrições anteriores

            Array.from(this.files).forEach((file, index) => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <div class="form-row">
                        <label for="descricao${index}">Descrição da Imagem ${index + 1}:</label>
                        <textarea id="descricao${index}" rows="2" style="width: 100%;"></textarea>
                    </div>
                `;
                descricaoContainer.appendChild(div);
            });
        });
    } else {
        console.error("Elemento com id 'imagens' não encontrado.");
    }
});

function capturarDadosFormulario() {

    const getValue = (id) => document.getElementById(id)?.value || '';

    const imagens = Array.from(document.getElementById('imagens').files);
    const descricoes = imagens.map((_, index) => getValue(`descricao${index}`));

    return {
        nome: getValue('dirigente'),
        cpf: getValue('cpf'),
        rg: getValue('rg'),
        orgaoEmissor: getValue('orgaoEmissor'),
        cargoDirigente: getValue('cargoDirigente'),
        entidade: getValue('entidade'),
        cep: getValue('cep'),
        cnpj: getValue('cnpj'),
        endereco: getValue('endereco'),
        municipio: getValue('municipio'),
        uf: getValue('uf'),
        proposta: getValue('proposta'),
        objeto: getValue('objeto'),
        valorContrapartida: getValue('valorContrapartida'),
        valorContrapartidaExtenso: getValue('valorContrapartidaExtenso'),
        leiOrcamentaria: getValue('leiOrcamentaria'),
        diaLei: getValue('diaLei'),
        mesLei: getValue('mesLei'),
        anoLei: getValue('anoLei'),
        orgao: getValue('orgao'),
        unidade: getValue('unidade'),
        funcao: getValue('funcao'),
        subfuncao: getValue('subfuncao'),
        programa: getValue('programa'),
        atividade: getValue('atividade'),
        naturezaDespesa: getValue('naturezaDespesa'),
        nomeProjeto: getValue('nomeProjeto'),
        entidadesParceiras: getValue('entidadesParceiras'),
        periodoVigencia: getValue('periodoVigencia'),
        numeroBeneficiados: getValue('numeroBeneficiados'),
        acoesDesenvolvidas: getValue('acoesDesenvolvidas'),
        chefeExecutivo: getValue('chefeExecutivo'),
        secretarioFinancas: getValue('secretarioFinancas'),
        imagens: imagens,
        descricoes: descricoes
        
    };
}


// Substituir os placeholders nas declarações
function substituirPlaceholders(texto, dados) {
    const dataAtual = new Date();
    const diaAtual = String(dataAtual.getDate()).padStart(2, '0');
    const mesAtual = dataAtual.toLocaleString('pt-BR', { month: 'long' });
    const anoAtual = dataAtual.getFullYear();

    return texto
    .replace(/\[NOME\]/g, dados.nome)
    .replace(/\[CPF\]/g, dados.cpf)
    .replace(/\[RG\]/g, dados.rg)
    .replace(/\[ORGAO_EMISSOR\]/g, dados.orgaoEmissor)
    .replace(/\[UF\]/g, dados.uf)
    .replace(/\[CARGO_DIRIGENTE\]/g, dados.cargoDirigente)
    .replace(/\[ENTIDADE\]/g, dados.entidade)
    .replace(/\[CNPJ\]/g, dados.cnpj)
    .replace(/\[ENDERECO\]/g, dados.endereco)
    .replace(/\[CEP\]/g, dados.cep)
    .replace(/\[MUNICIPIO\]/g, dados.municipio)
    .replace(/\[PROPOSTA\]/g, dados.proposta)
    .replace(/\[OBJETO\]/g, dados.objetoConvenio)
    .replace(/\[VALOR_CONTRAPARTIDA\]/g, dados.valorContrapartida)
    .replace(/\[VALOR_CONTRAPARTIDA_EXTENSO\]/g, dados.valorContrapartidaExtenso)
    .replace(/\[LEI_ORCAMENTARIA\]/g, dados.leiOrcamentaria)
    .replace(/\[DIA_LEI\]/g, dados.diaLei)
    .replace(/\[MES_LEI\]/g, dados.mesLei)
    .replace(/\[ANO_LEI\]/g, dados.anoLei)
    .replace(/\[ORGAO\]/g, dados.orgao)
    .replace(/\[UNIDADE\]/g, dados.unidade)
    .replace(/\[FUNCAO\]/g, dados.funcao)
    .replace(/\[SUBFUNCAO\]/g, dados.subfuncao)
    .replace(/\[PROGRAMA\]/g, dados.programa)
    .replace(/\[ATIVIDADE\]/g, dados.atividade)
    .replace(/\[NATUREZA_DESPESA\]/g, dados.naturezaDespesa)
    .replace(/\[NOME_PROJETO\]/g, dados.nomeProjeto)
    .replace(/\[ENTIDADES_PARCEIRAS\]/g, dados.entidadesParceiras)
    .replace(/\[PERIODO_VIGENCIA\]/g, dados.periodoVigencia)
    .replace(/\[NUMERO_BENEFICIADOS\]/g, dados.numeroBeneficiados)
    .replace(/\[ACOES_DESENVOLVIDAS\]/g, dados.acoesDesenvolvidas)
    .replace(/\[CHEFE_EXECUTIVO\]/g, dados.chefeExecutivo || "Chefe do Poder Executivo")
    .replace(/\[SECRETARIO_FINANCAS\]/g, dados.secretarioFinancas || "Secretário de Finanças")
    .replace(/\[DIA_ATUAL\]/g, diaAtual)
    .replace(/\[MES_ATUAL\]/g, mesAtual)
    .replace(/\[ANO_ATUAL\]/g, anoAtual);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gerarPDF').addEventListener('click', gerarPDF);
});

const declaracoesCompletas = [
    {
        title: "ATESTADO DE CAPACIDADE TÉCNICA",
        content: `
            Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], situado(a) no [ENDERECO], CEP [CEP], atesto, para fins de formalização de Convênio com o Ministério do Esporte - MESP, que a presente Entidade apresenta capacidade técnica e operacional para executar o objeto apresentado na Proposta n.º [PROPOSTA], em atendimento ao inciso V, Art. 18, da Portaria Conjunta MGI/MF/CGU nº 33, de 30 de agosto de 2023, considerando as experiências adquiridas na execução de projeto(s)/ação(es) na(s) área(s) esportivo/educacional/social, devidamente especificada(s) no Histórico anexo.
            
            O(s) projeto(s)/ação(es) descrito(s) foi(ram) executado(s) com qualidade, não existindo, até a presente data, fatos que desabonem a conduta e a responsabilidade da entidade com as obrigações assumidas, confirmando assim a capacidade técnica e operacional para a execução do que foi proposto.
            
            [MUNICIPIO]/[UF], na data da assinatura.
            
            
            [NOME]
            [CARGO_DIRIGENTE]
        `
    },
    {
        content: `
        ANEXO
        
            HISTÓRICO 
        
            I. Apresentação:
            • Nome do projeto/ação: [NOME_PROJETO]
            • Entidades Parceiras: [ENTIDADES_PARCEIRAS]
            • Período de Vigência: [PERIODO_VIGENCIA]
            • Número de Beneficiados: [NUMERO_BENEFICIADOS]
            • Ações/Atividades desenvolvidas: [ACOES_DESENVOLVIDAS]
        
            Documentos Comprobatórios a serem encaminhados em anexo:
            a) Fotos
            b) Materiais de divulgação (folders, cartazes, etc.)
            c) Matérias vinculadas na mídia (jornal, revistas, etc.)
            d) Cópia de instrumento específico (contratos, convênios, termos de parceria, etc.)
        `
    },
    {
        title: "DECLARAÇÃO DE DISPONIBILIDADE DE CONTRAPARTIDA",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], DECLARO, em conformidade com a Lei de Diretrizes Orçamentárias vigente, que a presente Entidade dispõe e se compromete com o montante financeiro de R$ [VALOR_CONTRAPARTIDA] ([VALOR_CONTRAPARTIDA_EXTENSO]), para participar da contrapartida no repasse de recursos destinados ao cumprimento do objeto pactuado, disponível no Sistema Eletrônico Transferegov, Proposta sob o n.º [PROPOSTA].

        Os recursos estão disponíveis na Lei Orçamentária Municipal/Estadual nº [LEI_ORCAMENTARIA], de [DIA_LEI] de [MES_LEI] de [ANO_LEI], conforme rubrica orçamentária abaixo especificada, e cópia anexa:

        Órgão: [ORGAO]  
        Unidade: [UNIDADE]  
        Função: [FUNCAO]  
        Subfunção: [SUBFUNCAO]  
        Programa: [PROGRAMA]  
        Atividade: [ATIVIDADE]  
        Natureza da despesa: [NATUREZA_DESPESA]  

        [MUNICIPIO]/[UF], na data da assinatura.

        

        [NOME]  
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE AUSÊNCIA DE DESTINAÇÃO DE RECURSOS",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], declaro que os recursos do presente Convênio não se destinarão para o pagamento de despesas com pessoal ativo, inativo ou pensionista, dos Estados, do Distrito Federal e Municípios, conforme Art. 167, X, CF/88 e art. 25, § 1º, III, Lei Complementar nº 101/2000. 

        Por ser expressão da verdade, firmo a presente declaração.

        [MUNICIPIO]/[UF], na data da assinatura.

        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE NÃO VÍNCULO",
        content: `
        Eu, [NOME], CPF [CPF], RG [RG], expedido pelo [ORGAO_EMISSOR] / [UF], cargo [CARGO_DIRIGENTE], declaro, sob as penas da lei, em especial a do art. 299 do Código Penal Brasileiro, na qualidade de representante legal do Proponente, que as Empresas a serem contratadas no âmbito do Convênio a ser celebrado com o Ministério do Esporte - MESP, sob o número da Proposta nº [PROPOSTA], não possuem em seu quadro societário, cônjuge ou companheiro, bem como, vínculo de parentesco, colateral ou por afinidade, até o terceiro grau, ou de natureza técnica, comercial, econômica, financeira, trabalhista e civil.

        [MUNICIPIO]/[UF], na data da assinatura.

        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE AQUISIÇÃO DE BENS E SERVIÇOS COMUNS (incluindo a contratação de serviços de recursos humanos)",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], no que respeita à aquisição de bens e serviços comuns, declaro o compromisso de:
        
        1. Realizar Processo Licitatório na modalidade Pregão, em atendimento ao § 2º do Art. 17, da Lei n.º 14.133, de 1º de abril de 2021, Art. 51, da Portaria Conjunta n.º 33, de 30 de agosto de 2023, § 3º do Art. 1º, do Decreto n.º 10.024, de 20 de setembro de 2019 e demais legislações que regem a matéria, inclusive quanto à contratação de recursos humanos, quando for o caso, em conformidade com as orientações contidas no Acórdão n.º 2588/2017 – TCU – Plenário.
        
        2. Dar publicidade ao Processo Licitatório, divulgando no Diário Oficial da União, conforme preconiza o Art. 11 do Decreto nº 3.555, de 08 de agosto de 2000 e Art. 20, do Decreto n.º 10.024, de 20 de setembro de 2019.
        
        3. Consultar e emitir, para posterior inserção no sistema Transferegov, a declaração e certidões citadas no item 3 quando da assinatura do contrato a ser formalizado com as empresas vencedoras do certame ou do registro da nota de empenho quando não ocorrer a celebração do instrumento contratual, a fim de comprovar que no ato de assinatura as empresas estavam idôneas e aptas para contratar com a Administração Pública.
        
        4. Publicar os editais de licitação para consecução do objeto conveniado somente após a assinatura do respectivo instrumento, conforme Art. 53, da Portaria Conjunta n.º 33, de 30 de agosto de 2023.
        
        Por ser expressão da verdade, firmo a presente declaração.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
       
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE CIÊNCIA DAS CONDUTAS VEDADAS AOS AGENTES PÚBLICOS FEDERAIS EM ELEIÇÕES",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], declaro, para fins de celebração de Convênio com o Ministério do Esporte – MESP, que tenho ciência das condutas vedadas aos agentes públicos federais no ano das eleições, previstas na legislação vigente, em especial no que se refere à transferência voluntária de recursos públicos, disposta no art. 73, inciso VI, alínea “a”, da Lei nº 9.504, de 30 de setembro de 1997.
            
        A referida lei prevê que a União está impedida de realizar transferência voluntária de recursos aos Estados e Municípios, sob pena de nulidade de pleno direito, ressalvados os recursos destinados a cumprir obrigação formal preexistente para execução de obra ou serviço em andamento e com cronograma prefixado, e os destinados a atender situações de emergência e de calamidade pública, nos três meses anteriores à eleição.
            
        Por ser expressão da verdade, firmo a presente declaração.
            
        [MUNICIPIO]/[UF], na data da assinatura.
            
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO NEGATIVA DE DUPLICIDADE DE CONVÊNIO",
        content: `
        Declaro para os devidos fins de celebração de Convênios e na qualidade de representante legal do proponente junto ao Ministério do Esporte - MESP, que a proposta inserida no Sistema Eletrônico Transferegov sob o nº [PROPOSTA] e demais informações foram apresentados para apreciação SOMENTE junto a esse órgão e em nenhum outro ente da administração pública, ficando, portanto, sujeito às sanções civis, administrativas e penais cabíveis no caso de comprovada a falsidade ideológica.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE EXISTÊNCIA DE ÁREA GESTORA DOS RECURSOS RECEBIDOS POR TRANSFERÊNCIA VOLUNTÁRIA DA UNIÃO",
        content: `
        INCISO VII DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
        
        Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR] / [UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso VII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO] / [UF], possui área gestora dos recursos recebidos por transferência voluntária da União, com atribuições definidas para gestão, celebração, execução e prestação de contas, com lotação de, no mínimo, um servidor ou empregado público efetivo.
        
        Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE INEXISTÊNCIA DE ÁREA GESTORA DOS RECURSOS RECEBIDOS POR TRANSFERÊNCIA VOLUNTÁRIA DA UNIÃO",
        content: `
        § 17, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
        
        Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR] / [UF], cargo [CARGO_DIRIGENTE], que este subscreve, em cumprimento ao § 17, do Art. 29, da Portaria Interministerial MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO] / [UF], não possui área gestora dos recursos recebidos por transferência voluntária da União, com atribuições definidas para gestão, celebração, execução e prestação de contas. Assim, atribuirá a competência pela gestão dos recursos recebidos por transferência voluntária da União a outro setor que possua, no mínimo, um servidor ou empregado público efetivo.
        
        Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE INEXISTÊNCIA DE LEGISLAÇÃO DO PROPONENTE, NA LOCALIDADE DE EXECUÇÃO DO OBJETO, QUE ESTABELEÇA A COBRANÇA DE TAXA DE ADMINISTRAÇÃO DE CONTRATO",
        content: `
        INCISO XXXIV, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023
        
        Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR] / [UF], cargo [CARGO_DIRIGENTE], que essa subscreve, em cumprimento ao disposto no inciso XXXIV, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO] / [UF], não possui legislação, na localidade de execução do objeto, que estabeleça a cobrança de taxa de administração de contrato, em consonância com a vedação do art. 21, parágrafo único, inciso I, da Portaria Conjunta MGI/MF/CGU n.º 33/2023.
        
        Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
       [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        Chefe do Poder Executivo ou Secretário de Finanças
        `
    },
    {
        title: "DECLARAÇÃO NÃO RECEBE RECURSOS PARA A MESMA FINALIDADE DE OUTRA ENTIDADE",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], DECLARO ao Ministério do Esporte - MESP, que a entidade a qual represento não recebe recursos financeiros de outra entidade para a mesma finalidade na execução das ações apresentadas e especificadas na Proposta N° [PROPOSTA], cadastrada no Sistema Eletrônico Transferegov, para [OBJETO], evitando desta forma a sobreposição de recursos.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO NÃO CONTRATAÇÃO COM RECURSOS DA PARCERIA",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal da [ENTIDADE], CNPJ nº [CNPJ], declaro para os devidos fins de celebração do Termo de Convênio, no âmbito do Ministério do Esporte - MESP, que a presente Entidade não contratará com recursos da presente parceria, empresas que sejam do mesmo grupo econômico; tenham participação societária cruzada; pertençam ou tenham participação societária de parentes de dirigentes ou funcionários da entidade; possuam o mesmo endereço, telefone e CNPJ; bem como, que as cotações relativas aos itens previstos no Plano de Trabalho não apresentarão incompatibilidade, no que se refere à situação cadastral dos fornecedores e à classificação de atividades econômicas – CNAE em relação ao serviço ou fornecimento de material alusivo à respectiva cotação. Além disso, responsabilizar-se-á pela veracidade dos documentos apresentados referentes às pesquisas de preços junto aos fornecedores.
        
        Por ser expressão da verdade, firmo a presente declaração.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE COMPROMISSO",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], declaro o compromisso de:
        
        • Dispor dos recursos informatizados necessários ao acesso ao Sistema Eletrônico Transferegov, com o objetivo de alimentar, atualizar e acompanhar de forma permanente o referido sistema, de acordo com a norma vigente, durante todo o período da formalização da parceria até a prestação de contas final;
        
        • Dar publicidade ao Projeto/Programa, durante toda a execução, em observância à aplicação dos selos e marcas, adotadas pelo Ministério do Esporte - MESP e Governo Federal, de acordo com o estipulado no Manual de Selos e Marcas do Governo Federal, inclusive em ações de Patrocínio;
        
        • Previamente à confecção dos materiais, encaminhar para aprovação os layouts, juntamente com o número do convênio, processo e nome do programa/projeto/evento, para o e-mail: publicidade.cgce@esporte.gov.br.
        
        Por ser expressão da verdade, firmo a presente declaração.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE CUSTOS",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], ATESTO a planilha de custos, bem como as cotações obtidas, conforme Instrução Normativa SEGES/ME n.º 65, de 7 julho de 2021, inseridas no Sistema Eletrônico Transferegov, Proposta n.º [PROPOSTA].
        
        Ademais, DECLARO que os custos apresentados estão de acordo com os praticados no mercado.
        
        Por ser expressão da verdade, firmo a presente declaração.
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    {
        title: "DECLARAÇÃO DE CESSÃO/POSSE DE ESPAÇO FÍSICO",
        content: `
        Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR] / [UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ nº [CNPJ], responsabilizo-me pela disponibilização do(s) espaço(s) físico(s), apto(s) e compatível(is) para o atendimento do público-alvo. Além disso, apresentarei a(s) cessão(ões) de espaço físico, se for o caso, a fim de não causar qualquer impedimento no desenvolvimento das atividades junto aos beneficiados, no(s) núcleo(s) do [PROGRAMA].
        
        [MUNICIPIO]/[UF], na data da assinatura.
        
        
        [NOME]
        [CARGO_DIRIGENTE]
        `
    },
    
];


// Declarações específicas por opção
const declaracoesEspecificas = {
    '20JP_20JQ_ate_50k': [
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO PAGAMENTO DE PRECATÓRIOS JUDICIAIS",
            content: `
                INCISO II DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], expedida pelo [ORGAO_EMISSOR] / [UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso II do art. 29 da 
                Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o 
                [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], 
                [MUNICIPIO] / [UF], está regular quanto ao pagamento de precatórios judiciais, nos termos do 
                Art. 97, do Ato das Disposições Constitucionais Transitórias.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO FORNECIMENTO DA RELAÇÃO DAS EMPRESAS PÚBLICAS E DAS SOCIEDADES DE ECONOMIA MISTA AO REGISTRO PÚBLICO DE EMPRESAS MERCANTIS E ATIVIDADES AFINS",
            content: `
                INCISO XX DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que esta subscreve, em cumprimento ao inciso XX, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular no fornecimento da relação das empresas públicas e das 
                sociedades de economia mista junto ao Registro Público de Empresas Mercantis e Atividades Afins, nos termos 
                do Art. 92, da Lei nº 13.303, de 30 de junho de 2016.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO CUMPRIMENTO DE LIMITES",
            content: `
            INCISOS XXIX, XXX E XXXI, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023

            Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
            cargo [CARGO_DIRIGENTE], que esta subscreve, em cumprimento aos incisos XXIX, XXX E XXXI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
            DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
            CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular: 
            
            I. no cumprimento do limite das dívidas consolidada e mobiliária, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; 
            II. no cumprimento do limite de inscrição em restos a pagar, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; e
            III. no cumprimento do limite de despesa total com pessoal de todos os Poderes e órgãos listados no Art. 20 da Lei Complementar nº 101, de 2000, inclusive as Defensorias Públicas, nos termos do art. 169, § 2º, da Constituição Federal, e do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000.

            Por ser verdade, firmo a presente no exercício do respectivo cargo.

            [MUNICIPIO]/[UF], na data da assinatura.

            
            [NOME]
            Chefe do Poder Executivo (ou Secretário de Finanças)
        `
        },
        {
            title: "DECLARAÇÃO DESTINAÇÃO DOS PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
                INCISO XXXIII, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXIII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], está regular na destinação dos precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério 
                e aos demais profissionais da educação básica, estabelecido no Art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 12 de abril de 2022.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças ou de Educação)
            `
        },
        {
            title: "DECLARAÇÃO DE AUSÊNCIA DE PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
             § 16, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023

            Eu, [NOME], CPF [CPF], RG [RG], [ORGAO]/[UF], cargo [Governador do Estado de xx ou Prefeito do Município xxx ou Secretário de Finanças do Estado ou Secretário de Finanças de Educação ou Município xxxx], 
            que essa subscrevo, em cumprimento ao disposto no § 16, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
            DECLARO, sob as penas da lei, que o [NOME DO ESTADO OU MUNICÍPIO/UF], CNPJ: [CNPJ], endereço [ENDEREÇO], 
            CEP [CEP], [CIDADE/UF], não possui precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério 
            e aos demais profissionais da educação básica, estabelecido no art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 2022.

            Por ser verdade, firmo a presente no exercício do respectivo cargo.

            [MUNICIPIO]/[UF], na data da assinatura.

            
            [NOME DO RESPONSÁVEL]
            Chefe do Poder Executivo ou (Secretário de Finanças)
        `
        },
        {
            title: "DECLARAÇÃO DE CIÊNCIA DOS REQUISITOS PARA CONTRATAÇÃO DE RECURSOS HUMANOS",
        content: `
            Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], 
            CPF [CPF], na condição de representante legal do(a) [ENTIDADE], 
            CNPJ Nº [CNPJ], no que diz respeito à contratação de recursos humanos, declaro ter ciência de que:

            1. A forma de contratação necessitará de análise da Consultoria Jurídica da Entidade Convenente, a qual deverá observar as orientações contidas no Acórdão n.º 2588/2017 – TCU – Plenário, Portaria Conjunta MGI/MF/AGU n.º 33, de 30 de agosto de 2023 e demais legislações pertinentes.
            
            2. O repasse de recursos financeiros para custeio desta ação, no que tange ao pagamento dos profissionais e encargos sociais e trabalhistas, seguirá os valores e os percentuais aprovados no Plano de Trabalho da Proposta n.º [PROPOSTA]. Assim, caso os encargos sociais e/ou trabalhistas ultrapassem o limite estabelecido, a Entidade arcará com esta despesa.
            
            3. O valor total do recurso, destinado ao pagamento dos profissionais, encargos sociais e/ou trabalhistas, será obrigatoriamente pago mensalmente, conforme pactuado no Plano de Trabalho e em observância ao que segue:
            - Pagamento dos Profissionais: no mês seguinte da prestação dos serviços; e
            - Pagamento dos Encargos Sociais e/ou Trabalhistas: deverá acompanhar periodicidade dos pagamentos realizados aos recursos humanos vinculados.

            [MUNICIPIO]/[UF], na data da assinatura

            
            [NOME]
            [CARGO_DIRIGENTE]
        ` 
        },
        {
            title: "DECLARAÇÃO DE SUSTENTABILIDADE DO OBJETO",
            content: `
                Eu, [NOME], ([CARGO_DIRIGENTE]), portador do CPF n.º [CPF], na condição de representante legal do [ENTIDADE], inscrita no CNPJ nº [CNPJ], DECLARO perante o Ministério do Esporte, para fins de celebração de convênio, que o [ENTIDADE], 
                possui condições orçamentárias para arcar com as despesas dela decorrentes e meios que garantem a sustentabilidade do objeto, quando se tratar da aquisição de bens de capital.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
    ],
    '00SL_emendas': [
        {
            title: "DECLARAÇÃO DE CONFORMIDADE EM ACESSIBILIDADE",
            content: `
                Eu, [NOME DO REPRESENTANTE LEGAL], portador do CPF n.º [CPF], na qualidade de representante legal do [NOME DO MUNICÍPIO], 
                inscrito no CNPJ sob o n.º [CNPJ MUNICÍPIO], DECLARO que serão garantidos os meios necessários para acessibilidade de pessoas com deficiência 
                ou com mobilidade reduzida, e dá outras providências ao projeto, nos termos da Lei nº 10.098, de 19 de dezembro de 2000 e demais legislações e normativas aplicáveis.
                
                DECLARO, outrossim, sob as penas da lei, estar plenamente ciente do teor e da extensão desta declaração e deter plenos poderes e informações para firmá-la.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME DO RESPONSÁVEL LEGAL DO MUNICÍPIO]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE SUSTENTABILIDADE DO OBJETO",
            content: `
            Eu, [NOME DO REPRESENTANTE LEGAL], ([CARGO_DIRIGENTE]), portador do CPF n.º [CPF], na condição de representante legal do [NOME DO MUNICÍPIO], inscrita no CNPJ nº [CNPJ MUNICÍPIO], DECLARO perante o Ministério do Esporte, para fins de celebração de convênio, que o [NOME DO MUNICÍPIO], 
            possui condições orçamentárias para arcar com as despesas dela decorrentes e meios que garantem a sustentabilidade do objeto, quando se tratar da aquisição de bens de capital.

            [MUNICIPIO]/[UF], na data da assinatura.

            
            [NOME DO RESPONSÁVEL LEGAL DO MUNICÍPIO]
            [CARGO_DIRIGENTE]
        `
        },
        {
            title: "DECLARAÇÃO DE CUSTEIO DA INSTALAÇÃO DOS EQUIPAMENTOS",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], declaro o compromisso de:Dispor de recursos financeiros para custear a instalação dos equipamentos pactuados na proposta n° [PROPOSTA].
                Por ser expressão da verdade, firmo a presente declaração.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
    ],
    '20JP_20JQ_emenda': [
        {
            title: "DECLARAÇÃO DE CIÊNCIA DOS REQUISITOS PARA CONTRATAÇÃO DE RECURSOS HUMANOS",
            content: `
            Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], 
            na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], no que diz respeito à contratação de recursos humanos, declaro ter ciência de que:
            
            1. A forma de contratação necessitará de análise da Consultoria Jurídica da Entidade Convenente, a qual deverá observar as orientações contidas no Acórdão n.º 2588/2017 TCU  Plenário, Portaria Conjunta MGI/MF/AGU n.º 33, de 30 de agosto de 2023 e demais legislações pertinentes.
            
            2. O repasse de recursos financeiros para custeio desta ação, no que tange ao pagamento dos profissionais e encargos sociais e trabalhistas, seguirá os valores e os percentuais aprovados no Plano de Trabalho da Proposta n.º [PROPOSTA]. Assim, caso os encargos sociais e/ou trabalhistas ultrapassem o limite estabelecido, a Entidade arcará com esta despesa.
            
            3. O valor total do recurso, destinado ao pagamento dos profissionais, encargos sociais e/ou trabalhistas, será obrigatoriamente pago mensalmente, conforme pactuado no Plano de Trabalho e em observância ao que segue:
                - Pagamento dos Profissionais: no mês seguinte da prestação dos serviços; e
                - Pagamento dos Encargos Sociais e/ou Trabalhistas: deverá acompanhar a periodicidade dos pagamentos realizados aos recursos humanos vinculados.

            [MUNICIPIO]/[UF], na data da assinatura.

            
            [NOME]
            [CARGO_DIRIGENTE]
        `
        },
        {
            title: "TERMO DE COMPROMISSO",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], 
                na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], indico para a atribuição de Coordenador Geral do Programa ([NOME_PROGRAMA]), 
                o servidor [NOME_SERVIDOR], RG nº [IDENTIDADE_SERVIDOR], CPF [CPF_SERVIDOR], vinculado a esta Entidade como [VINCULO_SERVIDOR], 
                possuindo a qualificação exigida para desenvolvimento do(a) [NOME_PROGRAMA], devidamente comprovada, com dedicação de 40 horas semanais junto ao Programa.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
    ],
    '20JP_20JQ_comissao_mais_50k': [
        {
            title: "DECLARAÇÃO DE CIÊNCIA DOS REQUISITOS PARA CONTRATAÇÃO DE RECURSOS HUMANOS",
            content: `
            Eu, [NOME], portador da carteira de identidade nº [IDENTIDADE], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], 
            na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], no que diz respeito à contratação de recursos humanos, declaro ter ciência de que:
            
            1. A forma de contratação necessitará de análise da Consultoria Jurídica da Entidade Convenente, a qual deverá observar as orientações contidas no Acórdão n.º 2588/2017 TCU Plenário, Portaria Conjunta MGI/MF/AGU n.º 33, de 30 de agosto de 2023 e demais legislações pertinentes.
            
            2. O repasse de recursos financeiros para custeio desta ação, no que tange ao pagamento dos profissionais e encargos sociais e trabalhistas, seguirá os valores e os percentuais aprovados no Plano de Trabalho da Proposta n.º [PROPOSTA]. Assim, caso os encargos sociais e/ou trabalhistas ultrapassem o limite estabelecido, a Entidade arcará com esta despesa.
            
            3. O valor total do recurso, destinado ao pagamento dos profissionais, encargos sociais e/ou trabalhistas, será obrigatoriamente pago mensalmente, conforme pactuado no Plano de Trabalho e em observância ao que segue:
                - Pagamento dos Profissionais: no mês seguinte da prestação dos serviços; e
                - Pagamento dos Encargos Sociais e/ou Trabalhistas: deverá acompanhar a periodicidade dos pagamentos realizados aos recursos humanos vinculados.

            [MUNICIPIO]/[UF], na data da assinatura.

            
            [NOME]
            [CARGO_DIRIGENTE]
        `
        },
        {
            title: "TERMO DE COMPROMISSO",
            content: `
            Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], 
            na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], indico para a atribuição de Coordenador Geral do Programa ([NOME_PROGRAMA]), 
            o servidor [NOME_SERVIDOR], RG nº [IDENTIDADE_SERVIDOR], CPF [CPF_SERVIDOR], vinculado a esta Entidade como [VINCULO_SERVIDOR], 
            possuindo a qualificação exigida para desenvolvimento do(a) [NOME_PROGRAMA], devidamente comprovada, com dedicação de 40 horas semanais junto ao Programa.

            [MUNICIPIO]/[UF], na data de assinatura.

            
            [NOME]
            [CARGO_DIRIGENTE]
        `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO CUMPRIMENTO DE LIMITES DA LRF",
            content: `
                INCISOS XXIX, XXX E XXXI, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
        
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que esta subscrevo, em cumprimento aos incisos XXIX, XXX E XXXI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular:
        
                I. no cumprimento do limite das dívidas consolidada e mobiliária, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000;
                II. no cumprimento do limite de inscrição em restos a pagar, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; e
                III. no cumprimento do limite de despesa total com pessoal de todos os Poderes e órgãos listados no Art. 20 da Lei Complementar nº 101, de 2000, inclusive as Defensorias Públicas, nos termos do art. 169, § 2º, da Constituição Federal, e do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000.
        
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
                [MUNICIPIO]/[UF], na data da assinatura.
        
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DESTINAÇÃO DOS PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
                INCISO XXXIII, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXIII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], está regular na destinação dos precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério 
                e aos demais profissionais da educação básica, estabelecido no Art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 12 de abril de 2022.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.

               
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças ou de Educação)
            ` 
        },
        {
            title: "DECLARAÇÃO DE AUSÊNCIA DE PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
                § 16, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023
        
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no § 16, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], não possui precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério 
                e aos demais profissionais da educação básica, estabelecido no art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 2022.
        
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
               [MUNICIPIO]/[UF], na data da assinatura..
        
                
                [NOME]
                Chefe do Poder Executivo ou (Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO PAGAMENTO DE PRECATÓRIOS JUDICIAIS",
            content: `
                INCISO II DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso II do art. 29 da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], está regular quanto ao pagamento de precatórios judiciais, nos termos do Art. 97, do Ato das Disposições Constitucionais Transitórias.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.

                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO FORNECIMENTO DA RELAÇÃO DAS EMPRESAS PÚBLICAS E DAS SOCIEDADES DE ECONOMIA MISTA AO REGISTRO PÚBLICO DE EMPRESAS MERCANTIS E ATIVIDADES AFINS",
            content: `
                INCISO XX DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que esta subscreve, em cumprimento ao inciso XX, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular no fornecimento da relação das empresas públicas e das 
                sociedades de economia mista junto ao Registro Público de Empresas Mercantis e Atividades Afins, nos termos 
                do Art. 92, da Lei nº 13.303, de 30 de junho de 2016.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.

                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NA CONTRATAÇÃO DE OPERAÇÃO DE CRÉDITO",
            content: `
                INCISO XXXII, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
        
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], 
                CEP [CEP], [MUNICIPIO]/[UF], está regular na contratação de operação de crédito com instituição financeira, nos termos do Art. 33, da Lei Complementar nº 101, de 2000.
        
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
        
               [MUNICIPIO]/[UF], na data da assinatura.
        
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE ADIMPLÊNCIA",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], 
                na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], DECLARO, no uso das atribuições que me foram delegadas e sob as penas da lei, que a presente Entidade:

                Não está inadimplente com a União, inclusive no que tange às contribuições de que tratam os artigos 195 e 239 da Constituição Federal (contribuições dos empregados para a seguridade social, contribuições para o PIS/PASEP e contribuições para o FGTS, com relação a recursos anteriormente recebidos da Administração Pública Federal, por meio de convênios, contratos, acordos, ajustes, subvenções sociais, contribuições, auxílios e similares).

                Por ser expressão da verdade, firmo a presente declaração.

                [MUNICIPIO]/[UF], na data da assinatura.

                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE TRANSPARÊNCIA DA EXECUÇÃO ORÇAMENTÁRIA E FINANCEIRA",
            content: `
                INCISOS XV E XVI DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], 
                cargo [CARGO_DIRIGENTE], que esta subscrevo, em cumprimento aos incisos XV e XVI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33, de 30 de agosto de 2023, 
                DECLARO, sob as penas da lei, que o [ENTIDADE] CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], assegura a transparência mediante:

                - divulgação da execução orçamentária e financeira em meios eletrônicos de acesso público, nos termos do Art. 48, § 1º, Inciso II e do Art. 48-A, da Lei Complementar nº 101, de 2000; e
                - adoção de sistema integrado de administração financeira e controle, que atenda a padrão mínimo de qualidade estabelecido pelo Poder Executivo da União; nos termos do Art. 48, § 1º, Inciso III, da Lei Complementar nº 101, de 2000 e do Decreto nº 10.540, de 05 de novembro de 2020.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.

                
                [NOME]
                Chefe do Poder Executivo
            `
        },
    ],
    '00SL_comissao_mais_50k': [
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO CUMPRIMENTO DE LIMITES DA LRF",
            content: `
                INCISOS XXIX, XXX E XXXI, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que esta subscrevo, em cumprimento aos incisos XXIX, XXX E XXXI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular:
    
                I. no cumprimento do limite das dívidas consolidada e mobiliária, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; 
                II. no cumprimento do limite de inscrição em restos a pagar, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; e
                III. no cumprimento do limite de despesa total com pessoal de todos os Poderes e órgãos listados no Art. 20 da Lei Complementar nº 101, de 2000, inclusive as Defensorias Públicas, nos termos do art. 169, § 2º, da Constituição Federal, e do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DESTINAÇÃO DOS PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
                INCISO XXXIII, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXIII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], está regular na destinação dos precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério e aos demais profissionais da educação básica, estabelecido no Art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 12 de abril de 2022.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.

                
                [NOME]
                Chefe do Poder Executivo ou (Secretário de Finanças ou de Educação)
            `
        },
        {
            title: "DECLARAÇÃO DE AUSÊNCIA DE PRECATÓRIOS CORRESPONDENTES AO RATEIO DOS PERCENTUAIS DESTINADOS AOS PROFISSIONAIS DO MAGISTÉRIO E AOS DEMAIS PROFISSIONAIS DA EDUCAÇÃO BÁSICA",
            content: `
                § 16, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023

                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no § 16, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], não possui precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério e aos demais profissionais da educação básica, estabelecido no art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 2022.

                Por ser verdade, firmo a presente no exercício do respectivo cargo.

                [MUNICIPIO]/[UF], na data da assinatura.


                [NOME]
                Chefe do Poder Executivo ou (Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO PAGAMENTO DE PRECATÓRIOS JUDICIAIS",
            content: `
                INCISO II DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso II do art. 29 da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], está regular quanto ao pagamento de precatórios judiciais, nos termos do Art. 97, do Ato das Disposições Constitucionais Transitórias.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO FORNECIMENTO DA RELAÇÃO DAS EMPRESAS PÚBLICAS E DAS SOCIEDADES DE ECONOMIA MISTA AO REGISTRO PÚBLICO DE EMPRESAS MERCANTIS E ATIVIDADES AFINS",
            content: `
                INCISO XX DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que esta subscreve, em cumprimento ao inciso XX, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular no fornecimento da relação das empresas públicas e das sociedades de economia mista junto ao Registro Público de Empresas Mercantis e Atividades Afins, nos termos do Art. 92, da Lei nº 13.303, de 30 de junho de 2016.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NA CONTRATAÇÃO DE OPERAÇÃO DE CRÉDITO",
            content: `
                INCISO XXXII, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], está regular na contratação de operação de crédito com instituição financeira, nos termos do Art. 33, da Lei Complementar nº 101, de 2000.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE ADIMPLÊNCIA",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], CPF [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], DECLARO, no uso das atribuições que me foram delegadas e sob as penas da lei, que a presente Entidade:
    
                Não está inadimplente com a União, inclusive no que tange às contribuições de que tratam os artigos 195 e 239 da Constituição Federal (contribuições dos empregados para a seguridade social, contribuições para o PIS/PASEP e contribuições para o FGTS, com relação a recursos anteriormente recebidos da Administração Pública Federal, por meio de convênios, contratos, acordos, ajustes, subvenções sociais, contribuições, auxílios e similares).
    
                Por ser expressão da verdade, firmo a presente declaração.
    
                [MUNICIPIO], na data da assinatura.
    
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE TRANSPARÊNCIA DA EXECUÇÃO ORÇAMENTÁRIA E FINANCEIRA",
            content: `
                INCISOS XV E XVI DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que esta subscrevo, em cumprimento aos incisos XV e XVI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33, de 30 de agosto de 2023, DECLARO, sob as penas da lei, que o [ENTIDADE] CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], assegura a transparência mediante:
    
                - divulgação da execução orçamentária e financeira em meios eletrônicos de acesso público, nos termos do Art. 48, § 1º, Inciso II e do Art. 48-A, da Lei Complementar nº 101, de 2000; e
                - adoção de sistema integrado de administração financeira e controle, que atenda a padrão mínimo de qualidade estabelecido pelo Poder Executivo da União; nos termos do Art. 48, § 1º, Inciso III, da Lei Complementar nº 101, de 2000 e do Decreto nº 10.540, de 05 de novembro de 2020.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                Chefe do Poder Executivo
            `
        },
        {
            title: "DECLARAÇÃO DE SUSTENTABILIDADE DO OBJETO",
            content: `
                Eu, [NOME], [CARGO_DIRIGENTE], portador do CPF n.º [CPF], na condição de representante legal do(a) [MUNICIPIO], inscrita no CNPJ nº [CNPJ], DECLARO perante o Ministério do Esporte, para fins de celebração de convênio, que o [MUNICIPIO] possui condições orçamentárias 
                para arcar com as despesas dela decorrentes e meios que garantem a sustentabilidade do objeto, quando se tratar da aquisição de bens de capital.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE CUSTEIO DA INSTALAÇÃO DOS EQUIPAMENTOS",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], declaro o compromisso de:Dispor de recursos financeiros para custear a instalação dos equipamentos pactuados na proposta n° [PROPOSTA].
                Por ser expressão da verdade, firmo a presente declaração.
    
                [MUNICÍPIO/UF], [DIA_ATUAL] de [MES_ATUAL] de [ANO_ATUAL].
    

                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE CONFORMIDADE EM ACESSIBILIDADE",
            content: `
                Eu, [NOME], portador do CPF n.º [CPF], na qualidade de representante legal do [MUNICIPIO], inscrito no CNPJ sob o n.º [CNPJ], 
                DECLARO que serão garantidos os meios necessários para acessibilidade de pessoas com deficiência ou com mobilidade reduzida, 
                e dá outras providências ao projeto, nos termos da Lei nº 10.098, de 19 de dezembro de 2000 e demais legislações e normativas aplicáveis.
    
                DECLARO, outrossim, sob as penas da lei, estar plenamente ciente do teor e da extensão desta declaração e deter plenos poderes e informações para firmá-la.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
    ],
    '00SL_comissao_ate_50k': [
        {
            title: "DECLARAÇÃO DE CONFORMIDADE EM ACESSIBILIDADE",
            content: `
                Eu, [NOME], portador do CPF n.º [CPF], na qualidade de representante legal do [MUNICIPIO], inscrito no CNPJ sob o n.º [CNPJ], 
                DECLARO que serão garantidos os meios necessários para acessibilidade de pessoas com deficiência ou com mobilidade reduzida, 
                e dá outras providências ao projeto, nos termos da Lei nº 10.098, de 19 de dezembro de 2000 e demais legislações e normativas aplicáveis.
    
                DECLARO, outrossim, sob as penas da lei, estar plenamente ciente do teor e da extensão desta declaração e deter plenos poderes e informações para firmá-la.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE SUSTENTABILIDADE DO OBJETO",
            content: `
                Eu, [NOME], [CARGO_DIRIGENTE], portador do CPF n.º [CPF], na condição de representante legal do(a) [MUNICIPIO], inscrita no CNPJ nº [CNPJ], DECLARO perante o Ministério do Esporte, para fins de celebração de convênio, que o [MUNICIPIO] possui condições orçamentárias 
                para arcar com as despesas dela decorrentes e meios que garantem a sustentabilidade do objeto, quando se tratar da aquisição de bens de capital.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
               
                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE CUSTEIO DA INSTALAÇÃO DOS EQUIPAMENTOS",
            content: `
                Eu, [NOME], portador da carteira de identidade nº [RG], expedida pelo [ORGAO_EMISSOR]/[UF], [CPF], na condição de representante legal do(a) [ENTIDADE], CNPJ Nº [CNPJ], declaro o compromisso de:Dispor de recursos financeiros para custear a instalação dos equipamentos pactuados na proposta n° [PROPOSTA].
                Por ser expressão da verdade, firmo a presente declaração.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                [CARGO_DIRIGENTE]
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO CUMPRIMENTO DE LIMITES DA LRF",
            content: `
                INCISOS XXIX, XXX E XXXI, DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que esta subscrevo, em cumprimento aos incisos XXIX, XXX E XXXI, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP],[MUNICIPIO]/[UF], encontra-se regular:
    
                I. no cumprimento do limite das dívidas consolidada e mobiliária, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; 
                II. no cumprimento do limite de inscrição em restos a pagar, nos termos do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000; e
                III. no cumprimento do limite de despesa total com pessoal de todos os Poderes e órgãos listados no Art. 20 da Lei Complementar nº 101, de 2000, inclusive as Defensorias Públicas, nos termos do art. 169, § 2º, da Constituição Federal, e do Art. 25, § 1º, Inciso IV, Alínea "c", da Lei Complementar nº 101, de 2000.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    
               
                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NA DESTINAÇÃO DOS PRECATÓRIOS",
            content: `
                INCISO XXXIII, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso XXXIII, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], está regular na destinação dos precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério e aos demais profissionais da educação básica, estabelecido no Art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 12 de abril de 2022.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                Chefe do Poder Executivo ou (Secretário de Finanças ou de Educação)
            `
        },
        {
            title: "DECLARAÇÃO DE AUSÊNCIA DE PRECATÓRIOS NA DESTINAÇÃO",
            content: `
                § 16, DO ART. 29, DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no § 16, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], não possui precatórios correspondentes ao rateio dos percentuais destinados aos profissionais do magistério e aos demais profissionais da educação básica, estabelecido no art. 47-A, §§ 1º e 2º, da Lei nº 14.113, de 2020, e no art. 3º da Lei nº 14.325, de 2022.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                Chefe do Poder Executivo ou (Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO PAGAMENTO DE PRECATÓRIOS JUDICIAIS",
            content: `
                INCISO II DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que essa subscrevo, em cumprimento ao disposto no inciso II do art. 29 da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], está regular quanto ao pagamento de precatórios judiciais, nos termos do Art. 97, do Ato das Disposições Constitucionais Transitórias.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinautra.
    

                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
        {
            title: "DECLARAÇÃO DE REGULARIDADE NO FORNECIMENTO DA RELAÇÃO DE E.P. E S.E.M.",
            content: `
                INCISO XX DO ART. 29 DA PORTARIA CONJUNTA N.º 33/2023
    
                Eu, [NOME], CPF [CPF], RG [RG], [ORGAO_EMISSOR]/[UF], cargo [CARGO_DIRIGENTE], que esta subscreve, em cumprimento ao inciso XX, do Art. 29, da Portaria Conjunta MGI/MF/CGU n.º 33/2023, DECLARO, sob as penas da lei, que o [ENTIDADE], CNPJ: [CNPJ], endereço [ENDERECO], CEP [CEP], [MUNICIPIO]/[UF], encontra-se regular no fornecimento da relação das empresas públicas e das sociedades de economia mista junto ao Registro Público de Empresas Mercantis e Atividades Afins, nos termos do Art. 92, da Lei nº 13.303, de 30 de junho de 2016.
    
                Por ser verdade, firmo a presente no exercício do respectivo cargo.
    
                [MUNICIPIO]/[UF], na data da assinatura.
    

                [NOME]
                Chefe do Poder Executivo (ou Secretário de Finanças)
            `
        },
    ],
};

// Função para gerar o PDF
function gerarPDF() {
    const dados = capturarDadosFormulario();
    const opcao = document.getElementById('opcaoSelecao').value;

    // Verificar se uma opção válida foi selecionada
    if (!opcao || !declaracoesEspecificas[opcao]) {
        alert('Selecione uma opção válida antes de gerar o PDF.');
        return;
    }

    // Processar as declarações comuns
    const conteudoComum = declaracoesCompletas.map(declaracao => ({
        stack: [
            { text: declaracao.title, style: 'header', margin: [0, 10, 0, 10] },
            { text: substituirPlaceholders(declaracao.content, dados), style: 'normal' }
        ],
        pageBreak: 'after'
    }));

    // Processar as declarações específicas selecionadas
    const declaracoesEspecificasSelecionadas = declaracoesEspecificas[opcao];
    const conteudoEspecifico = declaracoesEspecificasSelecionadas.map(declaracao => ({
        stack: [
            { text: declaracao.title, style: 'header', margin: [0, 10, 0, 10] },
            { text: substituirPlaceholders(declaracao.content, dados), style: 'normal' }
        ],
        pageBreak: 'after'
    }));

    // Definição do documento PDF com as declarações comuns e específicas
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [...conteudoComum, ...conteudoEspecifico], // Inclui comuns e específicas
        styles: {
            header: { fontSize: 16, bold: true, alignment: 'center' },
            normal: { fontSize: 12, lineHeight: 1.5 }
        }
    };

    // Gera e baixa o PDF
    pdfMake.createPdf(docDefinition).download(`${opcao}.pdf`);
}

// Evento do botão para gerar PDF
document.getElementById('gerarPDF').addEventListener('click', gerarPDF);
