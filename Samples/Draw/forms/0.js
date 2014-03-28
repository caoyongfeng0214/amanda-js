(function (window) {

    var form = $A.Form.extend(0);

    form.prototype.init = function () {
        var _suf = new $A.Surface([500, 350]);
        $A.draw.line(_suf, "red", [0, 10], [300, 10], 1);
        $A.draw.lines(_suf, "blue", true, [[350, 10], [400, 10], [450, 60], [340, 80]], 2);
        $A.draw.circle(_suf, "#999966", [100, 100], 80, 3);
        $A.draw.oval(_suf, "#99CC00", [100, 100], 70, 40, 0);
        $A.draw.rect(_suf, "#666666", new $A.Rect([200, 100], [150, 100]), 0, ["#009933", "#CCFFFF", 250, 150, 5, 250, 150, 170]);
        $A.draw.arc(_suf, "#660066", new $A.Rect([10, 200], [100, 100]), 0, 90, 2);
        $A.draw.polygon(_suf, "#666666", [[150, 200], [200, 200], [230, 230], [230, 280], [200, 310], [150, 310], [120, 280], [120, 230]], 1);
        $A.draw.quadraticCurve(_suf, "#CC6699", [10, 250], [200, 300], [80, 200], 0);
        $A.draw.bezierCurve(_suf, "#3399FF", [350, 200], [450, 250], [380, 180], [420, 280], 3);
        $A.draw.polygonArc(_suf, "#339966", [[305, 250], [400, 250, 10], [400, 330, 10], [300, 330, 10], [300, 250, 10]], 1);
        var _ele = new $A.EleBase(null, 10, 10, _suf);
        this.body.append(_ele);
    };


})(window);