(function (window) {

    var form = $A.Form.extend(0);

    form.imgs = {
        pig: "imgs/pig.png"
    };

    var walls = [], pig;

    form.prototype.init = function () {
        var bodySize = this.body.size;
        var div = new $A.Div(null, 0, 0, bodySize[0], bodySize[1]);
        div.style.backgroundColor = "#666666";
        this.body.append(div);

        var wall0 = new $A.Div(null, 0, 0, bodySize[0], 20);
        wall0.style.backgroundColor = "#996600";
        this.body.append(wall0);
        walls.push(wall0);
        var wall1 = new $A.Div(null, bodySize[0] - 20, 0, 20, bodySize[1]);
        wall1.style.backgroundColor = "#996600";
        this.body.append(wall1);
        walls.push(wall1);
        var wall2 = new $A.Div(null, 0, bodySize[1] - 20, bodySize[0], 20);
        wall2.style.backgroundColor = "#996600";
        this.body.append(wall2);
        walls.push(wall2);
        var wall3 = new $A.Div(null, 0, 0, 20, bodySize[1]);
        wall3.style.backgroundColor = "#996600";
        this.body.append(wall3);
        walls.push(wall3);

        pig = new $A.EleBase(null, 200, 250, $A.image.load(form.imgs.pig));
        this.body.append(pig);

        var r = $A.vectors.len(bodySize);
        var v = Math.random() * 360, toPos = $A.vectors.rotate([r, 0], $A.VPI * v),
            fun_moveTo = function (pos2) {
                pig.moveTo([pos2[0], pos2[1]], 100, null, function (eleX, eleY) {
                    return walls.some(function (_T, _idx) {
                        if (pig.getAttr("precollide") != _idx) {
                            var rect = pig.collide(_T);
                            if (rect) {
                                pig.stopMove();
                                pig.setAttr("precollide", _idx);
                                var _oldv = pig.getAttr("v0"), _newv;
                                if (_idx == 0 || _idx == 2) {
                                    _newv = 360 - _oldv;
                                } else {
                                    if (_oldv > 270) {
                                        _oldv -= 360;
                                    }
                                    _newv = 180 - _oldv;
                                }
                                _newv = $A.math.normaliseDegrees(_newv);
                                toPos = $A.vectors.rotate([r, 0], $A.VPI * _newv);
                                pig.setAttr("v0", _newv);
                                fun_moveTo([toPos[0] + pig.center[0], toPos[1] + pig.center[1]]);
                                return true;
                            }
                        }
                    });
                });
            };
        pig.setAttr("v0", v);
        fun_moveTo([toPos[0] + pig.center[0], toPos[1] + pig.center[1]]);
    };


})(window);