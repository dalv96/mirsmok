function editItem(number) {
    $("#city"+number).attr('disabled', false);

    $("#edit"+number).animate({
        opacity:0
    }, 200).addClass('invis');

    $("#save"+number).animate({
        opacity: 1
    }, 200).addClass('vis');

    $("#cancel"+number).animate({
        opacity: 1
    }, 200).addClass('vis');
    $('#exec'+number).focus()
}

function cancelItem(number) {
    $("#city"+number).attr('disabled', true);

    $("#edit"+number).animate({
        opacity:1
    }, 200).removeClass('invis');

    $("#save"+number).animate({
        opacity: 0
    }, 200).addClass('invis');

    $("#cancel"+number).animate({
        opacity: 0
    }, 200).removeClass('vis');
}

function saveItem(id) {
    var newCity = $('#city'+id).val();
    $.ajax({
        type: "POST",
        url: "/admin/cities/edit",
        data: "id="+id+'&newName='+newCity,
        success: function(msg){
            location=location;
        }
    });

}
