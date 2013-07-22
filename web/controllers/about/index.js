module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }

    return controller
}
