(function (window) {

    var form = $A.Form.extend(0);

    form.prototype.init = function () {
        var _label = new $A.Label(null, "", 200, 150);
        this.body.append(_label);

        var _btn = new $A.Button(null, 220, 250);
        _btn.text = "Click";
        _btn.addEvent("click", function (srcEle, evt) {
            _label.text = "Hello World, Amanda";
        });
        this.body.append(_btn);
    };


})(window);