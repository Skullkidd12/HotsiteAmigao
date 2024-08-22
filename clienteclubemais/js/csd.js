$(document).ready(function () {
  
  // easing animate scroll
  // seleciona todos os links com hash e remove links que na verdade não vinculam a nada
  $('a[href*="#"]')
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
      &&
      location.hostname == this.hostname
      ){
      
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1200, function() {
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            return false;
          }
          else {
            $target.attr('tabindex','-1');
            $target.focus();
          };
        });
      }
    }
  });

  // adiciona a classe active no menu
  $(".nav a").on("click", function(){
    $(".nav").find(".active").removeClass("active");
    $(this).parent().addClass("active");
  });


  // ScrollSpy - ativa a o menu de acordo com a rolagem
  $('body').scrollspy({ target: '.navbar-fixed-top' });


  // animação do header quando scroll
    $(document).on("scroll", function () {
        if (!$("body").hasClass("menu-senha")) {
            if ($(document).scrollTop() > 90) {
                $("nav").removeClass("menuzao").addClass("menuzim");
                $(".navbar-brand").removeClass("hide").addClass("show");
            }
            else {
                $("nav").removeClass("menuzim").addClass("menuzao");
                $(".navbar-brand").removeClass("show").addClass("hide");
            }

        }
    });

  // abas verticais Nossas lojas
  /*$(".vtab-menu>.list-group>a").click(function(e) {
    e.preventDefault();
    $(this).siblings('a.active').removeClass("active");
    $(this).addClass("active");
    var index = $(this).index();
    $(".vtab-content").removeClass("active");
    $(".vtab-content").eq(index).addClass("active");
  });*/


  // QueryString modal
  var p = getParameterByName('m');
  if (p == null) {
    return;
  }
  switch (p.toLowerCase()) {
    case 'faq': {
      $('#modalFAQ').modal('show');
    }
    break;
    default:
  }
  switch (p.toLowerCase()) {
    case 'regulamento': {
      $('#modalRegulamento').modal('show');
    }
    break;
    default:
  };

  // Forms Masks
  /*var pfx = "";
  $("#" + pfx + "txtCPF").mask("000.000.000-00");
  $("#" + pfx + "txtDataNascimento").mask("00/00/0000");
  $("#" + pfx + "txtCEP").mask("00000-000");
  $("#" + pfx + "txtNumeroTelCel").mask("(00) 00000-0000");
  $("#" + pfx + "txtNumeroTelRes").mask("(00) 0000-0000");
  $("#" + pfx + "txtLoginCpf").mask("000.000.000-00");
  $("#" + pfx + "txtCPFEsqueci").mask("000.000.000-00");*/
});


// QueryString
 function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// finaliza loading NProgress
/*document.addEventListener('DOMContentLoaded', function() {
  NProgress.done();
}, false);*/


// Correção para multiplos modais na tela
$('.modal').on("hidden.bs.modal", function (e) {
    if ($('.modal:visible').length) {
        $('.modal-backdrop').first().css('z-index', parseInt($('.modal:visible').last().css('z-index')) - 10);
        $('body').addClass('modal-open');
    }
}).on("show.bs.modal", function (e) {
    if ($('.modal:visible').length) {
        $('.modal-backdrop.in').first().css('z-index', parseInt($('.modal:visible').last().css('z-index')) + 10);
        $(this).css('z-index', parseInt($('.modal-backdrop.in').first().css('z-index')) + 10);
    }
});