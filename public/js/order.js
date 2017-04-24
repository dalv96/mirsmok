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
