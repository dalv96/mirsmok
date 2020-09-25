window.onload = function () {
    document.getElementById('search_start').addEventListener('blur', function () {
        const isValid = checkDate(this.value);

        if (!isValid) alert('Дата "от" некорректна');
    });

    document.getElementById('search_end').addEventListener('blur', function () {
        const isValid = checkDate(this.value);

        if (!isValid) alert('Дата "до" некорректна');
    });
}

function checkDate(value) {
    if (!value) {
        return true;
    }

    const [day, month, year] = value.split('.');

    if (!day || !month || !year) {
        return false;
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return false;
    }

    if (day > 31 || day < 1) {
        return false;
    }

    if (month > 12 || month < 1) {
        return false;
    }

    if (year > 2100 || year  < 2000) {
        return false;
    }

    return true;
}