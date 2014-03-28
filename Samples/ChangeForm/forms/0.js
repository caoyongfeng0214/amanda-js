(function (window) {

    var form = $A.Form.extend(0);

    form.imgs = {
        btn0: "imgs/btn0.png"
    };

    form.prototype.init = function () {
        var bodySize = this.body.size;
        var div = new $A.Div(null, 0, 0, bodySize[0], bodySize[1]);
        div.style.backgroundColor = "#C0C0C0";
        this.body.append(div);

        var lbl = new $A.Label(null, "This is Form 0", 200, 20, "bold 28px Verdana", 2, [0, 51, 0, 1]);
        div.append(lbl);

        var str = "白马饰金羁，连翩西北驰。借问谁家子，幽并游侠儿。少小去乡邑，扬声沙漠陲。宿昔秉良弓，楛矢何参差。控弦破左的，右发摧月支。"
                + "仰手接飞猱，俯身散马蹄。狡捷过猴猿，勇剽若豹螭。边城多警急，胡虏数迁移。羽檄从北来，厉马登高堤。长驱蹈匈奴，左顾陵鲜卑。"
                + "弃身锋刃端，性命安可怀？父母且不顾，何言子与妻？名编壮士籍，不得中顾私。捐躯赴国难，视死忽如归。";
        var span = new $A.Span(null, str, 50, 100, bodySize[0] - 100, 0, "15px Verdana", "#660066");
        div.append(span);

        var btn = new $A.Button(null, 250, bodySize[1] - 80, form.imgs.btn0, [0, 0, 86, 30], [0, 30, 86, 30], [0, 60, 86, 30]);
        btn.addEvent("click", function (srcEle, evt) {
            $A.changeForm(1);
        });
        div.append(btn);
    };


})(window);