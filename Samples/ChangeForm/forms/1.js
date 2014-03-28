(function (window) {

    var form = $A.Form.extend(1);

    form.imgs = {
        btn1: "imgs/btn1.png"
    };

    form.prototype.init = function () {
        var bodySize = this.body.size;
        var div = new $A.Div(null, 0, 0, bodySize[0], bodySize[1]);
        div.style.backgroundColor = "#C0C0C0";
        this.body.append(div);

        var lbl = new $A.Label(null, "This is Form 1", 200, 20, "bold 28px Verdana", 2, [0, 51, 0, 1]);
        div.append(lbl);

        var str0 = "红酥手，黄縢酒，满城春色宫墙柳。东风恶，欢情薄。一怀愁绪，几年离索。错、错、错。",
            str1 = "春如旧，人空瘦，泪痕红浥鲛绡透。桃花落，闲池阁。山盟虽在，锦绣难托。莫、莫、莫！";
        var span0 = new $A.Span(null, str0, 50, 100, bodySize[0] - 100, 0, "15px Verdana", "#660066", 40);
        div.append(span0);
        var span1 = new $A.Span(null, str1, 50, 100 + span0.size[1] + 30, bodySize[0] - 100, 0, "15px Verdana", "#660066", 40);
        div.append(span1);

        var btn = new $A.Button(null, 250, bodySize[1] - 80, form.imgs.btn1, [0, 0, 86, 30], [0, 30, 86, 30], [0, 60, 86, 30]);
        btn.addEvent("click", function (srcEle, evt) {
            $A.changeForm(0);
        });
        div.append(btn);
    };


})(window);