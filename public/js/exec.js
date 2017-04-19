function startEdit(number) {
    $("#label"+number).animate({
        opacity:0
    }, 200).addClass('invis');
    $("#edit"+number).animate({
        opacity:0
    }, 200).addClass('invis').removeClass('vis');
    $("#rm"+number).animate({
        opacity:0
    }, 200).addClass('invis').removeClass('vis');
    $("#save"+number).animate({
        opacity: 1
    }, 200).addClass('visSave');
    $("#cancel"+number).animate({
        opacity: 1
    }, 200).addClass('visSave');
    $('#exec'+number).addClass('inpVis').removeClass('inpInvis').animate({
        opacity: 1
    }, 200);
}

function cancelEdit(number) {
    $("#label"+number).animate({
        opacity:1
    }, 200).removeClass('invis');
    $("#edit"+number).animate({
        opacity:1
    }, 200).addClass('vis').removeClass('invis');
    $("#rm"+number).animate({
        opacity:1
    }, 200).addClass('vis').removeClass('invis');
    $("#save"+number).animate({
        opacity: 0
    }, 200).removeClass('visSave');
    $("#cancel"+number).animate({
        opacity: 0
    }, 200).removeClass('visSave');
    $('#exec'+number).animate({
        opacity: 0
    }, 200, () => $('#exec'+number).addClass('inpInvis').removeClass('inpVis'));
}
