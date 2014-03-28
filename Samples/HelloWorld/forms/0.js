(function (window) {

    var form = $A.Form.extend(0);

    form.prototype.init = function () {
        var _label = new $A.Label(null, "Hello World, Amanda", 200, 150);
        this.body.append(_label);
    };


})(window);