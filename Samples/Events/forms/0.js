(function (window) {

    var form = $A.Form.extend(0);

    form.prototype.init = function () {
        var div_mouse_over_out = new $A.Div(null, 0, 0, 200, 100);
        div_mouse_over_out.style.backgroundColor = "black";
        this.body.append(div_mouse_over_out);
        var lbl_mouse_over_out = new $A.Label(null, "mouseover, mourseout", 20, 40);
        lbl_mouse_over_out.style.fontColor = "white";
        div_mouse_over_out.append(lbl_mouse_over_out);
        div_mouse_over_out.addEvent("mouseover", function (srcEle, evt) {
            lbl_mouse_over_out.text = "mouse over";
        });
        div_mouse_over_out.addEvent("mouseout", function (srcEle, evt) {
            lbl_mouse_over_out.text = "mouse out";
        });

        var lbl_click = new $A.Label(null, "", 30, 150);
        this.body.append(lbl_click);
        var btn_click = new $A.Button(null, 30, 200, [100, 40]);
        btn_click.text = "Click Me";
        btn_click.addEvent("click", function (srcEle, evt) {
            var clickn = (srcEle.getAttr("n") || 0) + 1;
            lbl_click.text = "Clicked times: " + clickn;
            srcEle.setAttr("n", clickn);
        });
        this.body.append(btn_click);

        var lbl_mousemove = new $A.Label(null, "", 250, 2);
        this.body.append(lbl_mousemove);
        this.body.addEvent("mousemove", function (srcEle, evt) {
            lbl_mousemove.text = "mousemove: [ " + evt.pos[0] + ", " + evt.pos[1] + "]";
        });

        var div_drag = new $A.Div(null, 300, 50, 150, 30);
        div_drag.style.backgroundColor = "#336699";
        this.body.append(div_drag);
        var lbl_drag = new $A.Label(null, "Drag Me", 50, 7);
        lbl_drag.style.fontColor = "yellow";
        div_drag.append(lbl_drag);
        div_drag.canDrag = true;
    };


})(window);