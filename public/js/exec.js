function startEdit(number) {
    $("#label"+number).animate({
        opacity:0
    }, 200).addClass('invis');
    $("#edit"+number).animate({
        opacity:0
    }, 200).addClass('invis').removeClass('vis');
    $("#rm"+number).animate({
        opacity:0
    }, 200).addClass('invis').removeClass('vis')
    $("#save"+number).animate({
        opacity: 1
    }, 200).addClass('visSave');
    $("#cancel"+number).animate({
        opacity: 1
    }, 200).addClass('visSave');
    $('#exec'+number).addClass('inpVis').removeClass('inpInvis').animate({
        opacity: 1
    }, 200);
    $('#manager'+number).addClass('inpVis').removeClass('inpInvis').animate({
        opacity: 1
    }, 200);
    $('#exec'+number).focus()
}

function cancelEdit(number) {
    $("#label"+number).animate({
        opacity:1
    }, 200).removeClass('invis');
    $("#edit"+number).animate({
        opacity:1
    }, 200, () => $("#edit"+number).attr('style', '').removeClass('invis').addClass('vis') )
    $("#rm"+number).animate({
        opacity:1
    }, 200, () => $("#rm"+number).attr('style', '').removeClass('invis').addClass('vis'))
    $("#save"+number).animate({
        opacity: 0
    }, 200).removeClass('visSave');
    $("#cancel"+number).animate({
        opacity: 0
    }, 200).removeClass('visSave');
    $('#manager'+number).animate({
        opacity: 0
    }, 200, () => $('#manager'+number).addClass('inpInvis').removeClass('inpVis'));
    $('#exec'+number).animate({
        opacity: 0
    }, 200, () => $('#exec'+number).addClass('inpInvis').removeClass('inpVis'));
}

function deleteExec(id) {
    if(!$('#rm'+id).hasClass('invis')) {
        $.ajax({
          type: "POST",
          url: "/admin/exec/delete",
          data: "id="+id,
          success: function(msg){
            location=location;
          }
        });
    }
}

function saveExec(id) {
    var newName = $('#exec'+id).val();
    var newMan = $('#manager'+id).val();
    $.ajax({
        type: "POST",
        url: "/admin/exec/edit",
        data: "id="+id+'&newName='+newName+'&newMan='+newMan,
        success: function(msg){
            location=location;
        }
    });

}


function deleteMan(id) {
    if(!$('#rm'+id).hasClass('invis')) {
        $.ajax({
          type: "POST",
          url: "/admin/managers/delete",
          data: "id="+id,
          success: function(msg){
            location=location;
          }
        });
    }
}


function saveMan(name, id) {
    var newName = $('#exec'+id).val().trim();
    if(name != newName) {
        $.ajax({
            type: "POST",
            url: "/admin/managers/edit",
            data: "id="+id+'&newName='+newName,
            success: function(msg){
                location=location;
            }
        });
    }
}
