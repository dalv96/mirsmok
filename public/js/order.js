function changeType(f) {
    if(f==1) {
        $('.repairs_hide').addClass('repairs').removeClass('repairs_hide');
        $('.install').addClass('install_hide').removeClass('install');
    } else {
        $('.repairs').addClass('repairs_hide').removeClass('repairs');
        $('.install_hide').addClass('install').removeClass('install_hide');
    }
}
