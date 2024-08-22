var urlBase = '';

var SPMaskBehavior = function (val) {
    return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
}, spOptions = {
    onKeyPress: function (val, e, field, options) {
        field.mask(SPMaskBehavior.apply({}, arguments), options);
    }
};

$(document).ready(function () {

    aplicaMascaras();
    $('#esqueciSenha').click(enviaSenha);
    $('#login').click(login);
    $('#btnEsqueciSenha').click(modalEsqueciSenha);
    $('.logout').click(logout);
    $('.atualizarDados').click(carregarDados);
    $('#dadosPessoais').click(salvarDados);

    //check BR 
    $('#rdBrasileiro').prop("checked", true);

    $('#formEsqueciSenha').on('submit', function (e) { e.preventDefault(); return false; });
    $('#formLogin').on('submit', function (e) { e.preventDefault(); return false; });

    if (localStorage.getItem('token') != undefined && localStorage.getItem('token') != '') {
        $(".deslogado").hide();
        $(".logado").show();
    }

	//validaNumericosMobile();

});

function modalEsqueciSenha() {

    $('#modalEsqueciSenha').modal();

    setTimeout(function () {
        $('#modalLogin').modal('hide');
    }, 2000);

}

function login() {
    if ($('#txtLoginCpf').val() != '' && $('#txtLoginSenha').val() != '') {
        $.ajax({
            type: 'GET',
            url: 'api/Token?grant_type=token&documento=' + $('#txtLoginCpf').val() + '&senha=' + $('#txtLoginSenha').val(),
            success: function (data) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                $(".deslogado").hide();
                $(".logado").show();
                $('#modalLogin').modal('toggle');
                $('#txtLoginCpf').val('');
                $('#txtLoginSenha').val('');
            },
            error: function (request, status, error) {
                $('#modalErroSenha').modal();
            },
            contentType: "application/json"
        });
    }
}

function logout() {
    localStorage.setItem('token', '');
    localStorage.setItem('refresh_token', '');
    $("#formSalvarDados").trigger('reset');
    limparValidacao();
    $('#txtCPF').attr("readonly", false);
    $(".deslogado").show();
    $(".logado").hide();
}

function enviaSenha(){
    var objeto = $('#formEsqueciSenha').serializeObject();

    $.ajax({
        type: 'POST',
        url: urlBase + 'api/Cliente/EnviaSenha/',
        data: JSON.stringify(objeto),
        success: function (data) {
            $('#modalEsqueciSenha').modal('toggle');
            $('#mensagem-senha').html('Sua senha foi enviada para o endereço de e-mail ou celular informado no cadastro.');
            $("#modalEmailSucesso").modal();

            setTimeout(function () {
                $('#modalEmailSucesso').modal('hide');
            }, 3000);
        },
        error: function (retorno) {
            $('#modalEsqueciSenha').modal('toggle');
            $('#mensagem-senha').html('Entre em contato com o nosso SAC pelo telefone 0800-643-3565 para recuperar a sua senha.');
            $("#modalEmailSucesso").modal();
        },
        contentType: "application/json"
    });
}

function carregarDados() {
    limparValidacao();

    if (localStorage.getItem('token') != undefined) {
        $.ajax({
            type: 'GET',
            url: urlBase + 'api/Cliente/',
            headers: { "Authorization": "Bearer " + localStorage.getItem('token') },
            contentType: "application/json",
            success: function (data) {
                if (data.dataNascimento != '' && data.dataNascimento != '0001-01-01T00:00:00Z') {
                    var now = new Date(data.dataNascimento);
                    var day = ("0" + now.getUTCDate()).slice(-2);
                    var month = ("0" + (now.getUTCMonth() + 1)).slice(-2);

                    var date = (day) + '/' + (month) + '/' + now.getUTCFullYear();
                } else {
                    date = '';
                }

                var sobrenome = data.sobrenome == null ? '' : data.sobrenome;

                $("input[name='Documento']").val(data.documento);
                $("input[name='PrimeiroNome']").val(data.primeiroNome + ' ' + sobrenome);
                $("input[name='Email']").val(data.email);
                $("input[name='DataNascimento']").val(date);
                $("input[name='TelefoneResidencial']").val(data.telefoneResidencial);
                $("input[name='TelefoneCelular']").val(data.telefoneCelular);
                $("input[name='Senha']").val(data.senha);

                if (data.sexo === 'feminino')
                    data.sexo = 'Feminino';
                else if (data.sexo === 'masculino')
                    data.sexo = 'Masculino';

                $("select[name='Sexo']").val(data.sexo);
                $("input[name='Endereco[Complemento]']").val(data.endereco.complemento);
                $("input[name='Endereco[Numero]']").val(data.endereco.numero);
                $("input[name='Endereco[Logradouro]']").val(data.endereco.logradouro);
                $("input[name='Endereco[Cidade]']").val(data.endereco.cidade);
                $("input[name='Endereco[Bairro]']").val(data.endereco.bairro);
                $("input[name='Endereco[Cep]']").val(data.endereco.cep);
                $("select[name='Endereco[Estado]']").val(data.endereco.estado);
                $("input[name='AceitaRegulamento']").prop('checked', data.aceitaRegulamento);
                $("input[name='AceitaComunicacao']").prop('checked', data.aceitaComunicacao);
                $("input[name='AceitaComunicacaoSMS']").prop('checked', data.aceitaComunicacaoSMS);

                $('#txtCPF').attr("readonly", true);
                $('#modalCadastro').modal();
            },
            error: function (response) {
                logout();
            }
        });
    } else {
        logout();
    }

}

function salvarDados() {
    $('#txtCPF').unmask();
    $('#txtCEP').unmask();
    $('#txtNumeroTelCel').unmask();
    $('#txtNumeroTelRes').unmask();

    if (validaCampos()) {
        var cliente = $('#formSalvarDados').serializeObject();

        var dataNascimeno = $("input[name='DataNascimento']").val();
        if (dataNascimeno != '') {
            var dia = dataNascimeno.split("/")[0];
            var mes = dataNascimeno.split("/")[1];
            var ano = dataNascimeno.split("/")[2];
            var dataEnviada = ano + '-' + mes + '-' + dia;
            cliente.DataNascimento = dataEnviada;
        } else {
            delete cliente.DataNascimento;
        }

        var nome = cliente.PrimeiroNome;
        cliente.PrimeiroNome = nome.substr(0, nome.indexOf(' '));
        cliente.Sobrenome = nome.substr(nome.indexOf(' ') + 1);

        cliente.PrimeiroNome = cliente.PrimeiroNome === '' ? cliente.Sobrenome : cliente.PrimeiroNome;
        cliente.Sobrenome = cliente.PrimeiroNome == cliente.Sobrenome ? '' : cliente.Sobrenome;

        cliente.Nacionalidade = document.querySelector('input[name="Nacionalidade"]:checked').value;

        $.ajax({
            type: 'POST',
            url: urlBase + 'api/cliente',
            data: JSON.stringify(cliente),
            success: function (data) {
                if (data != undefined && data != null) {
                    $('#modalCadastro').modal('toggle');
                    $('#modalSucesso').modal();
                }
            },
            error: function (data) {      
                $('#lblErrorModalServer').html(data.responseJSON.error);   
                $('#modalErroServer').modal();              
            },
            headers: { "Authorization": "Bearer " + localStorage.getItem('token') },
            contentType: "application/json",
            dataType: 'json'
        });

    }


}

function validaCampos() {

    var validacao = 0;

    if ($("#txtCPF").val() == '') {
        $(".txtCPF").text('Por favor, digite o CPF');
        validacao++;
    } else {
        if (!validarCPF($("input[name='Documento']").val())) {
            $(".txtCPF").text('Por favor, digite um CPF válido');
            validacao++;
        } else {
            $(".txtCPF").text('');
        }
    }

    if ($("#txtEmail").val() == '') {
        /*$(".txtEmail").text('Por favor, digite um e-mail');
        validacao++;*/
    } else {
        if (!checkEmail($("#txtEmail").val())) {
            $(".txtEmail").text('Por favor, digite um e-mail válido');
            validacao++;
        } else {
            $(".txtEmail").text('');
        }
    }

    if ($("#txtNome").val() == '') {
        $(".txtNome").text('Por favor, digite seu nome');
        validacao++;
    } else {
        $(".txtNome").text('');
    }

    if ($("#txtDataNascimento").val() == '') {
        $(".txtDataNascimento").text('Por favor, digite sua data de nascimento');
        validacao++;
    } else {
        if (!validaData($("#txtDataNascimento").val())) {
            $(".txtDataNascimento").text('Por favor, digite uma data de nascimento válida');
            validacao++;
        } else {
            $(".txtDataNascimento").text('');
        }
    }

    if ($("#txtSexo").val() == '-1') {
        $(".txtSexo").text('Por favor, selecione o sexo');
        validacao++;
    } else {
        $(".txtSexo").text('');
    }

    if ($("#txtNumeroTelCel").val() == '') {
        $(".txtNumeroTelCel").text('Por favor, digite seu telefone celular');
        validacao++;
    } else {
        $(".txtNumeroTelCel").text('');
    }

    if ($("#txtSenha").val() == '') {
        $(".txtSenha").text('Por favor, digite uma senha');
        validacao++;
    } else {
        $(".txtSenha").text('');
    }    

    if (!$('#txtRegulamento').prop('checked')) {
        $(".txtRegulamento").text('Aceite o regulamento para continuar');
        validacao++;
    } else {
        $(".txtRegulamento").text('');
    }
	
	
    if (!(/[0-9]/.test($('#txtSenha').val()))) {       
        $(".txtSenha").text('São permitidos apenas números na senha');	
		validacao++;		
    } else {
        $(".txtSenha").text('');
    }
	
	
	if ($("#txtSenha").val() != $("#txtConfirmarSenha").val()) {
        $(".txtConfirmarSenha").text('As senhas devem ser iguais');
        validacao++;
    } 
	else if (!(/[0-9]/.test($('#txtConfirmarSenha').val()))) {       
        $(".txtConfirmarSenha").text('São permitidos apenas números na senha');	
		validacao++;		
    } else {
        $(".txtConfirmarSenha").text('');
    }

    return validacao > 0 ? false : true;
}

$('#txtCEP').blur(function () {
    if ($('#txtCEP').val() != '') {
        getAddressByCep($('#txtCEP').val());
    }
    else {
        $("input[name='Endereco[Logradouro]']").val('');
        $("input[name='Endereco[Cidade]']").val('');
        $("input[name='Endereco[Bairro]']").val('');
        $("input[name='Endereco[Estado]']").val('');
        $("input[name='Endereco[Numero]']").val('');
    }
});

function getAddressByCep(cep) {
    cep = cep.replace('-', '');

    $.ajax({
        type: 'GET',
        url: urlBase + 'api/Cliente/Cep/' + cep,
        success: function (data) {
            $("input[name='Endereco[Logradouro]']").val(data.logradouro);
            $("input[name='Endereco[Cidade]']").val(data.cidade);
            $("input[name='Endereco[Bairro]']").val(data.bairro);
            $("select[name='Endereco[Estado]']").val(data.estado);
        },
        error: function (data) {
            $("input[name='Endereco[Logradouro]']").val('');
            $("input[name='Endereco[Cidade]']").val('');
            $("input[name='Endereco[Bairro]']").val('');
            $("input[name='Endereco[Estado]']").val('');
            $("input[name='Endereco[Numero]']").val('');
        },
        contentType: "application/json"
    });
}

function aplicaMascaras() {
    $('#txtCPF').mask('000.000.000-00');
    $('#txtCEP').mask('00000-000');
    $('#txtDataNascimento').mask('00/00/0000');
    $('#txtNumeroTelCel').mask(SPMaskBehavior, spOptions);
    $('#txtNumeroTelRes').mask('(00) 0000-0000');
}

function configuraDocumentoBrasil() {
    $('#txtCPF').attr('placeholder', 'CPF');
    $('#txtCPF').mask('000.000.000-00');
    $('#lblCPF').text('CPF *');
}


function configuraDocumentoArgentina() {
    $('#txtCPF').attr('placeholder', 'DNI');
    $('#txtCPF').mask('000000000');
    $('#lblCPF').text('DNI *');
}

function configuraDocumentoParaguai() {
    $('#txtCPF').attr('placeholder', 'NIP');
    $('#txtCPF').mask('00000000');
    $('#lblCPF').text('NIP *');
}

var checkEmail = function (value) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return (true)
    }
    return (false)
};

function somenteNumeros(e) {
    var charCode = e.charCode ? e.charCode : e.keyCode;
    // charCode 8 = backspace   
    // charCode 9 = tab
    if (charCode != 8 && charCode != 9) {
        // charCode 48 equivale a 0   
        // charCode 57 equivale a 9
        if (charCode < 48 || charCode > 57) {
            return false;
        }
    }
}


function validarCPF(inputCPF) {

    if ($('#rdBrasileiro').prop("checked"))
    {
        inputCPF = inputCPF.replace('.', '').replace('.', '').replace('-', '');
        var soma = 0;
        var resto;

        if (inputCPF == '00000000000') return false;
        for (i = 1; i <= 9; i++) soma = soma + parseInt(inputCPF.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;

        if ((resto == 10) || (resto == 11)) resto = 0;
        if (resto != parseInt(inputCPF.substring(9, 10))) return false;

        soma = 0;
        for (i = 1; i <= 10; i++) soma = soma + parseInt(inputCPF.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;

        if ((resto == 10) || (resto == 11)) resto = 0;
        if (resto != parseInt(inputCPF.substring(10, 11))) return false;
        return true;
    }
    else {
        return true;
    }
}

function validaData(valor) {

    var date = valor;

    var ardt = new Array;
    var ExpReg = new RegExp("(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/[12][0-9]{3}");
    ardt = date.split("/");
    valido = true;


    if (date.search(ExpReg) == -1)
        valido = false;
    else if (((ardt[1] == 4) || (ardt[1] == 6) || (ardt[1] == 9) || (ardt[1] == 11)) && (ardt[0] > 30))
        valido = false;
    else if (ardt[1] == 2) {
        if ((ardt[0] > 28) && ((ardt[2] % 4) != 0))
            valido = false;
        if ((ardt[0] > 29) && ((ardt[2] % 4) == 0))
            valido = false;
    }

    if (valido) {
        var partesData = valor.split("/");
        var data = new Date(partesData[2], partesData[1] - 1, partesData[0]);
        if (data > new Date())
           valido = false
    }


    return valido;
}

function limparValidacao() {
    $(".txtCPF").text('');
    $(".txtEmail").text('');
    $(".txtNome").text('');
    $(".txtDataNascimento").text('');
    $(".txtSexo").text('');
    $(".txtNumeroTelCel").text('');
    $(".txtSenha").text('');
    $(".txtConfirmarSenha").text('');
    $(".txtRegulamento").text('');
}

$('#txtCPF').blur(function () {
    if ($('#txtCPF').val() != '')
        GetClienteByCPF();
});

function GetClienteByCPF() {
    var documento = $('#txtCPF').val();
    documento = documento.replace('.', '').replace('.', '').replace('-', '');
    $.ajax({
        type: 'GET',
        url: urlBase + 'api/Cliente/documento/' + documento,
        success: function (data) {
            if (data != undefined && data != null) {
                $(".txtCPF").text('O CPF informado já está cadastrado, você será redirecionado para fazer o login e atualizar os seus dados.');

                setTimeout(function () {
                    $("#modalLogin").modal();
                    $("#modalCadastro").modal('toggle');
                    $("#formSalvarDados").trigger('reset');
                    limparValidacao();
                }, 5000)
            }
        },
        headers: { "Authorization": "Bearer " + localStorage.getItem('token') },
        contentType: "application/json"
    });
}

function isInputNumber(evt, classe) {
    var ch = String.fromCharCode(evt.which);
    if (!(/[0-9]/.test(ch))) {
        evt.preventDefault();
        $("." + classe).text('São permitidos apenas números na senha');
		evt.target.value = evt.target.value.slice(0, -1);
    } else {
        $("." + classe).text('');
    }
}


