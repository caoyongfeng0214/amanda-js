(function (window) {

    var form = $A.Form.extend(0);

    form.imgs = {
        square: "imgs/square.jpg",
        cartoon: "imgs/cartoon.png"
    };

    var eleSquare;
    form.prototype.init = function () {
        var bodySize = this.body.size;
        var div = new $A.Div(null, 0, 0, bodySize[0], bodySize[1]);
        div.style.backgroundColor = "#C0C0C0";
        this.body.append(div);

        eleSquare = new $A.EleBase(null, 400, 100, $A.image.load(form.imgs.square));
        div.append(eleSquare);

        var cartoonSufs = [];
        for (var _i = 0; _i < 12; _i++) {
            cartoonSufs.push($A.image.load(form.imgs.cartoon, [100 * _i, 0, 100, 100]));
        }
        var eleCartoon = new $A.EleBase(null, 200, 200, cartoonSufs[0]);
        eleCartoon.setAttr("idx", 0);
        div.append(eleCartoon);
        $A.setTimeout(function () {
            var newIdx = eleCartoon.getAttr("idx") + 1;
            if (newIdx == cartoonSufs.length) {
                newIdx = 0;
            }
            eleCartoon.surface = cartoonSufs[newIdx];
            eleCartoon.setAttr("idx", newIdx);
        }, 200, null, 0);
    };


    form.prototype.onTick = function (timespan, dtNow) {
        eleSquare.rotate(1);
    };


})(window);