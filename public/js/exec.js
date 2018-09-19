function startEdit(number) {
    $("#exec"+number).addClass('exec_edited');
}

function cancelEdit(number) {
    $("#exec"+number).removeClass('exec_edited');
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
    var newName = $('#name'+id).val();
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
