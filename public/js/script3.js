// Função para gerar campos dinâmicos para os dirigentes
// Função para gerar campos dinâmicos para os dirigentes
function gerarCampos() {
    const numDirigentes = document.getElementById('numDirigentes').value;
    const container = document.getElementById('camposDirigentes');
    container.innerHTML = ''; // Limpa os campos anteriores

    // Gera os campos para cada dirigente
    for (let i = 0; i < numDirigentes; i++) {
        container.innerHTML += `
            <h3>Dirigente ${i + 1}</h3>
            <div class="form-row">
                <label for="nome${i}">Nome Completo:</label>
                <input type="text" id="nome${i}" name="nome${i}">
                
                <label for="cargo${i}">Cargo:</label>
                <input type="text" id="cargo${i}" name="cargo${i}">
            </div>
            <div class="form-row">
                <label for="rg${i}">RG:</label>
                <input type="text" id="rg${i}" name="rg${i}">

                <label for="orgao${i}">Órgão Expedidor:</label>
                <input type="text" id="orgao${i}" name="orgao${i}">
            </div>
            <div class="form-row">
                <label for="cpf${i}">CPF:</label>
                <input type="text" id="cpf${i}" name="cpf${i}">

                <label for="endereco${i}">Endereço:</label>
                <input type="text" id="endereco${i}" name="endereco${i}">
            </div>
            <div class="form-row">
                <label for="telefone${i}">Telefone:</label>
                <input type="text" id="telefone${i}" name="telefone${i}">

                <label for="email${i}">E-mail:</label>
                <input type="email" id="email${i}" name="email${i}">
            </div>
            <hr>
        `;
    }
}

// Função para gerar o PDF
function gerarPDF() {
    const nomeEntidade = document.getElementById('nomeEntidade').value;
    const contasRejeitadas = document.getElementById('contasRejeitadas').checked;
    const improbidadeAdministrativa = document.getElementById('improbidadeAdministrativa').checked;
    const numDirigentes = document.getElementById('numDirigentes').value;
    const camposDirigentes = [];

    // Coleta os dados inseridos nos campos para cada dirigente
    for (let i = 0; i < numDirigentes; i++) {
        camposDirigentes.push([
            document.getElementById('nome' + i).value + ' - ' + document.getElementById('cargo' + i).value,
            document.getElementById('rg' + i).value + ' - ' + document.getElementById('orgao' + i).value + ', CPF: ' + document.getElementById('cpf' + i).value,
            document.getElementById('endereco' + i).value + ', ' + document.getElementById('telefone' + i).value + ', ' + document.getElementById('email' + i).value
        ]);
    }

    // Texto para "Contas Rejeitadas"
    let textoContasRejeitadas = contasRejeitadas
        ? 'V - tiveram as contas rejeitadas, mas demonstraram, nos termos do art. 39, IV, alíneas "a", "b" e "c", da Lei nº 13.019, de 2014, que:\n' +
          'V.1 – a irregularidade que motivou a rejeição das contas foi sanada e que os débitos eventualmente imputados foram quitados;\n' +
          'V.2 – a decisão de rejeição das contas foi reconsiderada ou revista;\n' +
          'V.3 – a decisão sobre a apreciação das contas está pendente de decisão sobre recurso com efeito suspensivo;'
        : 'V – não tiveram as contas rejeitadas pela Administração Pública nos últimos cinco anos.';

    // Texto para "Improbidade Administrativa"
    let textoImprobidadeAdministrativa = improbidadeAdministrativa
        ? 'c) foram considerados responsáveis por ato de improbidade ou foram considerados responsáveis por ato de improbidade, mas os respectivos efeitos, nos prazos previstos no art. 12, incisos I, II e III, da Lei nº 8.429, de 1992, já se exauriram.'
        : '';

    // Configuração do PDF
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 40, 20, 40],
        content: [
            { text: 'DECLARAÇÃO DOS ARTS. 26 E 27, DO DECRETO Nº 8.726, DE 2016, E DO ART. 39, DA LEI Nº 13.019, DE 2014', style: 'header', margin: [0, 0, 0, 20] },
            { text: `Declaro para os devidos fins, em nome da ${nomeEntidade}, nos termos dos art. 26, caput, inciso VII e art. 27 do Decreto nº 8.726, de 2016, e art. 39, incisos III ao VII, da Lei nº 13.019, de 2014, que os seus dirigentes abaixo relacionados, a saber:`, margin: [0, 0, 0, 10], alignment: 'justify' },
            { text: 'RELAÇÃO NOMINAL ATUALIZADA DOS DIRIGENTES DA ENTIDADE', style: 'subheader', margin: [0, 20, 0, 10], alignment: 'justify' },

            // Tabela dos dirigentes
            {
                table: {
                    headerRows: 1,
                    widths: ['30%', '35%', '35%'],
                    body: [
                        [
                            { text: 'Nome do dirigente e cargo', bold: true, alignment: 'center', fontSize: 10 },
                            { text: 'Carteira de identidade, órgão expedidor e CPF', bold: true, alignment: 'center', fontSize: 10 },
                            { text: 'Endereço residencial, telefone e e-mail', bold: true, alignment: 'center', fontSize: 10 }
                        ],
                        ...camposDirigentes.map(dir => [
                            { text: dir[0], alignment: 'left', fontSize: 9 },
                            { text: dir[1], alignment: 'left', fontSize: 9 },
                            { text: dir[2], alignment: 'left', fontSize: 9 }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            },

            // Declarações de itens específicos
            { text: 'I - não são membros de Poder ou do Ministério Público ou dirigente de órgão ou entidade da Administração Pública Federal;', margin: [0, 10], alignment: 'justify' },
            { text: 'II – não são cônjuges ou companheiros, bem como parentes em linha reta, colateral ou por afinidade, até o segundo grau, de quaisquer membros de Poder ou do Ministério Público ou de dirigente de órgão ou entidade da Administração Pública Federal;', margin: [0, 10], alignment: 'justify' },
            { text: 'III - Não contratará com recursos da parceria, para prestação de serviços, servidor ou empregado público, inclusive aquele que exerça cargo em comissão ou função de confiança, de órgão ou entidade da administração pública federal celebrante, ou seu cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o segundo grau, ressalvadas as hipóteses previstas em lei específica e na lei de diretrizes orçamentárias;', margin: [0, 10], alignment: 'justify' },
            { text: 'IV - Não serão remunerados, a qualquer título, com os recursos repassados:', margin: [0, 10], alignment: 'justify' },
            { text: '• membro de Poder ou do Ministério Público ou dirigente de órgão ou entidade da administração pública federal;', margin: [10, 5], alignment: 'justify' },
            { text: '• servidor ou empregado público, inclusive aquele que exerça cargo em comissão ou função de confiança, de órgão ou entidade da administração pública federal celebrante, ou seu cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o segundo grau, ressalvadas as hipóteses previstas em lei específica e na lei de diretrizes orçamentárias;', margin: [10, 5], alignment: 'justify' },
            { text: '• pessoas naturais condenadas pela prática de crimes contra a administração pública ou contra o patrimônio público, de crimes eleitorais para os quais a lei comine pena privativa de liberdade, e de crimes de lavagem ou ocultação de bens, direitos e valores.', margin: [10, 5], alignment: 'justify' },
            { text: textoContasRejeitadas, margin: [0, 10], alignment: 'justify' },
            { text: 'VI – não foram punidos com as sanções previstas no art. 39, inciso V, alíneas "a", "b", "c" e "d", da Lei nº 13.019, de 2014, ou foram punidos, mas o período que durou a penalidade já se exauriu;', margin: [0, 10], alignment: 'justify' },
            { text: 'VII – não são pessoas que, durante os últimos 8 (oito) anos:', margin: [0, 10], alignment: 'justify' },
            { text: 'a) tiveram suas contas relativas a parcerias julgadas irregulares ou rejeitadas por Tribunal ou Conselho de Contas de qualquer esfera da Federação, em decisão irrecorrível, nos últimos 8 (oito) anos;', margin: [10, 5], alignment: 'justify' },
            { text: 'b) foram julgados responsáveis por falta grave e inabilitados para o exercício de cargo em comissão ou função de confiança, enquanto durar a inabilitação;', margin: [10, 5], alignment: 'justify' },
            { text: textoImprobidadeAdministrativa, margin: [10, 5], alignment: 'justify', color: 'red' },

            // Informações finais
            { text: '\nLocal-UF, ____ de ______________ de 20___.\n\n', alignment: 'center', margin: [0, 40] },
            { text: '...........................................................................................', alignment: 'center', margin: [0, 40] },
            { text: '(Nome e Cargo do Representante Legal da OSC)', alignment: 'center', margin: [0, 10] }
        ],
        styles: {
            header: { fontSize: 16, bold: true },
            subheader: { fontSize: 14, bold: true }
        }
    };

    pdfMake.createPdf(docDefinition).download('declaracao-dirigentes.pdf');
}

// Eventos
document.getElementById('botaoGerarPDF').addEventListener('click', gerarPDF);