window.onload = function() {
    var deleteB = document.querySelectorAll('.black-list__delete');
    var cancelB = document.querySelectorAll('.black-list__cancel');

    deleteB.forEach( item => {
        item.addEventListener('click', deleteFromBlackList);
        item.addEventListener('touch', deleteFromBlackList);
    });


    cancelB.forEach( item => {
        item.addEventListener('click', cancelDeletion);
        item.addEventListener('touch', cancelDeletion);
    })
};


function deleteFromBlackList(e) {
    var phone = this.getAttribute('data-phone');
    var idx = this.getAttribute('data-idx');
    var item = document.getElementById(idx);

    phone && $.ajax({
        type: 'POST',
        url: '/collector/blacklist/delete',
        data: {
            phone: phone
        },
        success: () => {
            item.classList.add('black-list__item_deleted');
        },
        error: (err) => {
            console.log(err)
        }
    });
}

function cancelDeletion(e) {
    var phone = this.getAttribute('data-phone');
    var idx = this.getAttribute('data-idx');
    var item = document.getElementById(idx);

    phone && $.ajax({
        type: 'POST',
        url: '/collector/addToBlackList',
        data: {
            phone: phone
        },
        success: () => {
            item.classList.remove('black-list_loading_yes');
            item.classList.remove('black-list__item_deleted');
        }
    });
}
