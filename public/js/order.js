window.onload = function () {
    var i = document.createElement("input");
    i.setAttribute("type", "date");
    if(i.type != 'date') {
        // $('.search-date').datepicker();
    }
}

function setAttr(prmName,val){
    var res = '';
	var d = location.href.split("#")[0].split("?");
	var base = d[0];
	var query = d[1];
	if(query) {
		var params = query.split("&");
		for(var i = 0; i < params.length; i++) {
			var keyval = params[i].split("=");
			if(keyval[0] != prmName) {
				res += params[i] + '&';
			}
		}
	}
	res += prmName + '=' + val;
	window.location.href = base + '?' + res;
	return false;
}

function changePage(disabled, val){
    if(disabled != 'page-item disabled')
        setAttr('page', val)
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

function search() {
    var id = $('#search_id').val(),
        type = $('#search_type').val(),
        gus = $('#search_gus').val(),
        exec = $('#search_exec').val(),
        stage = $('#search_stage').val(),
        start = $('#search_start').val(),
        end = $('#search_end').val();

    window.location.search = `id=${id}&type=${type}&gus=${gus}&exec=${exec}&stage=${stage}&start=${start}&end=${end}`;
}
