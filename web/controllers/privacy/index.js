module.exports = function() {
    var controller = {
        $el: $('<div class="privacy">').html(require('./template.html')())
    }

    return controller
}
