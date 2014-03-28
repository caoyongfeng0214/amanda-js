(function (window) {

    var form = $A.Form.extend(0);

    form.audios = {
        bk: "res/bk.ogg"
    };

    var mixbk;

    form.prototype.init = function () {
        var btn = new $A.Button(null, 300, 300);
        btn.text = "Play";
        btn.addEvent("click", function (srcEle) {
            var state = srcEle.getAttr("state") || false;
            srcEle.setAttr("state", !state);
            srcEle.text = state ? "Play" : "Stop";
            if (state) {
                if (mixbk) {
                    mixbk.stop();
                }
            } else{
                mixbk = $A.mixer.sound(form.audios.bk, true);
            }
        });
        this.body.append(btn);
    };


})(window);