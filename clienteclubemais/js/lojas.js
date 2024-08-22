var urlBase = '';
var is_mobile = false;

var map = '';

$(document).ready(function () {

    if (!$('.vertodos').is(":hidden"))
        is_mobile = true;

    carregaLojas(); 

    $('#vertodos').click(function (e) {
        e.preventDefault();
        var listaTodasLojas = $(".list-lojas a");
        for (var i = 0; i < listaTodasLojas.length; i++) {
            $(listaTodasLojas[i]).css({ 'display': 'block' });
            ps.update();
        }  
    });

});

function carregaLojas() {

    $.ajax({
        type: 'GET',
        url: urlBase + 'api/Loja/',
        success: function (data) {
            var qtdLojas = data.length;

            let bandeira = [];
            bandeira[0] = [];
            bandeira[0]["nome"] = "Supermercados Cidade Canção";
            bandeira[0]["lojas"] = [];

            bandeira[1] = [];
            bandeira[1]["nome"] = "Amigão Supermercados";
            bandeira[1]["lojas"] = [];

            bandeira[2] = [];
            bandeira[2]["nome"] = "São Francisco Supermercados";
            bandeira[2]["lojas"] = [];

            for (var l = 0; l < qtdLojas; l++) {
                if (data[l].nome.search('Canção') != -1)
                    bandeira[0]["lojas"].push(data[l]);
                else if (data[l].nome.search('Amigão') != -1)
                    bandeira[1]["lojas"].push(data[l]);
                else if (data[l].nome.search('São Francisco') != -1)
                    bandeira[2]["lojas"].push(data[l]);
            }

            bandeira[0]["lojas"] = _.groupBy(bandeira[0]["lojas"], function (b) { return b.endereco.cidade; });
            bandeira[1]["lojas"] = _.groupBy(bandeira[1]["lojas"], function (b) { return b.endereco.cidade; });
            bandeira[2]["lojas"] = _.groupBy(bandeira[2]["lojas"], function (b) { return b.endereco.cidade; });

            var listaLojas = $('.list-lojas');
            listaLojas.html('');
            var tabLoja = $('.vtab');
            tabLoja.html('');

            var map = [];
            var myLatLng = [];
            var marker = [];
            var count = 0;


            for (let b = 0; b < bandeira.length; b++) {

                var filtroBandeira = $('<div>', { class: 'filtro-bandeira' });
                var textoBandeira = $('<a>', { class: 'item-bandeira', text: bandeira[b].nome });

                $(textoBandeira).append('<i class="fas fa-plus pull-right"></i>');
                $(filtroBandeira).append(textoBandeira);

                for (var cidade in bandeira[b]["lojas"]) {

                    var cidadesBandeira = $('<div>', { class: 'cidade-bandeira' });
                    var textoCidade = $('<a>', { class: 'item-cidade', text: cidade });

                    $(textoCidade).append('<i class="fas fa-plus pull-right"></i>');
                    $(cidadesBandeira).append(textoCidade);
                    $(filtroBandeira).append(cidadesBandeira);

                    bandeira[b]["lojas"][cidade] = _.sortBy(bandeira[b]["lojas"][cidade], o => o.nome);

                    for (var i = 0; i < bandeira[b]["lojas"][cidade].length; i++) {

                        let data = bandeira[b]["lojas"][cidade];

                        var classe = count == 0 ? 'list-group-item active' : 'list-group-item';

                        var listaItemLoja = $('<a>', { class: classe, text: data[i].nome });

                        $(listaItemLoja).attr('data-id', data[i].id);
                        $(listaItemLoja).attr('data-latitude', data[i].latitude);
                        $(listaItemLoja).attr('data-longitude', data[i].longitude);
                        $(listaItemLoja).attr('data-nome', data[i].nome);
                        $(listaItemLoja).attr('data-endereco', data[i].enderecoDescrito);
                        $(listaItemLoja).attr('data-telefone', data[i].telefone);
                        $(listaItemLoja).attr('data-item', count);
                        $(listaItemLoja).click(inicializaMapa);

                        $(cidadesBandeira).append(listaItemLoja);

                        var classeTab = count == 0 ? 'vtab-content active' : 'vtab-content';
                        var item = $('<div>', { class: classeTab });
                        var endereco = $('<div>', { class: "row" });
                        var mapa = $('<div>', { class: "row" });

                        var horarioFuncionamento = '';

                        for (var j = 0; j < data[i].horarioFuncionamento.length; j++) {
                            var horario = data[i].horarioFuncionamento[j].diaSemana + ' - ' + data[i].horarioFuncionamento[j].horario + ' / ';
                            horarioFuncionamento += horario;
                        }

                        var funcionamento = horarioFuncionamento.substr(0, horarioFuncionamento.length - 2);

                        $(endereco).append(
                            $('<div>', { class: 'col-md-10 col-xs-9' })
                                .append($('<h4>', { text: data[i].nome }))
                                .append($('<p>', { html: '<i class="fa fa-home"></i> ' + data[i].enderecoDescrito }))
                                .append($('<p>', { html: '<i class="fa fa-phone"></i> ' + data[i].telefone }))
                                .append($('<p>', { html: '<i class="fa fa-clock-o"></i> ' + funcionamento }))
                        );

                        var nome = data[i].nome;
                        var url = '';

                        if (nome.search('Canção') != -1)
                            url = "images/logo-cidade-cansao.png";
                        else if (nome.search('Amigão') != -1)
                            url = "images/logo-amigao.png";
                        else if (nome.search('São Francisco') != -1)
                            url = "images/logo-saofrancisco.png";

                        $(endereco).append($('<div>', { class: 'col-md-2 col-xs-3 text-right' })
                            .append($('<img />', { class: 'img-responsive icone', src: url }))
                        );

                        var embedMapa = $('<div>', { id: data[i].id, class: 'mapa' })

                        $(mapa).append($('<div>', { class: 'col-md-12' }).append($('<div>', { class: 'embed-responsive embed-responsive-16by9' }).append(embedMapa)));

                        $(item).append(endereco);
                        $(item).append(mapa);
                        $(tabLoja).append(item);

                        if (count == 0) $(listaItemLoja).trigger("click");
                        //$(listaItemLoja).trigger("click");

                        count++;
                    }
                }

                $(listaLojas).append(filtroBandeira);
            }

            
            // Habilita a troca de abas
            habilitaAbas();
            if (is_mobile) escondeLojasMobile();

            // Carrega lojas no mobile
            carregaSelectLojas();
         

        },
        error: function (request, status, error) {
            alert(request.responseJSON.error);
        },
        contentType: "application/json"
    });

}

function habilitaAbas() {

    $(".list-group-item").click(function (e) {
        e.preventDefault();
        $(this).siblings('a.active').removeClass("active");
        $(this).addClass("active");

        var index = $(this).data('item');

        $(".vtab-content").removeClass("active");
        $(".vtab-content").eq(index).addClass("active");

        if (is_mobile) {
            escondeLojasMobile();
        }
    });

    // Habilita Show/Hide Divs
    $(".item-bandeira").click(function () {

        var icon = $(this).find("i");
        icon.toggleClass("fa-plus fa-minus");

        var itemPai = $(this).parent();
        var filhos = itemPai.children('.cidade-bandeira');
        if (filhos.hasClass("hide")) {
            filhos.removeClass('hide');
            filhos.addClass('show');
        } else if (filhos.hasClass("show")) {
            filhos.removeClass('show');
            filhos.addClass('hide');
        } else {
            filhos.addClass('show');
        }

        var outrosItens = $('.filtro-bandeira').children('.cidade-bandeira').not(filhos);
        outrosItens.addClass('hide');
        outrosItens.removeClass('show');
    });

    
    $(".item-cidade").click(function () {

        var icon = $(this).find("i");
        icon.toggleClass("fa-plus fa-minus");

        var itemPai = $(this).parent();
        var filhos = itemPai.children('.list-group-item');
        if (filhos.hasClass("hide")) {
            filhos.removeClass('hide');
            filhos.addClass('show');
        } else if (filhos.hasClass("show")) {
            filhos.removeClass('show');
            filhos.addClass('hide');
        } else {
            filhos.addClass('show');
        }

        var outrosItens = $('.cidade-bandeira').children('.list-group-item').not(filhos);
        outrosItens.addClass('hide');
        outrosItens.removeClass('show');
    });
}

function inicializaMapa() {

    let dados = this;
    let mapa = document.getElementById($(dados).attr('data-id'));

    if ($('#' + $(dados).attr('data-id') + ' .leaflet-pane').length != 0)
        return;

    let map = L.map(mapa, {
        center: [$(dados).attr('data-latitude'), $(dados).attr('data-longitude')],
        minZoom: 16,
        zoom: 16
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c']
    }).addTo(map);

    var contentString = '<h5><b>' + $(dados).attr('data-nome') + '</b></h5><b>Endereço: </b> ' + $(dados).attr('data-endereco') + '<br /> <b>Telefone:</b> ' + $(dados).attr('data-telefone');

    L.marker([$(dados).attr('data-latitude'), $(dados).attr('data-longitude')])
        .bindPopup(contentString)
        .addTo(map);

    setTimeout(function () { map.invalidateSize() }, 400);

}

function escondeLojasMobile() {
    if ($("#vertodos").is(':hidden') == false) {
        var listaInativa = $(".list-lojas a").not(".active");

        for (var i = 0; i < listaInativa.length; i++) {
            $(listaInativa[i]).css({ 'display': 'none' });
            ps.update();
        }
    }
}

$(window).resize(function () {
    is_mobile = !$('.vertodos').is(":hidden") ? true : false;

    if (!is_mobile)
        carregaLojas();
});

// barrinha de rolagem falsa (PerfectScrollbar.js)
const ps = new PerfectScrollbar('.false-scroll', {
    wheelSpeed: 5,
    wheelPropagation: true,
    minScrollbarLength: 10
});

function carregaSelectLojas() {
    $.ajax({
        type: "get",
        url: urlBase + 'api/Loja/',
        success: function (data) {
            var qtdLojas = data.length;
            var selectBox = $('#listagemLojas');

            let bandeira = [];
            bandeira[0] = [];
            bandeira[0]["nome"] = "Cidade Canção";
            bandeira[0]["lojas"] = [];

            bandeira[1] = [];
            bandeira[1]["nome"] = "Amigão";
            bandeira[1]["lojas"] = [];

            bandeira[2] = [];
            bandeira[2]["nome"] = "São Francisco";
            bandeira[2]["lojas"] = [];

            for (var l = 0; l < qtdLojas; l++) {
                if (data[l].nome.search('Canção') != -1)
                    bandeira[0]["lojas"].push(data[l]);
                else if (data[l].nome.search('Amigão') != -1)
                    bandeira[1]["lojas"].push(data[l]);
                else if (data[l].nome.search('São Francisco') != -1)
                    bandeira[2]["lojas"].push(data[l]);
            }

            bandeira[0]["lojas"] = _.groupBy(bandeira[0]["lojas"], function (b) { return b.endereco.cidade; });
            bandeira[1]["lojas"] = _.groupBy(bandeira[1]["lojas"], function (b) { return b.endereco.cidade; });
            bandeira[2]["lojas"] = _.groupBy(bandeira[2]["lojas"], function (b) { return b.endereco.cidade; });

            var count = 0;

            for (let b = 0; b < bandeira.length; b++) {

                for (var cidade in bandeira[b]["lojas"]) {

                    var $optgroupCidade = $("<optgroup>", { label: cidade });
                    $optgroupCidade.appendTo(selectBox);

                    bandeira[b]["lojas"][cidade] = _.sortBy(bandeira[b]["lojas"][cidade], o => o.nome);

                    for (var i = 0; i < bandeira[b]["lojas"][cidade].length; i++) {

                        let data = bandeira[b]["lojas"][cidade];

                        var $option = $("<option>", { text: data[i].nome, value: count });
                        $option.appendTo($optgroupCidade);

                        count++;
                    }
                }
            }

        }
    });
}

$('#listagemLojas').change(function () {
    var index = this.value;
    $(".vtab-content").removeClass("active");
    $(".vtab-content").eq(index).addClass("active");
});


