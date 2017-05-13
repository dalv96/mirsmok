window.onload = function () {
    var i = document.createElement("input");
    i.setAttribute("type", "date");
    if(i.type != 'date') {
        $('#dateWork').datepicker();
    }
}
function changeType(f) {
    if(f==1) {
        $('.repairs_hide').addClass('repairs').removeClass('repairs_hide');
        $('.install').addClass('install_hide').removeClass('install');
    } else {
        $('.repairs').addClass('repairs_hide').removeClass('repairs');
        $('.install_hide').addClass('install').removeClass('install_hide');
    }
}
function deleteOrder(id) {
    if(confirm("Вы уверены, что хотите удалить эту заявку?")) {
        $.ajax({
            method: "DELETE",
            url: location.href,
            succes: location = '/orders'
        });
    }
    return false;
}

function change(id, el) {
    if (el.checked) {
        $('#a'+id).attr('min', -1).animate({
            opacity: 0
        }, 200).val(-1).css('visibility', 'hidden');
    } else $('#a'+id).attr('min', 0).animate({
        opacity: 1
    }, 200).val(0).css('visibility', 'visible ');
}
