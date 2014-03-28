if (!Array.prototype.find) {
    Array.prototype.find = function (pFun) {
        for (var _i = 0; _i < this.length; _i++) {
            if (pFun(this[_i])) {
                return this[_i];
            }
        }
        return null;
    };
}

(function (window) {
    window.$A = {};

    var A = window.$A;

    var log = A.log = function (pMsg) {
        if (console) {
            console.log(pMsg);
        }
    };

    A.getX = function (elem) {
        return elem.offsetParent ? elem.offsetLeft + A.getX(elem.offsetParent) : elem.offsetLeft;
    };

    A.getY = function(elem){
        return elem.offsetParent ? elem.offsetTop + A.getY(elem.offsetParent) : elem.offsetTop;
    };

    A.getXInParent = function (elem) {
        return elem.parentNode == elem.offsetParent ? elem.offsetLeft : A.getX(elem) - A.getX(elem.parentNode);
    };

    A.getYInParent = function (elem) {
        return elem.parentNode == elem.offsetParent ? elem.offsetTop : A.getY(elem) - A.getY(elem.parentNode);
    };


    var localDB = A.localDB = {};
    localDB.dbName = "amd";
    localDB.tbName = null;
    localDB.ver = 1;
    localDB.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    localDB.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    localDB.IDBTrans = window.IDBTransaction || window.webkitIDBTransaction;
    localDB._storeImg = false;
    localDB._storeMixer = false;

    localDB.deleteDB = function (callbackFun) {
        if (localDB.db) {
            localDB.db.close();
            localDB.db = null;
        }
        var req = localDB.indexedDB.deleteDatabase(localDB.dbName);
        req.onsuccess = function (e) {
            if (callbackFun) {
                callbackFun(true);
            }
        };
        req.onerror = function (e) {
            if (callbackFun) {
                callbackFun(false);
            }
        };
    };

    localDB.clearTb = function (callbackFun) {
        localDB.getDB(function (pDB) {
            var store = pDB.transaction(localDB.tbName, "readwrite").objectStore(localDB.tbName);
            var req = store.clear();
            req.onsuccess = function (e) {
                if (callbackFun) {
                    callbackFun(true);
                }
            };
            req.onerror = function (e) {
                if (callbackFun) {
                    callbackFun(false);
                }
            };
        });
    };

    localDB.open = function (callbackFun) {
        var openReq = localDB.indexedDB.open(localDB.dbName, localDB.ver);
        openReq.onerror = function (e) {
            callbackFun();
        };
        openReq.onsuccess = function (e) {
            localDB.db = openReq.result;
            callbackFun();
        };
        openReq.onupgradeneeded = function (e) {
            var kvStore = e.currentTarget.result.createObjectStore(localDB.tbName, { keyPath: "k", autoIncrement: false });
        };
    };

    localDB.getDB = function (callbackFun) {
        if (localDB.indexedDB) {
            if (localDB.db) {
                callbackFun(localDB.db);
            } else {
                try {
                    localDB.open(function () {
                        callbackFun(localDB.db);
                    });
                } catch (ex) {
                    callbackFun(null);
                }
            }
        } else {
            callbackFun(null);
        }
    };

    localDB.insert = function (key, value, callbackFun) {
        localDB.getDB(function (pDB) {
            if (pDB) {
                try {
                    var trans = pDB.transaction(localDB.tbName, "readwrite");
                    var store = trans.objectStore(localDB.tbName);
                    var req = store.add({ k: key, v: value });
                    req.onsuccess = function (e) {
                        if (callbackFun) {
                            callbackFun(true);
                        }
                    };
                    req.onerror = function (e) {
                        callbackFun(false);
                    };
                } catch (ex) {
                    if (callbackFun) {
                        callbackFun(false);
                    }
                }
            } else {
                if (callbackFun) {
                    callbackFun(false);
                }
            }
        });
    };

    localDB.get = function (key, callbackFun) {
        localDB.getDB(function (pDB) {
            if (pDB) {
                try {
                    var store = pDB.transaction(localDB.tbName).objectStore(localDB.tbName);
                    var req = store.get(key);
                    req.onsuccess = function (e) {
                        var kv = e.target.result;
                        if (kv) {
                            callbackFun(kv);
                        } else {
                            callbackFun(null);
                        }
                    };
                    req.onerror = function (e) {
                        callbackFun(null);
                    };
                } catch (ex) {
                    callbackFun(null);
                }
            } else {
                callbackFun(null);
            }
        });
    };

    localDB.remove = function (key, callbackFun) {
        localDB.getDB(function (pDB) {
            if (pDB) {
                try {
                    var trans = pDB.transaction(localDB.tbName, "readwrite");
                    var store = trans.objectStore(localDB.tbName);
                    var req = store["delete"](key);
                    req.onsuccess = function (e) {
                        if (callbackFun) {
                            callbackFun(true);
                        }
                    };
                    req.onerror = function (e) {
                        //console.log("delete onerr");
                        if (callbackFun) {
                            callbackFun(false);
                        }
                    };
                } catch (ex) {
                    //console.log("delete error");
                    if (callbackFun) {
                        callbackFun(false);
                    }
                }
            } else {
                if (callbackFun) {
                    callbackFun(false);
                }
            }
        });
    };

    localDB.update = function (key, value, callbackFun) {
        localDB.getDB(function (pDB) {
            if (pDB) {
                try {
                    var trans = pDB.transaction(localDB.tbName, "readwrite");
                    var store = trans.objectStore(localDB.tbName);
                    var req = store.get(key);
                    req.onsuccess = function (e) {
                        var kv = e.target.result;
                        if (kv) {
                            kv.v = value;
                            var putReq = store.put(kv);
                            putReq.onsuccess = function (e) {
                                if (callbackFun) {
                                    callbackFun(true);
                                }
                            };
                            putReq.onerror = function (e) {
                                if (callbackFun) {
                                    callbackFun(false);
                                }
                            };
                        } else {
                            var addReq = store.add({ k: key, v: value });
                            addReq.onsuccess = function (e) {
                                if (callbackFun) {
                                    callbackFun(true);
                                }
                            };
                            addReq.onerror = function (e) {
                                if (callbackFun) {
                                    callbackFun(false);
                                }
                            };
                        }
                    };
                    req.onerror = function (e) {
                        if (callbackFun) {
                            callbackFun(false);
                        }
                    };
                } catch (ex) {
                    if (callbackFun) {
                        callbackFun(false);
                    }
                }
            } else {
                if (callbackFun) {
                    callbackFun(false);
                }
            }
        });
    };

    A.getFromDB = function (key, callbackFun) {
        localDB.get(key, function (re) {
            if (re) {
                callbackFun(re.v);
            } else {
                callbackFun(undefined);
            }
        });
    };

    A.addImgToDB = function (key, img, callbackFun) {
        var _imgData = null;
        if (typeof (img) === "string") {
            _imgData = img;
        } else {
            var _cvs = null;
            if (img.nodeName === "IMG") {
                _cvs = document.createElement("canvas");
                _cvs.width = img.width;
                _cvs.height = img.height;
                var _ctx = _cvs.getContext("2d");
                _ctx.drawImage(img, 0, 0);
            } else if (img.nodeName === "CANVAS") {
                _cvs = img;
            }
            if (_cvs) {
                try{
                    _imgData = _cvs.toDataURL();
                } catch (ex) {}
            }
        }
        if (_imgData) {
            localDB.update(key, _imgData, callbackFun);
        } else {
            callbackFun(false);
        }
    };

    

    A.VPI = Math.PI / 180;

    var ___unique_id = 0;
    function ___genUniqueId() {
        ___unique_id++;
        return Date.now().toString() + ___unique_id;
    }

    //=========   :objects   ============================================
    var objects = A.objects = {};

    objects.extend = function (subClass, superClass) {
        if (subClass && superClass) {
            var f = new Function();
            f.prototype = superClass.prototype;

            subClass.prototype = new f();
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;
            subClass.superConstructor = superClass;
        }
        return;
    };

    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
    objects.keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }

        var ret = [], p;
        for (p in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, p)) {
                ret.push(p);
            }
        }
        return ret;
    };

    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
    objects.accessor = function (object, name, get, set) {
        // ECMA5
        if (Object.defineProperty !== undefined) {
            Object.defineProperty(object, name, {
                get: get,
                set: set
            });
            // non-standard
        } else if (Object.prototype.__defineGetter__ !== undefined) {
            object.__defineGetter__(name, get);
            if (set) {
                object.__defineSetter__(name, set);
            }
        }
        return;
    };

    objects.accessors = function (object, props) {
        objects.keys(props).forEach(function (propKey) {
            objects.accessor(object, propKey, props[propKey].get, props[propKey].set);
        });
        return;
    };
    //---------   objects end   -----------------------------------------


    //=========   :math   ===============================================

    var math = A.math = {};

    math.normaliseDegrees = function (degrees) {
        degrees = degrees % 360;
        if (degrees < 0) {
            degrees += 360;
        }
        return degrees;
    };

    math.normaliseRadians = function (radians) {
        radians = radians % (2 * Math.PI);
        if (radians < 0) {
            radians += (2 * Math.PI);
        }
        return radians;
    };

    // example:
    //      math.degrees(Math.asin(0.5))
    math.degrees = function (radians) {
        return radians / A.VPI;
    };

    // example:
    //      Math.sin(math.radians(30))
    math.radians = function (degrees) {
        return degrees * A.VPI;
    };

    // example:
    //      math.centroid([1,2], [10,20], [30,5], [20,10].....)
    math.centroid = function () {
        var args = Array.prototype.slice.apply(arguments, [0]),
            c = [0, 0];
        args.forEach(function (p) {
            c[0] += parseInt(p[0], 10);
            c[1] += parseInt(p[1], 10);
        });
        var len = args.length;
        return [
              c[0] / len,
              c[1] / len
           ];
    };

    //---------   math end   --------------------------------------------


    //=========   :vectors   ============================================

    var vectors = A.vectors = {};

    vectors.add = function (a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    };

    vectors.subtract = function (a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    };

    vectors.multiply = function (a, s) {
        if (typeof (s) === 'number') {
            return [a[0] * s, a[1] * s];
        }
        return [a[0] * s[0], a[1] * s[1]];
    };

    vectors.divide = function (a, s) {
        if (typeof s === 'number') {
            return [a[0] / s, a[1] / s];
        }
        throw new Error('only divide by scalar supported');
    };

    vectors.len = function (v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    };

    vectors.distance = function (a, b) {
        return vectors.len(vectors.subtract(a, b));
    };

    // example:
    //      vectors.unit(vectors.substract(a, b))
    vectors.unit = function (v) {
        var l = vectors.len(v);
        if (l) { return [v[0] / l, v[1] / l]; }
        return [0, 0];
    };

    // rotate vector
    // v: array(a vector)
    // radians: radians of rotate angle, can be negative
    // === example ===
    //      vectors.rotate([30, 20], 30 * A.VPI);
    //      vectors.rotate([30, 20], -30 * A.VPI);
    vectors.rotate = function (v, radians) {
        radians = math.normaliseRadians(radians);
        var _sinv = Math.sin(radians), _cosv = Math.cos(radians);
        return [v[0] * _cosv - v[1] * _sinv, v[0] * _sinv + v[1] * _cosv];
    };

    vectors.dot = function (v1, v2) {
        return (v1[0] * v2[0]) + (v1[1] * v2[1]);
    };

    // TODO: error
    vectors.angle = function (v1, v2) {
        var perpDot = v1[0] * v2[1] - v1[1] * v2[0];
        return Math.atan2(perpDot, vectors.dot(v1, v2));

        //var a1 = Math.atan2(v1[0], v1[1]);
        //var a2 = Math.atan2(v2[0], v2[1]);
        //var rel = a1 - a2;
        //return rel - Math.floor((rel + Math.PI) / (2 * Math.PI)) * (2 * Math.PI) - (2 * Math.PI);
    };

    // vector with max length as specified
    vectors.truncate = function (v, maxLength) {
        if (vectors.len(v) > maxLength) {
            return vectors.multiply(vectors.unit(v), maxLength);
        };
        return v;
    };

    //---------   vectors end   -----------------------------------------


    //=========   :matrix   =============================================

    var matrix = A.matrix = {};

    matrix.identity = function () {
        return [1, 0, 0, 1, 0, 0];
    };

    matrix.add = function (m1, m2) {
        return [
          m1[0] + m2[0],
          m1[1] + m2[1],
          m1[2] + m2[2],
          m1[3] + m2[3],
          m1[4] + m2[4],
          m1[5] + m2[5],
          m1[6] + m2[6]
       ];
    };

    matrix.multiply = function (m1, m2) {
        return [
          m1[0] * m2[0] + m1[2] * m2[1],
          m1[1] * m2[0] + m1[3] * m2[1],
          m1[0] * m2[2] + m1[2] * m2[3],
          m1[1] * m2[2] + m1[3] * m2[3],
          m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
          m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
       ];
    };

    matrix.translate = function (m1, dx, dy) {
        return matrix.multiply(m1, [1, 0, 0, 1, dx, dy]);
    };

    matrix.rotate = function (m1, angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle);
        return matrix.multiply(m1, [cos, sin, -sin, cos, 0, 0]);
    };

    matrix.rotation = function (m1) {
        return Math.atan2(m1[1], m1[0]);
    };

    matrix.scale = function (m1, svec) {
        var sx = svec[0],
            sy = svec[1];
        return matrix.multiply(m1, [sx, 0, 0, sy, 0, 0]);
    };

    //----------   matrix end   -----------------------------------------



    function normalizeRectArguments() {
        var left = 0,
            top = 0,
            width = 0,
            height = 0;

        if (arguments.length === 2) {
            if (arguments[0] instanceof Array && arguments[1] instanceof Array) {
                left = arguments[0][0];
                top = arguments[0][1];
                width = arguments[1][0];
                height = arguments[1][1];
            } else {
                left = arguments[0];
                top = arguments[1];
            }
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
            left = arguments[0][0];
            top = arguments[0][1];
            width = arguments[0][2];
            height = arguments[0][3];
        } else if (arguments.length === 1 && arguments[0] instanceof Rect) {
            left = arguments[0].left;
            top = arguments[0].top;
            width = arguments[0].width;
            height = arguments[0].height;
        } else if (arguments.length === 4) {
            left = arguments[0];
            top = arguments[1];
            width = arguments[2];
            height = arguments[3];
        } else {
            throw new Error('not a valid rectangle specification');
        }
        return { left: left || 0, top: top || 0, width: width || 0, height: height || 0 };
    }



    //=========   :time   ============================================

    var time = A.time = {};

    time.DUR = 30;
    time.LAST = null;
    time.START = null;
    time._CALLBACK = function () { };
    //time._interval_id = null;

    time.init = function () {
        time.START = Date.now();
        if (time.LAST) {
            time.LAST = time.START;
        } else {
            time._interval_id = setInterval(function () {
                var _now = Date.now();
                time._CALLBACK(_now - (time.LAST || _now), _now);
                time.LAST = _now;
                return;
            }, time.DUR);
        }
    };

    time.start = function (callbackfun) {
        time._CALLBACK = callbackfun;
    };

    time.stop = function () {
        time._CALLBACK = function () { };
        //        if (time._interval_id) {
        //            clearInterval(time._interval_id);
        //            time._interval_id = null;
        //        }
    };

    //---------   time end   -----------------------------------------


    // TODO:
    //=========   :event   ===========================================

    var event = A.event = {};

    event._CALLBACK = function () { };

    event.K_UP = 38;
    event.K_DOWN = 40;
    event.K_RIGHT = 39;
    event.K_LEFT = 37;

    event.K_SPACE = 32;
    event.K_BACKSPACE = 8;
    event.K_TAB = 9;
    event.K_ENTER = 13;
    event.K_SHIFT = 16;
    event.K_CTRL = 17;
    event.K_ALT = 18;
    event.K_ESC = 27;

    event.K_0 = 48;
    event.K_1 = 49;
    event.K_2 = 50;
    event.K_3 = 51;
    event.K_4 = 52;
    event.K_5 = 53;
    event.K_6 = 54;
    event.K_7 = 55;
    event.K_8 = 56;
    event.K_9 = 57;
    event.K_a = 65;
    event.K_b = 66;
    event.K_c = 67;
    event.K_d = 68;
    event.K_e = 69;
    event.K_f = 70;
    event.K_g = 71;
    event.K_h = 72;
    event.K_i = 73;
    event.K_j = 74;
    event.K_k = 75;
    event.K_l = 76;
    event.K_m = 77;
    event.K_n = 78;
    event.K_o = 79;
    event.K_p = 80;
    event.K_q = 81;
    event.K_r = 82;
    event.K_s = 83;
    event.K_t = 84;
    event.K_u = 85;
    event.K_v = 86;
    event.K_w = 87;
    event.K_x = 88;
    event.K_y = 89;
    event.K_z = 90;

    event.K_KP1 = 97;
    event.K_KP2 = 98;
    event.K_KP3 = 99;
    event.K_KP4 = 100;
    event.K_KP5 = 101;
    event.K_KP6 = 102;
    event.K_KP7 = 103;
    event.K_KP8 = 104;
    event.K_KP9 = 105;

    event.NOEVENT = 0;
    event.NUMEVENTS = 32000;

    event.DISPLAY_FULLSCREEN_ENABLED = 300;
    event.DISPLAY_FULLSCREEN_DISABLED = 301;

    event.QUIT = 0;
    event.KEY_DOWN = 1;
    event.KEY_UP = 2;
    event.MOUSE_MOTION = 3;
    event.MOUSE_UP = 4;
    event.MOUSE_DOWN = 5;
    event.MOUSE_WHEEL = 6;
    event.CLICK = 7;
    event.USEREVENT = 2000;

    event.Event = function () {
        /**
        * The type of the event. e.g., event.QUIT, KEYDOWN, MOUSEUP.
        */
        this.type = null;
        /**
        * key the keyCode of the key. compare with event.K_a, event.K_b,...
        */
        this.key = null;
        /**
        * relative movement for a mousemove event
        */
        this.rel = null;
        /**
        * the number of the mousebutton pressed
        */
        this.button = null;
        /**
        * pos the position of the event for mouse events
        */
        this.pos = null;
    };

    event.init = function () {
        var lastPos = [];

        function onClick(ev) {
            var canvasOffset = display._getCanvasOffset();
            event._CALLBACK({
                'type': event.CLICK,
                'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
                'button': ev.button,
                'shiftKey': ev.shiftKey,
                'ctrlKey': ev.ctrlKey,
                'metaKey': ev.metaKey
            });
        }

        function onMouseDown(ev) {
            var canvasOffset = display._getCanvasOffset();
            event._CALLBACK({
                'type': event.MOUSE_DOWN,
                'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
                'button': ev.button,
                'shiftKey': ev.shiftKey,
                'ctrlKey': ev.ctrlKey,
                'metaKey': ev.metaKey
            });
        }

        function onMouseUp(ev) {
            var canvasOffset = display._getCanvasOffset();
            event._CALLBACK({
                'type': event.MOUSE_UP,
                'pos': [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
                'button': ev.button,
                'shiftKey': ev.shiftKey,
                'ctrlKey': ev.ctrlKey,
                'metaKey': ev.metaKey
            });
        }

        function onKeyDown(ev) {
            var key = ev.keyCode || ev.which;
            event._CALLBACK({
                'type': event.KEY_DOWN,
                'key': key,
                'shiftKey': ev.shiftKey,
                'ctrlKey': ev.ctrlKey,
                'metaKey': ev.metaKey
            });

            // if the display has focus, we surpress default action
            // for most keys
            if (display._hasFocus() &&
                (!ev.ctrlKey && !ev.metaKey &&
                    (
                        (key >= event.K_LEFT && key <= event.K_DOWN) ||
                        (key >= event.K_0 && key <= event.K_z) ||
                        (key >= event.K_KP1 && key <= event.K_KP9) ||
                        key === event.K_SPACE ||
                        key === event.K_TAB ||
                        key === event.K_ENTER
                    )
                ) ||
                key === event.K_ALT ||
                (key === event.K_BACKSPACE && (ev.srcElement || ev.target).nodeName.toLowerCase() != 'input')) {
                ev.preventDefault();
            }
        }

        function onKeyUp(ev) {
            event._CALLBACK({
                'type': event.KEY_UP,
                'key': ev.keyCode,
                'shiftKey': ev.shiftKey,
                'ctrlKey': ev.ctrlKey,
                'metaKey': ev.metaKey
            });
        }

        function onMouseMove(ev) {
            var canvasOffset = display._getCanvasOffset(),
                currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]],
                relativePos = [];
            if (lastPos.length) {
                relativePos = [
                        lastPos[0] - currentPos[0],
                        lastPos[1] - currentPos[1]
                    ];
            }
            event._CALLBACK({
                'type': event.MOUSE_MOTION,
                'pos': currentPos,
                'rel': relativePos,
                'buttons': null,
                'timestamp': ev.timeStamp,
                'movement': [
                                ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0,
                                ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0
                      ]
            });
            lastPos = currentPos;
            return;
        }

        function onMouseScroll(ev) {
            var canvasOffset = display._getCanvasOffset(),
                currentPos = [ev.clientX - canvasOffset[0], ev.clientY - canvasOffset[1]];
            event._CALLBACK({
                type: event.MOUSE_WHEEL,
                pos: currentPos,
                delta: ev.detail || (-ev.wheelDeltaY / 40),
                evt:ev
            });
            return;
        }

        function onBeforeUnload(ev) {
            event._CALLBACK({
                'type': event.QUIT
            });
            return;
        }

        var canvas = display.getSurface().canvas;
        document.addEventListener('click', onClick, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mousewheel', onMouseScroll, false);
        // MOZFIX
        // https://developer.mozilla.org/en/Code_snippets/Miscellaneous#Detecting_mouse_wheel_events
        canvas.addEventListener('DOMMouseScroll', onMouseScroll, false);
        canvas.addEventListener('beforeunload', onBeforeUnload, false);
    };

    // http://msdn.microsoft.com/en-us/library/ie/ms535862(v=vs.85).aspx#events
    document.addEventListener("DOMContentLoaded", function () {
        // block right key
        document.addEventListener("contextmenu", function (evt) { evt.preventDefault(); });
        // block select
        // https://developer.mozilla.org/en-US/docs/Web/CSS/user-select
        // http://msdn.microsoft.com/en-us/library/ie/hh869403(v=vs.85).aspx
        document.body.style.webkitUserSelect = document.body.style.MozUserSelect = document.body.style.msUserSelect = "none";
    });

    //event._handlers = {};
    var event_handlers = {};

    //event._addEvent_chkTop
    var event_addEvent_chkTop = function (ele, otherEle) {
        if (ele.isChild(otherEle)) {
            return true;
        } else if (ele.isFather(otherEle)) {
            return false;
        } else {
            var _fn_chk = function (_ele0, _ele1) {
                var _parent0 = _ele0.parent, _parent1 = _ele1.parent;
                if (_parent0) {
                    if (_parent0 == _parent1) {
                        if (_ele0.tabIndex == _ele1.tabIndex) {
                            for (var _i = 0; _i < _parent0.childs.length; _i++) {
                                var _ele = _parent0.childs[_i];
                                if (_ele == _ele0) {
                                    return false;
                                } else if (_ele == _ele1) {
                                    return true;
                                }
                            }
                            return false;
                        } else {
                            return _ele0.tabIndex > _ele1.tabIndex;
                        }
                    } else {
                        if (_parent1) {
                            _fn_chk(_ele0, _parent1);
                        } else {
                            _fn_chk(_parent0, otherEle);
                        }
                    }
                }
                return false;
            };
            return _fn_chk(ele, otherEle);
        }
    };

    //event._addEvent
    // all arguments is require
    var event_addEvent = function (ele, eventType, eventHandler) {
        if (!event_handlers[eventType]) {
            event_handlers[eventType] = [];
        }
        var _item = event_handlers[eventType].find(function (_T) {
            return _T.ele == ele;
        });
        if (_item) {
            if (_item.handler) {
                if (!_item.handler.some(function (_T) {
                    return _T == eventHandler;
                })) {
                    _item.handler.push(eventHandler);
                }
            } else {
                _item.handler = [eventHandler];
            }
        } else {
            var _items = event_handlers[eventType];
            _item = { ele: ele, handler: [eventHandler] };
            if (_items.length == 0 || (A.CUR_FORM && ele == A.CUR_FORM.body)) {
                _items.push(_item);
            } else {
                var _idx = 0;
                for (var _i = 0; _i < _items.length; _i++) {
                    if (event_addEvent_chkTop(ele, _items[_i].ele)) {
                        _idx = _i;
                        break;
                    }
                }
                _items.splice(_idx, 0, _item);
            }
        }
    };

    //event._removeEvent
    // ele is requre
    // if not eventType，is mean move all bound events of the ele
    var event_removeEvent = function (ele, eventType, eventHandler) {
        if (eventType) {
            var _evts = event_handlers[eventType];
            if (_evts) {
                if (eventHandler) {
                    var _item = _evts.find(function (_T) {
                        return _T.ele == ele;
                    });
                    if (_item && _item.handler) {
                        _item.handler = _item.handler.filter(function (_T) {
                            return _T != eventHandler;
                        });
                    }
                } else {
                    event_handlers[eventType] = _evts.filter(function (_T) {
                        return _T.ele != ele;
                    });
                }
            }
        } else {
            for (var _evtType in event_handlers) {
                var _evts = event_handlers[_evtType];
                event_handlers[_evtType] = _evts.filter(function (_T) {
                    return _T.ele != ele;
                });
            }
        }
    };

    event.start = function (callbackfun) {
        event._CALLBACK = callbackfun;
        event_handlers = {};
    };

    event.stop = function () {
        event._CALLBACK = function () { };
        event_handlers = {};
    };

    //---------   event end   ----------------------------------------



    //=========   :Rect   ============================================

    // example:
    //      new Rect([left, top])
    //      new Rect(left, top)
    //      new Rect(left, top, width, height)
    //      new Rect([left, top], [width, height])
    //      new Rect(anotherRect)
    var Rect = A.Rect = function () {

        var args = normalizeRectArguments.apply(this, arguments);

        this.left = args.left;
        this.top = args.top;
        this.width = args.width;
        this.height = args.height;

        return this;
    };

    objects.accessors(Rect.prototype, {
        'bottom': {
            get: function () {
                return this.top + this.height;
            },
            set: function (newValue) {
                this.top = newValue - this.height;
                return;
            }
        },
        'right': {
            get: function () {
                return this.left + this.width;
            },
            set: function (newValue) {
                this.left = newValue - this.width;
            }
        },
        'center': {
            get: function () {
                return [this.left + (this.width / 2) | 0,
                 this.top + (this.height / 2) | 0
                ];
            },
            set: function () {
                var args = normalizeRectArguments.apply(this, arguments);
                this.left = args.left - (this.width / 2) | 0;
                this.top = args.top - (this.height / 2) | 0;
                return;
            }
        },
        'topleft': {
            get: function () {
                return [this.left, this.top];
            },
            set: function () {
                var args = normalizeRectArguments.apply(this, arguments);
                this.left = args.left;
                this.top = args.top;
                return;
            }
        },
        'bottomleft': {
            get: function () {
                return [this.left, this.bottom];
            },
            set: function () {
                var args = normalizeRectArguments.apply(this, arguments);
                this.left = args.left;
                this.bottom = args.top;
                return;
            }
        },
        'topright': {
            get: function () {
                return [this.right, this.top];
            },
            set: function () {
                var args = normalizeRectArguments.apply(this, arguments);
                this.right = args.left;
                this.top = args.top;
                return;
            }
        },
        'bottomright': {
            get: function () {
                return [this.right, this.bottom];
            },
            set: function () {
                var args = normalizeRectArguments.apply(this, arguments);
                this.right = args.left;
                this.bottom = args.top;
                return;
            }
        },
        'x': {
            get: function () {
                return this.left;
            },
            set: function (newValue) {
                this.left = newValue;
                return;
            }
        },
        'y': {
            get: function () {
                return this.top;
            },
            set: function (newValue) {
                this.top = newValue;
                return;
            }
        }
    });

    Rect.prototype.move = function () {
        var args = normalizeRectArguments.apply(this, arguments);
        return new Rect(this.left + args.left, this.top + args.top, this.width, this.height);
    };

    Rect.prototype.moveIp = function () {
        var args = normalizeRectArguments.apply(this, arguments);
        this.left += args.left;
        this.top += args.top;
        return;
    };

    Rect.prototype.collidePoint = function () {
        var args = normalizeRectArguments.apply(this, arguments);
        return (this.left <= args.left && args.left <= this.right) &&
            (this.top <= args.top && args.top <= this.bottom);
    };

    Rect.prototype.collideRect = function (rect) {
        return !(this.left > rect.right || this.right < rect.left ||
            this.top > rect.bottom || this.bottom < rect.top);
    };

    Rect.prototype.collideLine = function (p1, p2) {
        var x1 = p1[0], y1 = p1[1],
            x2 = p2[0], y2 = p2[1];

        function linePosition(point) {
            var x = point[0];
            var y = point[1];
            return (y2 - y1) * x + (x1 - x2) * y + (x2 * y1 - x1 * y2);
        }

        var _right = this.right, _bottom = this.bottom;

        var relPoses = [[this.left, this.top],
                   [this.left, _right],
                   [_right, this.top],
                   [_right, _bottom]
                  ].map(linePosition);

        var noNegative = true;
        var noPositive = true;
        var noZero = true;
        relPoses.forEach(function (relPos) {
            if (relPos > 0) {
                noPositive = false;
            } else if (relPos < 0) {
                noNegative = false;
            } else if (relPos === 0) {
                noZero = false;
            }
        }, this);

        if ((noNegative || noPositive) && noZero) {
            return false;
        }
        return !((x1 > _right && x2 > _right) ||
            (x1 < this.left && x2 < this.left) ||
            (y1 < this.top && y2 < this.top) ||
            (y1 > _bottom && y2 > _bottom)
            );
    };

    Rect.prototype.clip = function (rect) {
        if (!this.collideRect(rect)) {
            return new Rect(0, 0, 0, 0);
        }

        var x, y, width, height,
            _thisRight = this.right, _thisBottom = this.bottom,
            _otherRight = rect.right, _otherBottom = rect.bottom;

        // Left
        if ((this.left >= rect.left) && (this.left < _otherRight)) {
            x = this.left;
        } else if ((rect.left >= this.left) && (rect.left < _thisRight)) {
            x = rect.left;
        }

        // Right
        if ((_thisRight > rect.left) && (_thisRight <= _otherRight)) {
            width = _thisRight - x;
        } else if ((_otherRight > this.left) && (_otherRight <= _thisRight)) {
            width = _otherRight - x;
        }

        // Top
        if ((this.top >= rect.top) && (this.top < _otherBottom)) {
            y = this.top;
        } else if ((rect.top >= this.top) && (rect.top < _thisBottom)) {
            y = rect.top;
        }

        // Bottom
        if ((_thisBottom > rect.top) && (_thisBottom <= _otherBottom)) {
            height = _thisBottom - y;
        } else if ((_otherBottom > this.top) && (_otherBottom <= _thisBottom)) {
            height = _otherBottom - y;
        }
        return new Rect(x, y, width, height);
    };

    Rect.prototype.union = function (rect) {
        var x, y, width, height;

        x = Math.min(this.left, rect.left);
        y = Math.min(this.top, rect.top);
        width = Math.max(this.right, rect.right) - x;
        height = Math.max(this.bottom, rect.bottom) - y;
        return new Rect(x, y, width, height);
    };

    Rect.prototype.inflateIp = function (x, y) {
        this.left -= Math.floor(x / 2);
        this.top -= Math.floor(y / 2);
        this.width += x;
        this.height += y;
    };

    Rect.prototype.inflate = function (x, y) {
        var _rect = this.clone();
        _rect.inflateIp(x, y);
        return _rect;
    };

    Rect.prototype.clone = function () {
        return new Rect(this);
    };

    //---------   Rect end   --------------------------------------------


    //=========   :Surface   ============================================

    var Surface = A.Surface = function () {
        var args = normalizeRectArguments.apply(this, arguments);
        var width = args.left, height = args.top;
        if (arguments.length == 1 && arguments[0] instanceof Rect) {
            width = args.width;
            height = args.height;
        }

        this.matrix = matrix.identity();

        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;

        this.blitAlpha = 1.0;

        this.context = this.canvas.getContext('2d');

        this.context.mozImageSmoothingEnabled = true;
        this.context.webkitImageSmoothingEnabled = true;

        return this;
    };

    objects.accessors(Surface.prototype, {
        'rect': {
            get: function () {
                return this.getRect();
            }
        },
        'size': {
            get: function () {
                return this.getSize();
            }
        },
        'width': {
            get: function () {
                return this.canvas.width;
            },
            set: function (newValue) {
                this.canvas.width = newValue;
            }
        },
        'height': {
            get: function () {
                return this.canvas.height;
            },
            set: function (newValue) {
                this.canvas.height = newValue;
            }
        }
    });

    Surface.prototype.getSize = function () {
        return [this.canvas.width, this.canvas.height];
    };

    Surface.prototype.getRect = function () {
        return new Rect([0, 0], this.getSize());
    };

    // src: draw src to current surface
    // desc: draw to the position, coordinate or Rect
    // area: draw to the area, Array or Rect
    // repeatType: 1:repeat-x-y；2:repeat-x；3:repeat-y
    // compositeOperation: http://dev.w3.org/html5/2dcontext/#dom-context-2d-globalcompositeoperation
    Surface.prototype.blit = function (src, dest, area, repeatType, compositeOperation) {

        var rDest, rArea;

        if (dest instanceof Rect) {
            rDest = dest.clone();
            var srcSize = src.getSize();
            if (!rDest.width) {
                rDest.width = srcSize[0];
            }
            if (!rDest.height) {
                rDest.height = srcSize[1];
            }
        } else if (dest && dest instanceof Array && dest.length == 2) {
            rDest = new Rect(dest, src.getSize());
        } else {
            rDest = new Rect([0, 0], src.getSize());
        }
        compositeOperation = compositeOperation || 'source-over';

        // area within src to be drawn
        if (area instanceof Rect) {
            rArea = area;
        } else if (area && area instanceof Array && area.length == 2) {
            var size = src.getSize();
            rArea = new Rect(area, [size[0] - area[0], size[1] - area[1]]);
        } else {
            rArea = new Rect([0, 0], src.getSize());
        }

        if (isNaN(rDest.left) || isNaN(rDest.top) || isNaN(rDest.width) || isNaN(rDest.height)) {
            throw new Error('[blit] bad parameters, destination is ' + rDest);
        }

        this.context.save();
        this.context.globalCompositeOperation = compositeOperation;
        // first translate, then rotate
        var m = matrix.translate(matrix.identity(), rDest.left, rDest.top);
        m = matrix.multiply(m, src.matrix);
        this.context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        this.context.globalAlpha = src.blitAlpha;
        if (repeatType && repeatType >= 1 && repeatType <= 3) {
            var _ppstyle = "repeat";
            if (repeatType == 2) {
                _ppstyle = "repeat-x";
            } else if (repeatType == 3) {
                _ppstyle = "repeat-y";
            }
            var _pp = this.context.createPattern(src.canvas, _ppstyle);
            this.context.fillStyle = _pp;
            this.context.fillRect(rArea.left, rArea.top, rArea.width, rArea.height);
        } else {
            this.context.drawImage(src.canvas, rArea.left, rArea.top, rArea.width, rArea.height, 0, 0, rDest.width, rDest.height);
        }
        this.context.restore();
        return;
    };

    Surface.prototype.fill = function (color, rect) {
        this.context.save();
        this.context.fillStyle = color || "#000000";
        if (rect === undefined)
            rect = new Rect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillRect(rect.left, rect.top, rect.width, rect.height);
        this.context.restore();
        return;
    };

    Surface.prototype.clear = function (rect) {
        var size = this.getSize();
        rect = rect || new Rect(0, 0, size[0], size[1]);
        this.context.clearRect(rect.left, rect.top, rect.width, rect.height);
        return;
    };

    Surface.prototype.clone = function () {
        var newSurface = new Surface(this.getRect());
        newSurface.blit(this);
        return newSurface;
    };

    Surface.prototype.getAlpha = function () {
        return (1 - this.blitAlpha);
    };

    Surface.prototype.setAlpha = function (alpha) {
        if (isNaN(alpha) || alpha < 0 || alpha > 1) {
            return;
        }
        this.blitAlpha = (1 - alpha);
        return (1 - this.blitAlpha);
    };

    //http://dev.w3.org/html5/2dcontext/#canvaspixelarray
    Surface.prototype.getImageData = function () {
        var size = this.getSize();
        return this.context.getImageData(0, 0, size[0], size[1]);
    };

    Surface.genSurface = function (wh, cvs, eleStyle) {
        var _suf = new Surface(wh);
        if (cvs) {
            cvs.width = wh[0];
            cvs.height = wh[1];
            _suf.canvas = cvs;
            _suf.context = cvs.getContext("2d");
            _suf.context.mozImageSmoothingEnabled = true;
            _suf.context.webkitImageSmoothingEnabled = true;
        }
        if (eleStyle) {
            if (eleStyle.backgroundColor) {
                _suf.fill(eleStyle.backgroundColor);
            }
        }
        return _suf;
    };

    Surface.genBorderSuf = function (suf, borderW, rgba) {
        if (borderW > 0 && suf) {
            borderW = Math.ceil(borderW);
            var _size = suf.getSize(),
                _b = borderW * 2,
                _w = Math.ceil(_size[0] + _b), _h = Math.ceil(_size[1] + _b),
                _suf = Surface.genSurface([_w, _h]);
            draw.rect(_suf, "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")", new Rect(0, 0, _w, _h), 0);
            var _imgD = _suf.getImageData(),
                _imgData = _imgD.data, _imgData2 = suf.getImageData().data,
                _thisW = Math.ceil(_size[0]), _thisH = Math.ceil(_size[1]);

            for (var _i = 0; _i < _imgData.length; _i += 4) {
                var _i0 = _i / 4,
                    _row = parseInt(_i0 / _w), _col = _i0 % _w,
                    _row1 = _row - borderW, _col1 = _col - borderW,
                    _di = _imgData2[(_row1 * _thisW + _col1) * 4 + 3];
                if (_row1 >= 0 && _row1 < _thisH && _col1 >= 0 && _col1 < _thisW && _di > 0) {
                    _imgData[_i + 3] = 0;
                } else {
                    var _minx = _col1 - borderW, _maxx = _col,
                        _miny = _row1 - borderW, _maxy = _row;
                    if (_minx < 0) {
                        _minx = 0;
                    } else if (_minx > _thisW - 1) {
                        _minx = _thisW - 1;
                    }
                    if (_maxx < 0) {
                        _maxx = 0;
                    } else if (_maxx > _thisW - 1) {
                        _maxx = _thisW - 1;
                    }
                    if (_miny < 0) {
                        _miny = 0;
                    } else if (_miny > _thisH - 1) {
                        _miny = _thisH - 1;
                    }
                    if (_maxy < 0) {
                        _maxy = 0;
                    } else if (_maxy > _thisH - 1) {
                        _maxy = _thisH - 1;
                    }
                    var _bl = false;
                    for (var _e = _miny; _e <= _maxy; _e++) {
                        var _n = parseInt(_e * _thisW * 4), _row2 = _e + borderW;
                        for (var _f = _minx; _f <= _maxx; _f++) {
                            var _g = _n + _f * 4, _di2 = _imgData2[_g + 3];
                            if (typeof (_di2) != "undefined" && _di2 > 0) {
                                var _col2 = _f + borderW,
                                    _subx = _col2 - _col, _suby = _row2 - _row,
                                    _subt = Math.sqrt(_subx * _subx + _suby * _suby);
                                if (_subt <= borderW) {
                                    _bl = true;
                                    break;
                                }
                            }
                        }
                        if (_bl) {
                            break;
                        }
                    }
                    if (!_bl) {
                        _imgData[_i + 3] = 0;
                    }
                }
            }
            _suf.context.putImageData(_imgD, 0, 0);
            return _suf;
        }
        return null;
    };

    Surface.genBoxSuf = function (suf, topLeft, topMid, topRight, midLeft, midMid, midRight, btmLeft, btmMid, btmRight, startPos, width, height) {
        var _size = suf.getSize(),
            _topLeftSize = topLeft.getSize(), _topMidSize = topMid.getSize(), _topRightSize = topRight.getSize(),
            _midLeftSize = midLeft.getSize(), _midMidSize = midMid.getSize(), _midRightSize = midRight.getSize(),
            _btmLeftSize = btmLeft.getSize(), _btmMidSize = btmMid.getSize(), _btmRightSize = btmRight.getSize();
        if (!startPos) {
            startPos = [0, 0];
        }
        if (!width) {
            width = _size[0];
        }
        if (!height) {
            height = _size[1];
        }
        var _minLeftW = Math.min.apply(Math, [_topLeftSize[0], _midLeftSize[0], _btmLeftSize[0]]),
            _minRightW = Math.min.apply(Math, [_topRightSize[0], _midRightSize[0], _btmRightSize[0]]),
            _minTopH = Math.min.apply(Math, [_topLeftSize[1], _topMidSize[1], _topRightSize[1]]),
            _minBtmH = Math.min.apply(Math, [_btmLeftSize[1], _btmMidSize[1], _btmRightSize[1]]),
            _midMidX = _minLeftW + startPos[0],
            _midMidY = _minTopH + startPos[1],
            _midMidW = width - _minLeftW - _minRightW,
            _midMidH = height - _minTopH - _minBtmH;
        if (_midMidW > 0 && _midMidH > 0) {
            suf.blit(midMid, [_midMidX, _midMidY], new A.Rect([0, 0], [_midMidW, _midMidH]), 1);
        }
        var _midLeftH = height - _topLeftSize[1] - _btmLeftSize[1];
        if (_midLeftH > 0) {
            suf.blit(midLeft, [startPos[0], startPos[1] + _topLeftSize[1]], new A.Rect([0, 0], [_midLeftSize[0], _midLeftH]), 3);
        }
        var _midRightH = height - _topRightSize[1] - _btmRightSize[1];
        if (_midRightH > 0) {
            suf.blit(midRight, [startPos[0] + width - _midRightSize[0], startPos[1] + _topRightSize[1]], new A.Rect([0, 0], [_midRightSize[0], _midRightH]), 3);
        }
        var _topMidW = width - _topLeftSize[0] - _topRightSize[0];
        if (_topMidW > 0) {
            suf.blit(topMid, [startPos[0] + _topLeftSize[0], startPos[1]], new A.Rect([0, 0], [_topMidW, _topMidSize[1]]), 2);
        }
        suf.blit(topLeft, startPos);
        suf.blit(topRight, [startPos[0] + width - _topRightSize[0], startPos[1]]);
        var _btmMidW = width - _btmLeftSize[0] - _btmRightSize[0];
        if (_btmMidW > 0) {
            suf.blit(btmMid, [startPos[0] + _btmLeftSize[0], startPos[1] + height - _btmMidSize[1]], new A.Rect([0, 0], [_btmMidW, _btmMidSize[1]]), 2);
        }
        suf.blit(btmLeft, [startPos[0], startPos[1] + height - _btmLeftSize[1]]);
        suf.blit(btmRight, [startPos[0] + width - _btmRightSize[0], startPos[1] + height - _btmRightSize[1]]);
        return suf;
    };


    //---------   Surface end   ----------------------------------------



    //=========   :transform   =========================================

    var transform = A.transform = {};

    // rotate angle of rotation, clockwise
    transform.rotate = function (suf, angle) {
        var origSize = suf.getSize(),
            radians = angle * A.VPI,
            newSize = origSize;
        if (angle % 360 !== 0) {
            var rect = suf.getRect(),
                points = [
                        [-rect.width / 2, rect.height / 2],
                        [rect.width / 2, rect.height / 2],
                        [-rect.width / 2, -rect.height / 2],
                        [rect.width / 2, -rect.height / 2]
                    ],
                rotPoints = points.map(function (p) {
                    return vectors.rotate(p, radians);
                }),
                xs = rotPoints.map(function (p) { return p[0]; }),
                ys = rotPoints.map(function (p) { return p[1]; }),
                left = Math.min.apply(Math, xs),
                right = Math.max.apply(Math, xs),
                bottom = Math.min.apply(Math, ys),
                top = Math.max.apply(Math, ys);
            newSize = [right - left, top - bottom];
        }
        var newSurface = new Surface(newSize),
            oldMatrix = suf.matrix;
        suf.matrix = matrix.translate(suf.matrix, origSize[0] / 2, origSize[1] / 2);
        suf.matrix = matrix.rotate(suf.matrix, radians);
        suf.matrix = matrix.translate(suf.matrix, -origSize[0] / 2, -origSize[1] / 2);
        var offset = [(newSize[0] - origSize[0]) / 2, (newSize[1] - origSize[1]) / 2];
        newSurface.blit(suf, offset);
        suf.matrix = oldMatrix;
        return newSurface;
    };

    transform.scale = function (surface, dims) {
        var width = dims[0],
            height = dims[1];
        if (width <= 0 || height <= 0) {
            throw new Error('[transform.scale] Invalid arguments for height and width', [width, height]);
        }
        var oldDims = surface.getSize(),
            ws = width / oldDims[0],
            hs = height / oldDims[1],
            newSurface = new Surface([width, height]),
            originalMatrix = surface.matrix.slice(0);
        surface.matrix = matrix.scale(surface.matrix, [ws, hs]);
        newSurface.blit(surface);
        surface.matrix = originalMatrix;
        return newSurface;
    };

    transform.flip = function (surface, flipHorizontal, flipVertical) {
        var dims = surface.getSize(),
            newSurface = new Surface(dims),
            scaleX = 1,
            scaleY = 1,
            xPos = 0,
            yPos = 0;
        if (flipHorizontal === true) {
            scaleX = -1;
            xPos = -dims[0];
        }
        if (flipVertical === true) {
            scaleY = -1;
            yPos = -dims[1];
        }
        newSurface.context.save();
        newSurface.context.scale(scaleX, scaleY);
        newSurface.context.drawImage(surface.canvas, xPos, yPos);
        newSurface.context.restore();
        return newSurface;
    };

    //---------   transform end   --------------------------------------



    //=========   :draw   ==============================================

    var draw = A.draw = {};

    draw.___setFilter = function (ctx, filter) {
        if (filter) {
            if (typeof (filter) === "number") {
                ctx.globalAlpha = filter; // transparency
            } else { // gradient
                var gradient = null;
                if (filter.length >= 8) {
                    gradient = ctx.createRadialGradient(filter[2], filter[3], filter[4], filter[5], filter[6], filter[7]);
                } else {
                    var _gx0, _gy0, _gx1, _gy1;
                    if (filter.length >= 6) {
                        _gx0 = filter[2];
                        _gy0 = filter[3];
                        _gx1 = filter[4];
                        _gy1 = filter[5];
                        gradient = ctx.createLinearGradient(_gx0, _gy0, _gx1, _gy1);
                    }
                }
                if (gradient) {
                    gradient.addColorStop(0, filter[0]);
                    gradient.addColorStop(1, filter[1]);
                    ctx.fillStyle = ctx.strokeStyle = gradient;
                }
            }
        }
    };

    //filter: transparency or gradient.
    //          if number, is transparency
    //          if array, is gradient
    //              if array.length == 6, is linear gradient. [0]:begin color; [1]:end color; [2]:begin x; [3]:begin y; [4]:end x; [5]:end y
    //              if array.length == 8, is radial gradient. [0]:begin color; [1]:end color; [2]:begin center x; [3]:begin center y; [4]:begin diameter; [5]:end center x; [6]:end center y; [7]:end diameter
    draw.line = function (surface, color, startPos, endPos, width, filter) {
        var ctx = surface.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.lineWidth = width || 1;
        ctx.moveTo(startPos[0], startPos[1]);
        ctx.lineTo(endPos[0], endPos[1]);
        ctx.stroke();
        ctx.restore();
        return;
    };

    draw.lines = function (surface, color, closed, pointlist, width, filter) {
        closed = closed || false;
        var ctx = surface.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.lineWidth = width || 1;
        pointlist.forEach(function (point, idx) {
            if (idx === 0) {
                ctx.moveTo(point[0], point[1]);
            } else {
                ctx.lineTo(point[0], point[1]);
            }
        });
        if (closed) {
            ctx.lineTo(pointlist[0][0], pointlist[0][1]);
        }
        if (width === undefined || width === 0) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        ctx.restore();
        return;
    };

    draw.circle = function (surface, color, pos, radius, width, filter) {
        if (!radius) {
            throw new Error('[circle] radius required argument');
        }
        if (!pos || !(pos instanceof Array)) {
            throw new Error('[circle] pos must be given & array' + pos);
        }

        var ctx = surface.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.lineWidth = width || 1;
        ctx.arc(pos[0], pos[1], radius, 0, 2 * Math.PI, true);
        if (width === undefined || width === 0) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        ctx.restore();
        return;
    };

    draw.oval = function (surface, color, pos, wr, hr, width, filter) {
        var _w = wr + width / 2, _h = hr + width / 2;
        var _isw = wr >= hr, _r = _isw ? wr : hr, _width = _r * 2 + width;
        var _surface = Surface.genSurface([_width, _width]);
        draw.circle(_surface, color, [_r, _r], _r, width, filter);
        _surface = transform.scale(_surface, [_w * 2, _h * 2]);
        surface.blit(_surface, [pos[0] - _w, pos[1] - _h]);
        return;
    };

    draw.rect = function (surface, color, rect, width, filter) {
        var ctx = surface.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = color;

        draw.___setFilter(ctx, filter);

        if (isNaN(width) || width === 0) {
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        } else {
            ctx.lineWidth = width || 1;
            ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
        }
        ctx.restore();
    };

    draw.arc = function (surface, color, rect, startAngle, stopAngle, width) {
        var ctx = surface.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ctx.fillStyle = color;
        ctx.arc(rect.center[0], rect.center[1],
            rect.width / 2,
            startAngle * A.VPI, stopAngle * A.VPI,
            false
         );
        if (isNaN(width) || width === 0) {
            ctx.fill();
        } else {
            ctx.lineWidth = width || 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    draw.polygon = function (surface, color, pointlist, width, filter) {
        var ctx = surface.context;
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.beginPath();
        pointlist.forEach(function (point, idx) {
            if (idx == 0) {
                ctx.moveTo(point[0], point[1]);
            } else {
                ctx.lineTo(point[0], point[1]);
            }
        });
        ctx.closePath();
        if (isNaN(width) || width === 0) {
            ctx.fill();
        } else {
            ctx.lineWidth = width || 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    draw.quadraticCurve = function (surface, color, startPos, endPos, controlPos, width, filter) {
        if (!startPos || !(startPos instanceof Array)) {
            throw new Error('[quadratic_curve] startPos must be defined!');
        }
        if (!endPos || !(endPos instanceof Array)) {
            throw new Error('[quadratic_curve] endPos must be defined!');
        }
        if (!controlPos || !(controlPos instanceof Array)) {
            throw new Error('[quadratic_curve] controlPos must be defined!');
        }

        var ctx = surface.context;
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.beginPath();
        ctx.moveTo(startPos[0], startPos[1]);
        ctx.quadraticCurveTo(controlPos[0], controlPos[1], endPos[0], endPos[1]);
        if (isNaN(width) || width === 0) {
            ctx.fill();
        } else {
            ctx.lineWidth = width || 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    draw.bezierCurve = function (surface, color, startPos, endPos, ct1Pos, ct2Pos, width, filter) {
        if (!startPos || !(startPos instanceof Array)) {
            throw new Error('[bezier_curve] startPos must be defined!');
        }
        if (!endPos || !(endPos instanceof Array)) {
            throw new Error('[bezier_curve] endPos must be defined!');
        }
        if (!ct1Pos || !(ct1Pos instanceof Array)) {
            throw new Error('[bezier_curve] ct1Pos must be defined!');
        }
        if (!ct2Pos || !(ct2Pos instanceof Array)) {
            throw new Error('[bezier_curve] ct2Pos must be defined!');
        }
        var ctx = surface.context;
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.lineWidth = width || 1;

        ctx.beginPath();
        ctx.moveTo(startPos[0], startPos[1]);
        ctx.bezierCurveTo(ct1Pos[0], ct1Pos[1], ct2Pos[0], ct2Pos[1], endPos[0], endPos[1]);
        if (isNaN(width) || width === 0) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
        ctx.restore();
    };

    draw.polygonArc = function (surface, color, pointlist, width, filter) {
        var idxMax = pointlist.length - 1;
        var ctx = surface.context;
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = color;

        draw.___setFilter(ctx, filter);

        ctx.beginPath();
        for (var i = 0; i <= idxMax; i++) {
            var point = pointlist[i], j = i + 1;
            if (j > idxMax) {
                j = 1;
            }
            var point2 = pointlist[j];
            if (i == 0) {
                ctx.moveTo(point[0], point[1]);
            } else {
                if (point[2]) {
                    if (point2[1] == point[1]) {
                        if (point2[0] > point[0]) {
                            point2 = [point[0] + point[2], point2[1], point2[2]];
                        } else {
                            point2 = [point[0] - point[2], point2[1], point2[2]];
                        }
                    } else if (point2[0] == point[0]) {
                        if (point2[1] > point[1]) {
                            point2 = [point[0], point[1] + point[2], point2[2]];
                        } else {
                            point2 = [point[0], point[1] - point[2], point2[2]];
                        }
                    } else {
                        var subx = point2[0] - point[0], suby = point2[1] - point[1],
                            sub = Math.sqrt(subx * subx + suby * suby),
                            sinV = suby / sub, cosV = subx / sub, tanV = suby / subx;
                        point2 = [point[0] + point[2] * (1 - sinV), point[1] - (point[2] - point[0]) * tanV];
                    }
                    ctx.arcTo(point[0], point[1], point2[0], point2[1], point[2]);
                } else {
                    ctx.lineTo(point[0], point[1]);
                }
            }
        }
        if (isNaN(width) || width === 0) {
            ctx.fill();
        } else {
            ctx.lineWidth = width || 1;
            ctx.stroke();
        }
        ctx.restore();
        return;
    };

    //---------   draw end   --------------------------------------------



    //=========   :display   ============================================

    A.CVS_ID = "amanda_canvas";
    A.SURFACE = null;

    var display = A.display = {};

    display._getCanvas = function () {
        var _cvs = document.getElementById(A.CVS_ID);
        if (!_cvs) {
            _cvs = document.createElement("canvas");
            _cvs.id = A.CVS_ID;
            document.body.appendChild(_cvs);
        }
        return _cvs;
    };

    display._getCanvasOffset = function () {
        var boundRect = display._getCanvas().getBoundingClientRect();
        return [boundRect.left, boundRect.top];
    };

    display._hasFocus = function () {
        return document.activeElement == display._getCanvas();
    };

    display.getSurface = function () {
        if (!A.SURFACE) {
            var _cvs = display._getCanvas();
            A.SURFACE = Surface.genSurface([_cvs.clientWidth, _cvs.clientHeight], _cvs);
        }
        return A.SURFACE;
    };

    display.setMode = function (wh) {
        A.SURFACE = null;
        var _cvs = display._getCanvas();
        _cvs.width = wh[0];
        _cvs.height = wh[1];
        return display.getSurface();
    };

    display.init = function (cvsid) {
        if (cvsid) {
            A.CVS_ID = cvsid;
        }
        var _cvs = display._getCanvas();
        _cvs.focus();
        return;
    };

    //---------   display end   -----------------------------------------



    //=========   :image   ==============================================

    var image = A.image = {};

    image.CACHE = {};

    image.load = function (key, area) {
        var img;
        if (typeof key === 'string') {
            img = image.CACHE[key];
            if (!img) {
                // TODO sync image loading
                //throw new Error('Missing "' + key + '", preload() all images before trying to load them.');
                log('Missing "' + key + '", preload() all images before trying to load them.');
                return null;
            }
        } else {
            img = key;
        }
        var _w = 0, _h = 0;
        if (area && area[2] > 0 && area[3] > 0) {
            _w = area[2];
            _h = area[3];
        } else {
            _w = img.naturalWidth || img.width;
            _h = img.naturalHeight || img.height;
        }
        var canvas = document.createElement('canvas');
        canvas.width = _w;
        canvas.height = _h;
        var context = canvas.getContext('2d');
        if (area && area[2] > 0 && area[3] > 0) {
            context.drawImage(img, area[0], area[1], _w, _h, 0, 0, _w, _h);
        } else {
            context.drawImage(img, 0, 0);
        }
        img.getSize = function () { return [canvas.width, canvas.height]; };
        var surface = new Surface(img.getSize());
        surface.canvas = canvas;
        surface.context = context;
        return surface;
    };

    image.addToCache = function (img) {
        image.CACHE[img.___id] = img;
        return;
    };

    image.getFromCache = function (key) {
        return image.CACHE[key];
    };

    image.preload = function (imgIdents, fnCallback, fnProgress) {

        var countLoaded = 0,
            countTotal = 0;

        function incrementLoaded() {
            countLoaded++;
            if (countLoaded % 10 === 0) {
                log('image: preloaded  ' + countLoaded + ' of ' + countTotal);
            }
            if (fnProgress) {
                fnProgress(countLoaded, countTotal);
            }
            if (countLoaded >= countTotal) {
                if (fnCallback) {
                    fnCallback();
                }
            }
        }

        function getProgress() {
            return countTotal > 0 ? countLoaded / countTotal : 1;
        }

        function successHandler() {
            image.addToCache(this);
            if (localDB._storeImg && !this.isfromdb) {
                A.addImgToDB(this.___id, this, function (_pRe) {});
            }
            incrementLoaded();
        }
        function errorHandler() {
            incrementLoaded();
            throw new Error('Error loading ' + this.src);
        }
        function getImgFromDB(_pKey) {
            A.getFromDB(_pKey, function (_pRe) {
                var _src = _pRe, img = new Image();
                if (_src) {
                    img.isfromdb = true;
                } else {
                    _src = imgIdents[_pKey];
                }
                img.addEventListener('load', successHandler, true);
                img.addEventListener('error', errorHandler, true);
                img.src = _src;
                img.___id = _pKey;
            });
        }

        for (var key in imgIdents) {
            //var lowerKey = key.toLowerCase();
            //if (lowerKey.indexOf('.png') == -1 &&
            //    lowerKey.indexOf('.jpg') == -1 &&
            //    lowerKey.indexOf('.jpeg') == -1 &&
            //    lowerKey.indexOf('.svg') == -1 &&
            //    lowerKey.indexOf('.gif') == -1) {
            //    continue;
            //}
            countTotal++;
            if (localDB._storeImg) {
                getImgFromDB(key);
            } else {
                var img = new Image();
                img.addEventListener('load', successHandler, true);
                img.addEventListener('error', errorHandler, true);
                img.src = imgIdents[key];
                img.___id = key;
            }
        }
        if (countTotal == 0) {
            if (fnCallback) {
                fnCallback();
            }
        }
        return getProgress;
    };

    //---------   image end   -------------------------------------------



    //=========   :mixer   ===============================================

    var mixer = A.mixer = {};

    mixer.CACHE = {};

    mixer._INGs = [];

    var _NUM_CHANNELS = 2;

    mixer.addToCache = function (audios) {
        if (!(audios instanceof Array)) {
            audios = [audios];
        }
        audios.forEach(function (adu) {
            mixer.CACHE[adu.___id] = adu;
        });
        return;
    };

    mixer.getFromCache = function (key) {
        return mixer.CACHE[key];
    };

    mixer.preload = function (audioUrls, fnCallback, fnProgress) {
        var countTotal = 0,
            countLoaded = 0;

        function incrementLoaded() {
            countLoaded++;
            if (fnProgress) {
                fnProgress(countLoaded);
            }
            if (countLoaded >= countTotal) {
                if (fnCallback) {
                    fnCallback();
                }
            }
        }

        function getProgress() {
            return countTotal > 0 ? countLoaded / countTotal : 1;
        }

        function successHandler() {
            mixer.addToCache(this);
            if (localDB._storeMixer && !this.isfromdb) {
                localDB.update(this.___id, this.src);
            }
            incrementLoaded();
        }
        function errorHandler() {
            incrementLoaded();
            throw new Error('Error loading ' + this.src);
        }

        function __initAudio(_pKey, _pUrl, _pIsFromDB) {
            var audio = new Audio();
            if (_pIsFromDB) {
                audio.isfromdb = true;
            }
            audio.addEventListener('canplay', successHandler, true);
            audio.addEventListener('error', errorHandler, true);
            audio.src = _pUrl;
            audio.___id = _pKey;
            try {
                audio.load();
            } catch (aex) {
                log("audio error: " + aex.message);
            }
        }

        function getAudioFromDB(_pKey) {
            A.getFromDB(_pKey, function (_pRe) {
                var _src = _pRe;
                if (_src) {
                    __initAudio(_pKey, _src, true);
                } else {
                    _src = audioUrls[_pKey];
                    var _xhr = new XMLHttpRequest();
                    _xhr.open('GET', _src, true);
                    _xhr.responseType = 'blob';
                    _xhr.onload = function (e) {
                        if (this.status == 200 || this.status == 206) {
                            var _blob = this.response, _baseUrl = _src.split("?")[0], _type = null;
                            //if (_baseUrl.endWith(".wav")) {
                            //    _type = "audio/wav";
                            //} else if (_baseUrl.endWith(".ogg")) {
                            //    _type = "audio/ogg";
                            //}
                            var _extsn = _baseUrl.slice(-3).toLowerCase();
                            if (_extsn == ".wav") {
                                _type = "audio/wav";
                            } else if (_extsn == ".ogg") {
                                _type = "audio/ogg";
                            }
                            if (_type) {
                                _blob = new Blob([_blob], { type: _type });
                            }
                            var _f = new FileReader();
                            _f.onload = function (evt) {
                                var _str = evt.target.result;
                                __initAudio(_pKey, _str, false);
                            };
                            _f.readAsDataURL(_blob, "utf-8");
                        }
                    };
                    _xhr.send();
                }
            });
        }

        for (var key in audioUrls) {
            if (key.indexOf('.wav') == -1 &&
                key.indexOf('.ogg') == -1 &&
                key.indexOf('.webm') == -1 &&
                key.indexOf(".mp3") == -1) {
                continue;
            }
            countTotal++;
            if (localDB._storeMixer) {
                getAudioFromDB(key);
            } else {
                __initAudio(key, audioUrls[key], false);
            }
            //var audio = new Audio();
            //audio.addEventListener('canplay', successHandler, true);
            //audio.addEventListener('error', errorHandler, true);
            //audio.src = audioUrls[key];
            //audio.___id = key;
            //audio.load();
        }
        if (countTotal == 0) {
            if (fnCallback) {
                fnCallback();
            }
        }
        return getProgress;
    };

    var _MIXER_removeFromIngs = function (ele) {
        mixer._INGs = mixer._INGs.filter(function (_T) {
            return _T != ele;
        });
    };

    var _MIXER_objs = {};

    mixer.Sound = function Sound(uriOrAudio, instanceNum) {
        var cachedAudio;
        if (typeof uriOrAudio === 'string') {
            cachedAudio = mixer.getFromCache(uriOrAudio);
        } else {
            cachedAudio = uriOrAudio;
        }
        if (cachedAudio) {
            var channels = [],
            i = instanceNum || _NUM_CHANNELS;
            while (i-- > 0) {
                var audio = new Audio();
                audio.preload = "auto";
                audio.loop = false;
                audio.src = cachedAudio.src;
                audio.addEventListener("pause", function (_pEvt) { _MIXER_removeFromIngs(_pEvt.srcElement || _pEvt.target); });
                channels.push(audio);
            }

            this.play = function (loop) {
                channels.some(function (audio) {
                    if (audio.ended || audio.paused) {
                        audio.loop = !!loop;
                        mixer._INGs.push(audio);
                        audio.play();
                        return true;
                    }
                    return false;
                });
            };

            this.stop = function () {
                channels.forEach(function (audio) {
                    //audio.stop();
                    audio.pause();
                });
            };

            /**
            * Set volume of this sound
            * @param {Number} value volume from 0 to 1
            */
            this.setVolume = function (value) {
                channels.forEach(function (audio) {
                    audio.volume = value;
                });
            };

            /**
            * @returns {Number} the sound's volume from 0 to 1
            */
            this.getVolume = function () {
                return channels[0].volume;
            };

            /**
            * @returns {Number} Duration of this sound in seconds
            */
            this.getLength = function () {
                return channels[0].duration;
            };
        } else {
            log('Missing "' + uriOrAudio + '", preload() all audio files before loading');
        }

        return this;
    };

    mixer.sound = function (uri, isloop, volume, instanceNum) {
        var _obj = _MIXER_objs[uri];
        if (!_obj) {
            _obj = new mixer.Sound(uri, instanceNum);
            _MIXER_objs[uri] = _obj;
        }
        if (volume) {
            _obj.setVolume(volume);
        }
        _obj.play(isloop);
        return _obj;
    };

    //---------   mixer end   -------------------------------------------


    // TODO:
    //=========   :mask   ===============================================

    var Mask = A.Mask = function (dims) {
        this.width = dims[0];
        this.height = dims[1];
        this._bits = [];
        for (var i = 0; i < this.width; i++) {
            this._bits[i] = [];
            for (var j = 0; j < this.height; j++) {
                this._bits[i][j] = false;
            }
        }
        return;
    };

    objects.accessors(Mask.prototype, {
        'rect': {
            get: function () {
                return new Rect([0, 0], [this.width, this.height]);
            }
        },
        'length': {
            get: function () {
                var c = 0;
                this._bits.forEach(function (row) {
                    row.forEach(function (b) {
                        if (b) {
                            c++;
                        }
                    });
                });
                return c;
            }
        }
    });

    Mask.prototype.getSize = function () {
        return [this.width, this.height];
    };

    Mask.prototype.setAt = function (x, y) {
        if (this._bits[x]) {
            this._bits[x][y] = true;
        }
    };

    Mask.prototype.getAt = function (x, y) {
        x = parseInt(x, 10);
        y = parseInt(y, 10);
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return false;
        }
        if (this._bits[x]) {
            return this._bits[x][y];
        }
        return false;
    };

    Mask.prototype.invert = function () {
        this._bits = this._bits.map(function (row) {
            return row.map(function (b) {
                return !b;
            });
        });
    };

    Mask.prototype.overlapRect = function (otherMask, offset) {
        var arect = this.rect,
            brect = otherMask.rect;
        if (offset) {
            brect.moveIp(offset);
        }
        if (!brect.collideRect(arect)) {
            return null;
        }
        var xStart = Math.max(arect.left, brect.left),
            xEnd = Math.min(arect.right, brect.right);

        var yStart = Math.max(arect.top, brect.top),
            yEnd = Math.min(arect.bottom, brect.bottom);

        return new Rect([xStart, yStart], [xEnd - xStart, yEnd - yStart]);
    };

    Mask.prototype.overlap = function (otherMask, offset) {
        var overlapRect = this.overlapRect(otherMask, offset);
        if (overlapRect === null) {
            return null;
        }

        var arect = this.rect,
            brect = otherMask.rect;
        if (offset) {
            brect.moveIp(offset);
        }

        var count = 0;
        for (var y = overlapRect.top; y <= overlapRect.bottom; y++) {
            for (var x = overlapRect.left; x <= overlapRect.right; x++) {
                if (this.getAt(x - arect.left, y - arect.top) &&
                        otherMask.getAt(x - brect.left, y - brect.top)) {
                    return overlapRect;
                }
            }
        }
        return null;
    };

    Mask.prototype.overlapArea = function (otherMask, offset) {
        var overlapRect = this.overlapRect(otherMask, offset);
        if (overlapRect === null) {
            return 0;
        }

        var arect = this.rect,
            brect = otherMask.rect;
        if (offset) {
            brect.moveIp(offset);
        }

        var count = 0;
        for (var y = overlapRect.top; y <= overlapRect.bottom; y++) {
            for (var x = overlapRect.left; x <= overlapRect.right; x++) {
                if (this.getAt(x - arect.left, y - arect.top) &&
                    otherMask.getAt(x - brect.left, y - brect.top)) {
                    count++;
                }
            }
        }
        return count;
    };

    Mask.prototype.overlapMask = function (otherMask, offset) {
        var overlapRect = this.overlapRect(otherMask, offset);
        if (overlapRect === null) {
            return 0;
        }

        var arect = this.rect,
            brect = otherMask.rect;
        if (offset) {
            brect.moveIp(offset);
        }

        var mask = new Mask([overlapRect.width, overlapRect.height]);
        for (var y = overlapRect.top; y <= overlapRect.bottom; y++) {
            for (var x = overlapRect.left; x <= overlapRect.right; x++) {
                if (this.getAt(x - arect.left, y - arect.top) &&
                    otherMask.getAt(x - brect.left, y - brect.top)) {
                    mask.setAt(x, y);
                }
            }
        }
        return mask;
    };

    Mask.fromSurface = function (surface, threshold) {
        threshold = threshold && (255 - threshold) || 255;
        var imgData = surface.getImageData().data,
            dims = surface.getSize(),
            mask = new Mask(dims);
        for (var i = 0; i < imgData.length; i += 4) {
            var y = parseInt((i / 4) / dims[0], 10),
                x = parseInt((i / 4) % dims[0], 10),
                alpha = imgData[i + 3];
            if (alpha >= threshold) {
                mask.setAt(x, y);
            }
        }
        return mask;
    };

    var _MASK_cached = {};

    Mask.fromEle = function (ele, threshold) {
        var _item_cache = _MASK_cached[ele._guid];
        if (!_item_cache) {
            _item_cache = {};
            _MASK_cached[ele._guid] = _item_cache;
        }
        var _chdkey = ele._intact_suf.matrix.join("_") + "_" + threshold,
            _chditem = _item_cache[_chdkey];
        if (!_chditem) {
            _chditem = Mask.fromSurface(ele.surface, threshold);
            _item_cache[_chdkey] = _chditem;
        }
        return _chditem;
    };

    //---------   mask end   --------------------------------------------


    //=========   :Font   ===============================================

    var Font = A.Font = function (fontSettings, backgroundColor) {
        this.sampleSurface = new Surface([10, 10]);
        this.sampleSurface.context.font = fontSettings;
        this.sampleSurface.context.textAlign = 'start';
        // http://diveintohtml5.org/canvas.html#text
        this.sampleSurface.context.textBaseline = 'bottom';
        this.backgroundColor = backgroundColor || false;
        return this;
    };

    Font.prototype.render = function (text, color) {
        var dims = this.size(text);
        var surface = new Surface(dims);
        var ctx = surface.context;
        ctx.save();
        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, surface.rect.width, surface.rect.height);
        }
        ctx.font = this.sampleSurface.context.font;
        ctx.textBaseline = this.sampleSurface.context.textBaseline;
        ctx.textAlign = this.sampleSurface.context.textAlign;
        ctx.fillStyle = ctx.strokeStyle = color || "#000000";
        ctx.fillText(text, 0, surface.rect.height, surface.rect.width);
        ctx.restore();
        return surface;
    };

    Font.prototype.size = function (text) {
        var metrics = this.sampleSurface.context.measureText(text);
        return [metrics.width, this.fontHeight];
    };

    objects.accessors(Font.prototype, {
        'fontHeight': {
            get: function () {
                // Returns an approximate line height of the text
                // »This version of the specification does not provide a way to obtain
                // the bounding box dimensions of the text.«
                // see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-measuretext
                return this.sampleSurface.context.measureText('M').width * 1.5;
            }
        }

    });

    //---------   Font end   --------------------------------------------


    //=========   :EleStyle   ===========================================

    var EleStyle = A.EleStyle = function (boundEle) {
        this.boundEle = boundEle;
    };

    objects.accessors(EleStyle.prototype, {
        'backgroundColor': {
            get: function () {
                return this._backgroundColor;
            },
            set: function (newValue) {
                this._backgroundColor = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'borderWidth': {
            get: function () {
                return this._borderWidth;
            },
            set: function (newValue) {
                this._borderWidth = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'borderColor': {
            get: function () {
                return this._borderColor;
            },
            set: function (newValue) {
                this._borderColor = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'borderRadius': {
            get: function () {
                return this._borderRadius;
            },
            set: function (newValue) {
                this._borderRadius = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'fontFamily': {
            get: function () {
                if (this._fontFamily) {
                    return this._fontFamily;
                }
                if (!this.boundEle instanceof Button) {
                    if (this.boundEle.parent) {
                        return this.boundEle.parent.style.fontFamily;
                    }
                }
                return undefined;
            },
            set: function (newValue) {
                if (newValue != this._fontFamily) {
                    this._fontFamily = newValue;
                    if (this.boundEle instanceof Button) {
                        var _oldText = this.boundEle.text;
                        if (_oldText) {
                            this.boundEle.text = null;
                            this.boundEle.text = _oldText;
                        }
                    }
                    this.boundEle.flushed = true;
                    if (this.childs && this.childs.length > 0) {
                        var _child_check = function (_ele) {
                            if (!_ele instanceof Button && !_ele.style._fontFamily) {
                                if (_ele.childs && _ele.childs.length > 0) {
                                    _ele.childs.forEach(function (_T) {
                                        _child_check(_T);
                                    });
                                }
                                if (_ele instanceof Label) {
                                    _ele.flushed = true;
                                }
                            }
                        };
                        this.childs.forEach(function (_T) {
                            _child_check(_T);
                        });
                    }
                }
                return;
            }
        },
        'fontSize': {
            get: function () {
                if (this._fontSize) {
                    return this._fontSize;
                }
                if (!this.boundEle instanceof Button) {
                    if (this.boundEle.parent) {
                        return this.boundEle.parent.style.fontSize;
                    }
                }
                return undefined;
            },
            set: function (newValue) {
                if (newValue != this._fontSize) {
                    this._fontSize = newValue;
                    if (this.boundEle instanceof Button) {
                        var _oldText = this.boundEle.text;
                        if (_oldText) {
                            this.boundEle.text = null;
                            this.boundEle.text = _oldText;
                        }
                    }
                    this.boundEle.flushed = true;
                    if (this.childs && this.childs.length > 0) {
                        var _child_check = function (_ele) {
                            if (!_ele instanceof Button && !_ele.style._fontSize) {
                                if (_ele.childs && _ele.childs.length > 0) {
                                    _ele.childs.forEach(function (_T) {
                                        _child_check(_T);
                                    });
                                }
                                if (_ele instanceof Label) {
                                    _ele.flushed = true;
                                }
                            }
                        };
                        this.childs.forEach(function (_T) {
                            _child_check(_T);
                        });
                    }
                }
                return;
            }
        },
        'fontColor': {
            get: function () {
                if (this._fontColor) {
                    return this._fontColor;
                }
                if (!this.boundEle instanceof Button) {
                    if (this.boundEle.parent) {
                        return this.boundEle.parent.style.fontColor;
                    }
                }
                return undefined;
            },
            set: function (newValue) {
                if (newValue != this._fontColor) {
                    this._fontColor = newValue;
                    if (this.boundEle instanceof Button) {
                        var _oldText = this.boundEle.text;
                        if (_oldText) {
                            this.boundEle.text = null;
                            this.boundEle.text = _oldText;
                        }
                    }
                    this.boundEle.flushed = true;
                    if (this.childs && this.childs.length > 0) {
                        var _child_check = function (_ele) {
                            if (!_ele instanceof Button && !_ele.style._fontColor) {
                                if (_ele.childs && _ele.childs.length > 0) {
                                    _ele.childs.forEach(function (_T) {
                                        _child_check(_T);
                                    });
                                }
                                if (_ele instanceof Label) {
                                    _ele.flushed = true;
                                }
                            }
                        };
                        this.childs.forEach(function (_T) {
                            _child_check(_T);
                        });
                    }
                }
                return;
            }
        },
        'fontWeight': {
            get: function () {
                if (this._fontWeight) {
                    return this._fontWeight;
                }
                if (!this.boundEle instanceof Button) {
                    if (this.boundEle.parent) {
                        return this.boundEle.parent.style.fontWeight;
                    }
                }
                return undefined;
            },
            set: function (newValue) {
                if (newValue != this._fontWeight) {
                    this._fontWeight = newValue;
                    if (this.boundEle instanceof Button) {
                        var _oldText = this.boundEle.text;
                        if (_oldText) {
                            this.boundEle.text = null;
                            this.boundEle.text = _oldText;
                        }
                    }
                    this.boundEle.flushed = true;
                    if (this.childs && this.childs.length > 0) {
                        var _child_check = function (_ele) {
                            if (!_ele instanceof Button && !_ele.style.fontWeight) {
                                if (_ele.childs && _ele.childs.length > 0) {
                                    _ele.childs.forEach(function (_T) {
                                        _child_check(_T);
                                    });
                                }
                                if (_ele instanceof Label) {
                                    _ele.flushed = true;
                                }
                            }
                        };
                        this.childs.forEach(function (_T) {
                            _child_check(_T);
                        });
                    }
                }
                return;
            }
        },
        'align': {// left center right
            get: function () {
                return this._align;
            },
            set: function (newValue) {
                this._align = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'valign': {//top middle bottom
            get: function () {
                return this._valign;
            },
            set: function (newValue) {
                this._valign = newValue;
                this.boundEle.flushed = true;
                return;
            }
        },
        'cursor': {
            get: function () {
                return this._cursor;
            },
            set: function (newValue) {
                if (newValue && newValue != 'default') {
                    this._cursor = newValue;
                    if (!this.___cursorHandler) {
                        var _this = this;
                        this.___cursorHandler = function (ele, evt) {
                            display.getSurface().canvas.style.cursor = ele.display ? _this._cursor : "default";
                        };
                        this.boundEle.addEvent("mouseover", this.___cursorHandler);
                        this.boundEle.addEvent("mousemove", this.___cursorHandler);
                        this.boundEle.addEvent("mouseout", function (ele, evt) {
                            display.getSurface().canvas.style.cursor = "default";
                        });
                    }
                } else {
                    delete this._cursor;
                    if (this.___cursorHandler) {
                        this.boundEle.removeEvent("mouseover", this.___cursorHandler);
                    }
                    delete this.___cursorHandler;
                }
                return;
            }
        }
    });

    //---------   EleStyle end   ----------------------------------------



    //=========   :EleBase   ============================================

    //    var _EleID = 0;
    //    function _genEleId() {
    //        _EleID++;
    //        return Date.now().toString() + _EleID;
    //    }

    var EleBase = A.EleBase = function (id, x, y, suf) {
        this._guid = ___genUniqueId();
        this._id = id;

        this._intact_suf = suf;
        this._size = null;
        this._rect = null;
        this._offset = null;
        this._alpha = 0;
        this._surface = null;

        this._childs_kv = {};
        this.childs = null;
        this.parent = null;

        this.enabled = true;
        this._display = true;
        this.attrs = null;
        this._linkeds = null;

        this._tabIndex = 0;
        this._flushed = false;

        this._style = new EleStyle(this);

        this.x = x;
        this.y = y;

        return this;
    };

    EleBase.prototype._init = function () {
        if (this._intact_suf) {
            if (!this.___scale_dims && (!this.___rotate_v || this.___rotate_v % 360 == 0)) {
                this._surface = this._intact_suf.clone();
            } else {
                var _oldSize = this.___scale_dims || this._intact_suf.getSize(),
                    _newW = _oldSize[0], _newH = _oldSize[1],
                    _ps = [0, 0];
                if (this.___rotate_v) {
                    var _radians = this.___rotate_v * A.VPI,
                        _points = [
                            [-_oldSize[0] / 2, _oldSize[1] / 2],
                            [_oldSize[0] / 2, _oldSize[1] / 2],
                            [-_oldSize[0] / 2, -_oldSize[1] / 2],
                            [_oldSize[0] / 2, -_oldSize[1] / 2]
                        ],
                        _newPoints = _points.map(function (p) {
                            return vectors.rotate(p, _radians);
                        }),
                        _xs = _newPoints.map(function (p) { return p[0]; }),
                        _ys = _newPoints.map(function (p) { return p[1]; }),
                        _left = Math.min.apply(Math, _xs),
                        _right = Math.max.apply(Math, _xs),
                        _bottom = Math.min.apply(Math, _ys),
                        _top = Math.max.apply(Math, _ys);
                    _newW = _right - _left;
                    _newH = _top - _bottom;
                    var _absv = this.___rotate_v % 360;
                    if (_absv <= 90) {
                        _ps[0] = _oldSize[1] * Math.sin(_absv * A.VPI);
                    } else if (_absv <= 180) {
                        _ps[0] = _newW;
                        _ps[1] = _oldSize[1] * Math.cos((180 - _absv) * A.VPI);
                    } else if (_absv <= 270) {
                        _ps[0] = _oldSize[0] * Math.cos((_absv - 180) * A.VPI);
                        _ps[1] = _newH;
                    } else {
                        _ps[1] = _oldSize[0] * Math.sin((360 - _absv) * A.VPI);
                    }
                }
                this._surface = new Surface([_newW, _newH]);
                this._surface.blit(this._intact_suf, _ps);
            }
            if (this._rect) {
                var _newSize = this._surface.getSize();
                this._rect.width = _newSize[0];
                this._rect.height = _newSize[1];
                this._size = _newSize;
            }


            //this._surface = this._intact_suf.clone();
            //            if (_matrix) {
            //                this._surface.matrix = _matrix;
            //            }
            //            if (this._scale_wh) {
            //                var _suf_size = this._surface.getSize();
            //                if (this._scale_wh[0] != _suf_size[0] || this._scale_wh[1] != _suf_size[1]) {
            //                    this._surface = transform.scale(this._surface, this._scale_wh);
            //                    var _rect = this._surface.rect;
            //                    _rect.center = _oldCenter;
            //                    this.rect = _rect;
            //                } else {
            //                    this._scale_wh = null;
            //                }
            //            }
            //            if (this._rotate_v != 0) {
            //                this._surface = transform.rotate(this._surface, this._rotate_v);
            //                var _rect = this._surface.rect;
            //                _rect.center = _oldCenter;
            //                this.rect = _rect;
            //            }
            if (this._alpha > 0) {
                this._surface.setAlpha(this._alpha);
            }
            if (this._style) {
                if (this._style.backgroundColor) {
                    this._surface.fill(this._style.backgroundColor);
                }
            }
        }
    };

    EleBase.prototype.setAlpha = function (pAlpha) {
        this._alpha = pAlpha;
        if (this._surface) {
            this._surface.setAlpha(pAlpha);
        }
        this.parentFlushed = true;
    };

    EleBase.prototype.rotate = function (pV) {
        if (this._intact_suf) {
            var _suf = this._intact_suf;
            var _allv = (this.___rotate_v || 0) + pV;
            this.___rotate_v = _allv;
            if (pV % 360 != 0) {
                var _m = matrix.identity();
                _suf.matrix = matrix.rotate(_m, _allv * A.VPI);
                if (this.___scale_dims) {
                    var _oldSize = this._intact_suf.getSize(),
                        _ws = this.___scale_dims[0] / _oldSize[0],
                        _hs = this.___scale_dims[1] / _oldSize[1];
                    if (_ws != 1 || _hs != 1) {
                        _suf.matrix = matrix.scale(_suf.matrix, [_ws, _hs]);
                    }
                }
                this.flushed = true;
            }
        }
    };

    EleBase.prototype.scale = function (dims) {
        if (this._intact_suf && dims[0] > 0 && dims[1] > 0) {
            var _oldSize = this.___scale_dims || this._intact_suf.getSize(),
                _ws = dims[0] / _oldSize[0],
                _hs = dims[1] / _oldSize[1];
            if (_ws != 1 || _hs != 1) {
                var _m = null;
                if (this.___scale_dims) {
                    _m = matrix.identity();
                    if (this.___rotate_v) {
                        _m = matrix.rotate(_m, this.___rotate_v * A.VPI);
                    }
                } else {
                    _m = this._intact_suf.matrix;
                }
                this.___scale_dims = dims;
                this._intact_suf.matrix = matrix.scale(this._intact_suf.matrix, [_ws, _hs]);
                this.flushed = true;
            }
        }
    };

    EleBase.prototype.append = function (ele) {
        ele.remove();
        if (this.childs) {
            var _i;
            for (_i = 0; _i < this.childs.length; _i++) {
                if (this.childs[_i]._tabIndex > ele._tabIndex) {
                    break;
                }
            }
            this.childs.splice(_i, 0, ele);
        } else {
            this.childs = [ele];
        }
        this.flushed = true;
        ele.parent = this;
        if (ele.id) {
            this._childs_kv[ele.id] = ele;
        }
        if (ele instanceof HTMLEle) {
            var _thisOffset = this.offset,
                _cvs = display._getCanvas(),
                _cvsX = A.getXInParent(_cvs), _cvsY = A.getYInParent(_cvs);
            _cvs.parentNode.style.position = 'relative';
            ele.ele.style.left = (_cvsX + _thisOffset.x + ele.x) + "px";
            ele.ele.style.top = (_cvsY + _thisOffset.y + ele.y) + "px";
            _cvs.parentNode.appendChild(ele.ele);
            if (!this.display) {
                ele.ele.style.visibility = "hidden";
            }
        }
        ele._initEvents();
        return this;
    };

    // 如果没有参照元素existingEle，则效果与append()一样
    // 注意：这里与座标无关，只决定了谁先显示（当两个元素的tabIndex相同时，可能需要决定哪个先显示哪个后显示）
    EleBase.prototype.insertBefore = function (ele, existingEle) {
        if (existingEle) {
            if (existingEle.parent == this) {
                ele.remove();
                var _i = 0;
                for (_i = 0; _i < this.childs.length; _i++) {
                    if (this.childs[_i] == existingEle) {
                        break;
                    }
                }
                ele._tabIndex = existingEle._tabIndex;
                this.childs.splice(_i, 0, ele);
                ele.parent = this;
                if (ele.id) {
                    this._childs_kv[ele.id] = ele;
                }
                ele._initEvents();
                this.flushed = true;
            }
        } else {
            this.append(ele);
        }
    };

    // 如果没有参照元素existingEle，则效果与append()一样
    // 注意：这里与座标无关，只决定了谁先显示（当两个元素的tabIndex相同时，可能需要决定哪个先显示哪个后显示）
    EleBase.prototype.insertAfter = function (ele, existingEle) {
        if (existingEle) {
            if (existingEle.parent == this) {
                ele.remove();
                var _i = 0;
                for (_i = 0; _i < this.childs.length; _i++) {
                    if (this.childs[_i] == existingEle) {
                        break;
                    }
                }
                ele._tabIndex = existingEle._tabIndex;
                this.childs.splice(_i + 1, 0, ele);
                ele.parent = this;
                if (ele.id) {
                    this._childs_kv[ele.id] = ele;
                }
                ele._initEvents();
                this.flushed = true;
            }
        } else {
            this.append(ele);
        }
    };

    EleBase.___removeAllChildHTMLEles = function (ele) {
        if (ele.childs) {
            ele.childs.forEach(function (_T) {
                if (_T instanceof HTMLEle) {
                    display._getCanvas().parentNode.removeChild(_T.ele);
                } else {
                    EleBase.___removeAllChildHTMLEles(_T);
                }
            });
        }
    };

    EleBase.___hasChildHTMLEle = function (ele) {
        if (ele.childs) {
            for (var _i = 0; _i < ele.childs.length; _i++) {
                var _chd = ele.childs[_i];
                if (_chd instanceof HTMLEle) {
                    return true;
                } else {
                    return EleBase.___hasChildHTMLEle(_chd);
                }
            }
        }
        return false;
    };

    EleBase.___reDrawAllHTMLEle = function (ele) {
        if (ele.childs) {
            ele.childs.forEach(function (_T) {
                if (_T instanceof HTMLEle) {
                    //_T.draw();
                    if (A.CUR_FORM) {
                        if (A.CUR_FORM.body.__chgps_htmleles) {
                            if (A.CUR_FORM.body.__chgps_htmleles.indexOf(_T) == -1) {
                                A.CUR_FORM.body.__chgps_htmleles.push(_T);
                            }
                        } else {
                            A.CUR_FORM.body.__chgps_htmleles = [_T];
                        }
                    }
                } else {
                    EleBase.___reDrawAllHTMLEle(_T);
                }
            });
        }
    };

    EleBase.prototype._appendLinked = function (ele) {
        if (!this._linkeds) {
            this._linkeds = [];
        }
        this._linkeds.push(ele);
    };

    EleBase.prototype._removeLinked = function (ele) {
        if (this._linkeds) {
            this._linkeds = this._linkeds.filter(function (_T) {
                return _T != ele;
            });
        }
    };

    // 被删除的ele必须是当前ele的一级子元素
    EleBase.prototype.removeChild = function (ele) {
        if (ele._linkeds) {
            ele._linkeds.forEach(function (_T) {
                ele.parent.removeChild(_T);
            });
        }
        if (this.childs) {
            this.childs = this.childs.filter(function (_T) {
                if (_T == ele) {
                    _T.parent = null;
                    _T.offset = null;
                    return false;
                }
                return true;
            });
            this.flushed = true;
        }
        if (ele.id) {
            delete this._childs_kv[ele.id];
        }
        ele._clearEvents();
        if (ele instanceof HTMLEle) {
            display._getCanvas().parentNode.removeChild(ele.ele);
        } else {
            EleBase.___removeAllChildHTMLEles(ele);
        }
    };

    // 被删除的ele必须是当前ele的一级子元素
    EleBase.prototype.removeById = function (eleId) {
        var _ele = this.getById(eleId);
        if (_ele) {
            this.removeChild(_ele);
        }
    };

    // 被删除者必须是当前ele的一级子元素
    EleBase.prototype.removeChilds = function (eles) {
        for (var _i = 0; _i < eles.length; _i++) {
            this.removeChild(eles[_i]);
        }
    };

    EleBase.prototype.removeAllChilds = function () {
        if (this.childs) {
            var _i = 0;
            while (this.childs.length > 0 && _i < 500) {
                this.removeChild(this.childs[0]);
                _i++;
            }
        }
    };

    EleBase.prototype.remove = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };

    EleBase.prototype.getById = function (eleId) {
        return this._childs_kv[eleId];
    };

    EleBase.prototype.__hideAllChildHTMLEle = function () {
        if (this.childs) {
            this.childs.forEach(function (_T) {
                if (_T instanceof HTMLEle) {
                    _T.ele.style.visibility = 'hidden';
                } else {
                    _T.__hideAllChildHTMLEle();
                }
            });
        }
    };

    EleBase.prototype.__showAllChildHTMLEle = function () {
        if (this._display && this.childs) {
            this.childs.forEach(function (_T) {
                if (_T instanceof HTMLEle) {
                    _T.ele.style.visibility = 'visible';
                } else {
                    _T.__showAllChildHTMLEle();
                }
            });
        }
    };

    EleBase.prototype.hide = function () {
        if (this._display) {
            this._display = false;
            this.parentFlushed = true;
            this.__hideAllChildHTMLEle();
            if (this._linkeds) {
                this._linkeds.forEach(function (_T) {
                    _T.hide();
                });
            }
        }
    };

    EleBase.prototype.show = function () {
        if (!this._display) {
            this._display = true;
            this.parentFlushed = true;
            this.__showAllChildHTMLEle();
        }
    };

    // speed: 完成整个过程的时间。毫秒
    EleBase.prototype.fadeIn = function (speed, fnCallback) {
        this.show();
        if (this._alpha <= 0) {
            if (fnCallback) {
                fnCallback();
            }
        } else {
            var _sub = this._alpha,
                _step = _sub / speed,
                _addv = _step * time.DUR,
                _n = Math.ceil(_sub / _addv) + 1;
            return A.setTimeout(function (_pEle, _pAdd) {
                var _newV = _pEle._alpha - _pAdd;
                if (_newV < 0) {
                    _newV = 0;
                }
                _pEle.setAlpha(_newV);
            }, 0, [this, _addv], _n, fnCallback);
        }
        return null;
    };

    // speed: 同上
    EleBase.prototype.fadeOut = function (speed, fnCallback) {
        if (this._alpha >= 0.8) {
            this.hide();
            if (fnCallback) {
                fnCallback();
            }
        } else {
            var _sub = 0.8 - this._alpha,
                _step = _sub / speed,
                _addv = _step * time.DUR,
                _n = Math.ceil(_sub / _addv) + 1;
            return A.setTimeout(function (_pEle, _pAdd) {
                var _newV = _pEle._alpha + _pAdd;
                if (_newV > 1) {
                    _newV = 1;
                }
                _pEle.setAlpha(_newV);
                if (_newV >= 0.8) {
                    _pEle.hide();
                }
            },0, [this, _addv], _n, fnCallback);
        }
        return null;
    };

    EleBase.prototype.setAttr = function (attrKey, attrValue) {
        if (!this.attrs) {
            this.attrs = {};
        }
        this.attrs[attrKey] = attrValue;
    };

    EleBase.prototype.getAttr = function (attrKey) {
        if (this.attrs) {
            return this.attrs[attrKey];
        }
        return undefined;
    };

    EleBase.prototype.removeAttr = function (attrKey) {
        if (this.attrs) {
            delete this.attrs[attrKey];
        }
    };

    EleBase.prototype.containPoint = function (point) {
        var _offset = this.offset, _offsetX = _offset.x, _offsetY = _offset.y,
            _rect = this.rect;
        return point[0] >= _offsetX && point[0] <= _offsetX + _rect.width
                && point[1] >= _offsetY && point[1] <= _offsetY + _rect.height;
    };

    EleBase.prototype.collide = function (otherEle) {
        var _offset = [otherEle.x - this.x, otherEle.y - this.y];
        return Mask.fromEle(this).overlap(Mask.fromEle(otherEle), _offset);
    };

    // 当前元素是否是fatherEle元素的子元素
    EleBase.prototype.isChild = function (fatherEle) {
        if (fatherEle.childs) {
            for (var _i = 0; _i < fatherEle.childs.length; _i++) {
                var _item = fatherEle.childs[_i];
                if (_item == this) {
                    return true;
                }
                if (this.isChild(_item)) {
                    return true;
                }
            }
        }
        return false;
    };

    // 当前元素是否是childEle元素的父元素
    EleBase.prototype.isFather = function (childEle) {
        return childEle.isChild(this);
    };

    EleBase.prototype.__initEvents = function () {
        if (this.___eventDefs) {
            var _this = this;
            this.___eventDefs.forEach(function (_T) {
                event_addEvent(_this, _T.tp, _T.hd);
            });
        }
        if (this.childs) {
            this.childs.forEach(function (_T) {
                _T.__initEvents();
            });
        }
    };

    EleBase.prototype._initEvents = function () {
        if (this.isInBody) {
            this.__initEvents();
        }
    };

    EleBase.prototype._clearEvents = function () {
        event_removeEvent(this);
        if (this.childs) {
            this.childs.forEach(function (_T) {
                _T._clearEvents();
            });
        }
    };

    EleBase.prototype.addEvent = function (eventType, eventHandler) {
        if (eventType && eventHandler) {
            //            var _this = this;
            //            if (!event_handlers[eventType]) {
            //                event_handlers[eventType] = [];
            //            }
            //            var _item = event_handlers[eventType].find(function (_T) {
            //                return _T.ele == _this;
            //            });
            //            if (_item) {
            //                if (_item.handler) {
            //                    _item.handler.push(eventHandler);
            //                } else {
            //                    _item.handler = [eventHandler];
            //                }
            //            } else {
            //                _item = { ele: _this, handler: [eventHandler] };
            //                event_handlers[eventType].push(_item);
            //            }

            if (!this.___eventDefs) {
                this.___eventDefs = [];
            }
            this.___eventDefs.push({ tp: eventType, hd: eventHandler });
            if (this.isInBody) {
                event_addEvent(this, eventType, eventHandler);
            }
        }
    };

    EleBase.prototype.removeEvent = function (eventType, eventHandler) {
        if (eventType) {
            //            var _evts = event_handlers[eventType];
            //            if (_evts) {
            //                var _this = this;
            //                if (eventHandler) {
            //                    var _item = _evts.find(function (_T) {
            //                        return _T.ele == _this;
            //                    });
            //                    if (_item && _item.handler) {
            //                        _item.handler = _item.handler.filter(function (_T) {
            //                            return _T != eventHandler;
            //                        });
            //                    }
            //                } else {
            //                    event_handlers[eventType] = _evts.filter(function (_T) {
            //                        return _T.ele != _this;
            //                    });
            //                }
            //            }

            if (eventHandler) {
                if (this.___eventDefs) {
                    this.___eventDefs = this.___eventDefs.filter(function (_T) {
                        return _T.tp == eventType && _T.hd == eventHandler;
                    });
                    event_removeEvent(this, eventType, eventHandler);
                }
            } else {
                delete this.___eventDefs;
                event_removeEvent(this);
            }
        }
    };

    /**
    relativeSub: array. 两个元素的锚点之间的差。[0]为X值差，[1]为Y值差。
    如果不传此值，则两个元素的锚点将是重复状态。
    [ anchorPoint ]: number or array.
    0,1,2,3,4 分别表示：左上角、右上角、右下角、左下角、中点
    array 为相对其本身左上角的点位置
    默认为0
    [ anchorPoint ]: number or array. 当otherEle为null时，此参数无效
    0,1,2,3,4 分别表示：左上角、右上角、右下角、左下角、中点
    array 为相对其本身左上角的点位置
    默认为0
    **/
    EleBase.prototype.follow = function (otherEle, relativeSub, anchorPoint, anchorPoint_other) {
        if (A.CUR_FORM) {
            if (this.___follow) {
                if (this.___follow.ele) {
                    this.removeDrawBefore(this.___follow.fn);
                } else {
                    A.CUR_FORM.body.removeEvent("mousemove", this.___follow.fn);
                }
                delete this.___follow;
            }
            if (!relativeSub || !(relativeSub instanceof Array)) {
                relativeSub = [0, 0];
            }
            if (!anchorPoint) {
                anchorPoint = 0;
            }
            var _this = this;
            var _fun_mathsub = function () {
                var _sub = [0, 0];
                if (typeof (anchorPoint) === 'number') {
                    var _size = _this.size;
                    switch (anchorPoint) {
                        case 1:
                            _sub[0] = -_size[0];
                            break;
                        case 2:
                            _sub[0] = -_size[0];
                            _sub[1] = -_size[1];
                            break;
                        case 3:
                            _sub[1] = -_size[1];
                            break;
                        case 4:
                            _sub[0] = -_size[0] / 2;
                            _sub[1] = -_size[1] / 2;
                            break;
                    }
                } else if (anchorPoint instanceof Array && anchorPoint.length == 2) {
                    _sub[0] = -anchorPoint[0];
                    _sub[1] = -anchorPoint[1];
                }
                if (otherEle && anchorPoint_other) {
                    if (typeof (anchorPoint_other) === 'number') {
                        var _size = otherEle.size;
                        switch (anchorPoint_other) {
                            case 1:
                                _sub[0] += _size[0];
                                break;
                            case 2:
                                _sub[0] += _size[0];
                                _sub[1] += _size[1];
                                break;
                            case 3:
                                _sub[1] += _size[1];
                                break;
                            case 4:
                                _sub[0] += _size[0] / 2;
                                _sub[1] += _size[1] / 2;
                                break;
                        }
                    } else if (anchorPoint_other instanceof Array && anchorPoint_other.length == 2) {
                        _sub[0] += anchorPoint_other[0];
                        _sub[1] += anchorPoint_other[1];
                    }
                }
                _sub[0] += relativeSub[0];
                _sub[1] += relativeSub[1];
                return _sub;
            };
            if (otherEle) {
                var _flw_fn = function (_pThis) {
                    var _sub = _fun_mathsub(), _otherOffset = otherEle.offset,
                        _newx = _otherOffset.x + _sub[0], _newy = _otherOffset.y + _sub[1],
                        _thisOffset = _pThis.offset;
                    if (_newx != _thisOffset.x) {
                        _pThis.x = _pThis.x + (_newx - _thisOffset.x);
                    }
                    if (_newy != _thisOffset.y) {
                        _pThis.y = _pThis.y + (_newy - _thisOffset.y);
                    }
                };
                this.___follow = { ele: otherEle, fn: _flw_fn };
                this.appendDrawBefore(_flw_fn);
            } else {
                var _flw_fn = function (_pEle, _pEvt) {
                    var _sub = _fun_mathsub(), _pos = _pEvt.pos,
                        _newx = _pos[0] + _sub[0], _newy = _pos[1] + _sub[1],
                        _thisOffset = _this.offset;
                    if (_newx != _thisOffset.x) {
                        _this.x = _this.x + (_newx - _thisOffset.x);
                    }
                    if (_newy != _thisOffset.y) {
                        _this.y = _this.y + (_newy - _thisOffset.y);
                    }
                };
                this.___follow = { fn: _flw_fn };
                A.CUR_FORM.body.addEvent("mousemove", _flw_fn);
            }
        }
    };

    EleBase.prototype.removeFollow = function () {
        if (this.___follow) {
            if (this.___follow.ele) {
                this.removeDrawBefore(this.___follow.fn);
            } else {
                A.CUR_FORM.body.removeEvent("mousemove", this.___follow.fn);
            }
            delete this.___follow;
        }
    };

    //speed: 每秒移动的距离。注意是“秒”
    EleBase.prototype.moveTo = function (toPos, speed, fnCallback, fnStepCallback) {
        var _subX = toPos[0] - this.x, _subY = toPos[1] - this.y,
            _sub = Math.sqrt(_subX * _subX + _subY * _subY);
        if (!speed || speed < 0) {
            speed = 500;
        }
        speed = speed / 1000 * time.DUR;
        var _n = Math.ceil(_sub / speed);
        //this.___moveHandler = function (_pEle, _pStepX, _pStepY, _pToPos) {
        //    _pEle.x = _pEle.x + _pStepX;
        //    _pEle.y = _pEle.y + _pStepY;
        //    if (fnStepCallback) {
        //        fnStepCallback(_pEle.x, _pEle.y);
        //    }
        //};
        this.___moveTimer = A.setTimeout(function (_pEle, _pStepX, _pStepY, _pToPos) {
            _pEle.x = _pEle.x + _pStepX;
            _pEle.y = _pEle.y + _pStepY;
            if (fnStepCallback) {
                fnStepCallback(_pEle.x, _pEle.y);
            }
        }, 0, [this, _subX / _n, _subY / _n, toPos], _n, function (_pEle, _pStepX, _pStepY, _pToPos) {
            _pEle.x = _pToPos[0];
            _pEle.y = _pToPos[1];
            delete _pEle.___moveHandler;
            if (fnCallback) {
                fnCallback(_pEle);
            }
        });
    };

    EleBase.prototype.stopMove = function () {
        if (this.___moveTimer) {
            A.clearTimeout(this.___moveTimer);
        }
    };

    EleBase.prototype.appendDrawBefore = function (aFun) {
        if (!this.___drawBefores) {
            this.___drawBefores = [];
        }
        this.___drawBefores.push(aFun);
    };

    EleBase.prototype.removeDrawBefore = function (aFun) {
        if (this.___befores) {
            this.___befores = this.___befores.filter(function (_T) {
                return _T != aFun;
            });
        }
    };

    EleBase.prototype.appendDrawAfter = function (aFun) {
        if (!this.___drawAfters) {
            this.___drawAfters = [];
        }
        this.___drawAfters.push(aFun);
    };

    EleBase.prototype.removeDrawAfter = function (aFun) {
        if (this.___drawAfters) {
            this.___drawAfters = this.___drawAfters.filter(function (_T) {
                return _T != aFun;
            });
        }
    };

    EleBase.prototype.draw = function () {
        if (this.___drawBefores) {
            var _this = this;
            this.___drawBefores.forEach(function (_T) {
                _T(_this);
            });
        }
        if (this._display) {
            if (this.flushed) {
                this._init();
                if (this.surface) {
                    if (this.childs) {
                        this.childs.forEach(function (_T) {
                            _T.draw();
                        });
                    }
                }
                this.flushed = false;
            }
            if (this.surface) {
                if (this.parent && this.parent.flushed) {
                    this.parent.surface.blit(this.surface, [this.x, this.y]);
                }
            }
        }
        if (this.___drawAfters) {
            var _this = this;
            this.___drawAfters.forEach(function (_T) {
                _T(_this);
            });
        }
    };

    objects.accessors(EleBase.prototype, {
        'id': {
            get: function () {
                return this._id;
            }
        },
        'surface': {
            get: function () {
                if (!this._surface) {
                    this._init();
                }
                return this._surface;
            },
            set: function (newValue) {
                this._intact_suf = newValue;
                if (newValue) {
                    var _size = newValue.getSize();
                    this.rect.width = _size[0];
                    this.rect.height = _size[1];
                } else {
                    this.rect.width = 0;
                    this.rect.height = 0;
                }
                this._size = null;
                this.flushed = true;
            }
        },
        'tabIndex': {
            get: function () {
                return this._tabIndex;
            },
            set: function (newTabIndex) {
                if (newTabIndex != this._tabIndex) {
                    this.remove();
                    this._tabIndex = newTabIndex;
                    if (this.parent) {
                        this.parent.append(this);
                    }
                }
                return;
            }
        },
        'size': {
            get: function () {
                if (!this._size) {
                    var _rect = this.rect;
                    if (_rect) {
                        this._size = [_rect.width, _rect.height];
                    }
                }
                return this._size;
            }
        },
        'rect': {
            get: function () {
                if (!this._rect) {
                    //if (this.surface) {
                    //    this._rect = new Rect([0, 0], this.surface.getSize());
                    //}
                    var _size = [0, 0];
                    if (this._surface) {
                        _size = this._surface.getSize();
                    } else if (this._intact_suf) {
                        _size = this._intact_suf.getSize();
                    }
                    this._rect = new Rect([0, 0], _size);
                }
                return this._rect;
            },
            set: function (newValue) {
                this._rect = newValue;
                this._size = null;
                this.offset = null;
                this.parentFlushed = true;
                return;
            }
        },
        'x': {
            get: function () {
                var _rect = this.rect;
                if (_rect) {
                    return _rect.x;
                }
                return 0;
            },
            set: function (newValue) {
                var _rect = this.rect;
                if (_rect) {
                    if (this.minx != undefined) {
                        if (newValue < this.minx) {
                            newValue = this.minx;
                        }
                    }
                    if (this.maxx != undefined) {
                        if (newValue > this.maxx) {
                            newValue = this.maxx;
                        }
                    }
                    if (newValue != _rect.x) {
                        _rect.x = newValue;
                        this.parentFlushed = true;
                        this.offset = null;
                        EleBase.___reDrawAllHTMLEle(this);
                    }
                }
                return;
            }
        },
        'y': {
            get: function () {
                var _rect = this.rect;
                if (_rect) {
                    return _rect.y;
                }
                return 0;
            },
            set: function (newValue) {
                var _rect = this.rect;
                if (_rect) {
                    if (this.miny != undefined) {
                        if (newValue < this.miny) {
                            newValue = this.miny;
                        }
                    }
                    if (this.maxy != undefined) {
                        if (newValue > this.maxy) {
                            newValue = this.maxy;
                        }
                    }
                    if (newValue != _rect.y) {
                        _rect.y = newValue;
                        this.parentFlushed = true;
                        this.offset = null;
                        EleBase.___reDrawAllHTMLEle(this);
                    }
                }
                return;
            }
        },
        'right': {
            get: function () {
                var _rect = this.rect;
                if (_rect) {
                    return _rect.right;
                }
                return 0;
            },
            set: function (newValue) {
                var _rect = this.rect;
                if (_rect) {
                    if (this.minx != undefined) {
                        if (newValue - _rect.width < this.minx) {
                            newValue = this.minx + _rect.width;
                        }
                    }
                    if (this.maxx != undefined) {
                        if (newValue - _rect.width > this.maxx) {
                            newValue = this.maxx + _rect.width;
                        }
                    }
                    if (newValue != _rect.right) {
                        _rect.right = newValue;
                        this.parentFlushed = true;
                        this.offset = null;
                        EleBase.___reDrawAllHTMLEle(this);
                    }
                }
                return;
            }
        },
        'bottom': {
            get: function () {
                var _rect = this.rect;
                if (_rect) {
                    return _rect.bottom;
                }
                return 0;
            },
            set: function (newValue) {
                var _rect = this.rect;
                if (_rect) {
                    if (this.miny != undefined) {
                        if (newValue - _rect.height < this.miny) {
                            newValue = this.miny + _rect.height;
                        }
                    }
                    if (this.maxy != undefined) {
                        if (newValue - _rect.height > this.maxy) {
                            newValue = this.maxy + _rect.height;
                        }
                    }
                    if (newValue != _rect.bottom) {
                        _rect.bottom = newValue;
                        this.parentFlushed = true;
                        this.offset = null;
                        EleBase.___reDrawAllHTMLEle(this);
                    }
                }
                return;
            }
        },
        'center': {
            get: function () {
                var _rect = this.rect;
                if (_rect) {
                    return _rect.center;
                }
                return null;
            },
            set: function (newValue) {
                var _rect = this.rect;
                if (_rect) {
                    if (this.minx != undefined) {
                        var _w_2 = _rect.width / 2;
                        if (newValue[0] - _w_2 < this.minx) {
                            newValue[0] = this.minx + _w_2;
                        }
                    }
                    if (this.maxx != undefined) {
                        var _w_2 = _rect.width / 2;
                        if (newValue[0] - _w_2 > this.maxx) {
                            newValue[0] = this.maxx + _w_2;
                        }
                    }
                    if (this.miny != undefined) {
                        var _h_2 = _rect.height / 2;
                        if (newValue[1] - _h_2 < this.miny) {
                            newValue[1] = this.miny + _h_2;
                        }
                    }
                    if (this.maxy != undefined) {
                        var _h_2 = _rect.height / 2;
                        if (newValue[1] - _h_2 > this.maxy) {
                            newValue[1] = this.maxy + _h_2;
                        }
                    }
                    if (newValue[0] != _rect.center[0] || newValue[1] != _rect.center[1]) {
                        _rect.center = newValue;
                        this.parentFlushed = true;
                        this.offset = null;
                        EleBase.___reDrawAllHTMLEle(this);
                    }
                }
                return;
            }
        },
        'offset': {
            get: function () {
                if (!this._offset) {
                    var _left = this.x, _top = this.y;
                    if (this.parent) {
                        var _parentOffset = this.parent.offset;
                        _left += _parentOffset.x;
                        _top += _parentOffset.y;
                    }
                    this._offset = { x: _left, y: _top };
                }
                return this._offset;
            },
            set: function (newValue) { //newValue只可为null，不可接受其它值。在本元素的位置发生变化时用此属性将其所有子元素的offset值设为null
                if (newValue == null) {
                    this._offset = null;
                    if (this.childs) {
                        this.childs.forEach(function (_T) {
                            _T.offset = null;
                        });
                    }
                }
                return;
            }
        },
        'minx': {
            get: function() { return this._minx; },//如果没有设置此属性，则返回undefined
            set: function (newValue) {//如果要废除已设置的minx，则传undefined
                this._minx = newValue;
            }
        },
        'maxx': {
            get: function () { return this._maxx; },//如果没有设置此属性，则返回undefined
            set: function (newValue) {//如果要废除已设置的maxx，则传undefined
                this._maxx = newValue;
            }
        },
        'miny': {
            get: function () { return this._miny; },//如果没有设置此属性，则返回undefined
            set: function (newValue) {//如果要废除已设置的miny，则传undefined
                this._miny = newValue;
            }
        },
        'maxy': {
            get: function () { return this._maxy; },//如果没有设置此属性，则返回undefined
            set: function (newValue) {//如果要废除已设置的maxy，则传undefined
                this._maxy = newValue;
            }
        },
        'style': {
            get: function () {
                return this._style;
            },
            set: function (newValue) {
                this._style = newValue;
                this.flushed = true;
            }
        },
        'flushed': {
            get: function () {
                return this._flushed;
            },
            set: function (newValue) {
                var _old = this._flushed;
                if (newValue != _old) {
                    this._flushed = newValue;
                    if (newValue) {
                        if (this.parent) {
                            this.parent.flushed = newValue;
                        }
                    }
                }
            }
        },
        'parentFlushed': {
            get: function () {
                return this.parent && this.parent.flushed;
            },
            set: function (newValue) {
                if (this.parent) {
                    this.parent.flushed = newValue;
                }
                return;
            }
        },
        'rootBase': {
            get: function () {
                if (this.parent) {
                    var _t = this.parent.rootBase;
                    if (_t) {
                        return _t;
                    }
                    return this.parent;
                }
                return null;
            }
        },
        'isInBody': {
            get: function () {
                if (A.CUR_FORM) {
                    return this == A.CUR_FORM.body || this.rootBase == A.CUR_FORM.body;
                }
                return false;
            }
        },
        'canDrag': {
            set: function (trueORfalse) {
                if (trueORfalse) {
                    if (!this.___drag) {
                        var _this = this;
                        this.___drag = {};
                        var _fn_mdown = function (_pEle, _pEvt) {
                            var _cur = _pEvt.pos;
                            if (_this.containPoint(_cur)) {
                                //var _thisOffset = _this.offset;
                                _this.___drag.sub = [_cur[0] - _this.x, _cur[1] - _this.y];
                                _this.___drag.ing = true;
                            }
                        };
                        this.___drag.fn_mdown = _fn_mdown;
                        var _fn_mup = function (_pEle, _pEvt) {
                            _this.___drag.ing = false;
                        };
                        this.___drag.fn_mup = _fn_mup;
                        var _fn_mmove = function (_pEle, _pEvt) {
                            if (_this.___drag.ing) {
                                var _cur = _pEvt.pos;
                                _this.x = _cur[0] - _this.___drag.sub[0];
                                _this.y = _cur[1] - _this.___drag.sub[1];
                            }
                        };
                        this.___drag.fn_mmove = _fn_mmove;
                        A.CUR_FORM.body.addEvent("mousedown", _fn_mdown);
                        A.CUR_FORM.body.addEvent("mouseup", _fn_mup);
                        A.CUR_FORM.body.addEvent("mousemove", _fn_mmove);
                        this.style.cursor = "move";
                    }
                } else {
                    if (this.___drag) {
                        A.CUR_FORM.body.removeEvent("mousedown", this.___drag.fn_mdown);
                        A.CUR_FORM.body.removeEvent("mouseup", this.___drag.fn_mup);
                        A.CUR_FORM.body.removeEvent("mousemove", this.___drag.fn_mmove);
                        delete this.___drag;
                        this.style.cursor = null;
                    }
                }
            }
        },
        'display': {
            get: function () {
                if (this._display) {
                    if (this.parent) {
                        return this.parent.display;
                    }
                    return true;
                }
                return false;
            }
        },
        'title': {
            get: function () {
                return this._titleEle;
            },
            set: function (newTitle) {
                if (newTitle) {
                    if (this._titleEle) {
                        this.title = null;//先將舊的Title移除
                    }
                    var _newTitleEle = null;
                    if (typeof (newTitle) === 'string') {
                        var _sufTit = new Font("13px Verdana").render(newTitle, "#000000"),
                            _titSize = _sufTit.getSize(),
                            _newTitW = _titSize[0] + 6, _newTitH = _titSize[1] + 2,
                            _newSuf = Surface.genSurface([_newTitW, _newTitH]);
                        _newSuf.fill("#F8FCF8");
                        draw.polygonArc(_newSuf, "#984408", [[2, 0], [_newTitW, 0, 4], [_newTitW, _newTitH, 4], [0, _newTitH, 4], [0, 0, 4]], 1);
                        _newSuf.blit(_sufTit, [3, 1]);
                        _newTitleEle = new EleBase(null, 0, 0, _newSuf);
                    } else if (newTitle instanceof Surface) {
                        _newTitleEle = new EleBase(null, 0, 0, newTitle);
                    } else if (newTitle instanceof EleBase) {
                        _newTitleEle = newTitle;
                    }
                    if (_newTitleEle) {
                        this._titleEle = _newTitleEle;
                        this._titleEle.hide();
                        this._appendLinked(_newTitleEle);
                        this._titleEle._handler_mouseover = function (_srcEle, _evt) {
                            if (_srcEle._titleEle && _srcEle.parent) {
                                if (!_srcEle._titleEle.isChild(_srcEle.parent)) {
                                    _srcEle.parent.append(_srcEle._titleEle);
                                }
                                var _parentW = _srcEle.parent.size[0],
                                    _titSize = _srcEle._titleEle.size,
                                    _titY = _srcEle.y - _titSize[1] - 2;
                                if (_titY < 0) {
                                    _titY = _srcEle.y + _srcEle.size[1] + 3;
                                }
                                var _titX = _srcEle.x + _srcEle.size[0] / 2 - _titSize[0] / 2;
                                if (_titX < 0) {
                                    _titX = 0;
                                } else if (_titX + _titSize[0] > _parentW) {
                                    _titX = _parentW - _titSize[0];
                                }
                                _srcEle._titleEle.x = _titX;
                                _srcEle._titleEle.y = _titY;
                                _srcEle._titleEle.show();
                            }
                        };
                        this._titleEle._handler_mouseout = function (_srcEle, _evt) {
                            if (_srcEle._titleEle) {
                                _srcEle._titleEle.hide();
                            }
                        };
                        this.addEvent("mouseover", this._titleEle._handler_mouseover);
                        this.addEvent("mouseout", this._titleEle._handler_mouseout);
                    }
                } else {
                    if (this._titleEle) {
                        this.removeEvent("mouseover", this._titleEle._handler_mouseover);
                        this.removeEvent("mouseout", this._titleEle._handler_mouseout);
                        this._titleEle.remove();
                        this._removeLinked(this._titleEle);
                        this._titleEle = null;
                    }
                }
            }
        }
    });

    //---------   EleBase end   -----------------------------------------


    //=========   :Div   ================================================

    var Div = A.Div = function (id, x, y, w, h) {
        w = w || 50;
        h = h || 50;
        var _suf = Surface.genSurface([w, h]);
        Div.superConstructor.apply(this, [id, x, y, _suf]);
    };
    objects.extend(Div, EleBase);

    //---------   Div end   ---------------------------------------------


    //=========   :Img   ================================================

    // imgsufORurl: 可以是一个图片的suface，也可以是图片的URL，若计划稍后再设置图像，则此参数传图像占位空间的大小[width,height]
    // imgArea: [目前未用到此参数] 当 imgsufORurl 为url时此参数才有效
    var Img = A.Img = function (id, x, y, imgsufORurlORsize, imgArea, loadedFun) {
        this._src = imgsufORurlORsize;
        this._maxwidth = 0;
        this._maxheight = 0;
        this._loadedFun = loadedFun;
        if (imgsufORurlORsize && imgsufORurlORsize instanceof Array && imgsufORurlORsize.length == 2) {
            if (imgsufORurlORsize[0] > 0) {
                this._maxwidth = imgsufORurlORsize[0];
            }
            if (imgsufORurlORsize[1] > 0) {
                this._maxheight = imgsufORurlORsize[1];
            }
        }
        //imgsufORurlORsize = Surface.genSurface([10, 10]);
        Img.superConstructor.apply(this, [id, x, y, null]);
        this.src = this._src;
    };
    objects.extend(Img, EleBase);

    objects.accessors(Img.prototype, {
        'src': {
            get: function () {
                return this._src;
            },
            set: function (newValue) {
                this._src = newValue;
                if (newValue) {
                    var _suf, _this = this;
                    var _fun_chkmax = function () {
                        if (_suf) {
                            var _size = _suf.getSize();
                            if (_this._maxwidth > 0 && _size[0] > _this._maxwidth) {
                                var _pw = _this._maxwidth / _size[0], _ph = 1;
                                if (_this._maxheight > 0 && _size[1] > _this._maxheight) {
                                    _ph = _this._maxheight / _size[1];
                                }
                                var _p = _pw > _ph ? _ph : _pw;
                                _suf = transform.scale(_suf, [_size[0] * _p, _size[1] * _p]);
                            } else if (_this._maxheight > 0 && _size[1] > _this._maxheight) {
                                var _ph = _this._maxheight / _size[1], _pw = 1;
                                if (_this._maxwidth > 0 && _size[0] > _this._maxwidth) {
                                    _pw = _this._maxwidth / _size[0];
                                }
                                var _p = _ph > _pw ? _pw : _ph;
                                _suf = transform.scale(_suf, [_size[0] * _p, _size[1] * _p]);
                            }
                            _this.surface = _suf;
                            if (this._loadedFun) {
                                this._loadedFun(this);
                            }
                        }
                    };
                    if (typeof (newValue) === "string") {
                        _suf = image.load(newValue);
                        if (_suf) {
                            _fun_chkmax();
                        } else {
                            A.preload(newValue, null, function () {
                                _suf = image.load(newValue);
                                _fun_chkmax();
                            });
                        }
                    } else if (newValue instanceof Surface) {
                        _suf = newValue;
                        _fun_chkmax();
                    } else if (newValue instanceof Array && newValue.length == 2 && typeof (newValue[0]) === 'string' && newValue[1] instanceof Array && newValue[1].length == 4) {
                        _suf = image.load(newValue[0], newValue[1]);
                        if (_suf) {
                            _fun_chkmax();
                        } else {
                            A.preload(newValue, null, function () {
                                _suf = image.load(newValue);
                                _fun_chkmax();
                            });
                        }
                    }
                } else {
                    this.surface = Surface.genSurface(this.size);
                }
            }
        }
    });

    //---------   Img end   ---------------------------------------------


    //=========   :Label   ==============================================

    // 不会自动换行
    // fontSettings: string "bold 13px sans-serif" "13px sans-serif" "13px Verdana"
    var Label = A.Label = function (id, text, x, y, fontSettings, borderWidth, borderRGBA) {
        this._text = text;
        this.___genSuf = function () {
            if (!this._text) {
                this._text = " ";
            }
            var _old_matrix = null, _ary = [], _color = "black";
            if (this._intact_suf) {
                _old_matrix = this._intact_suf.matrix;
                var _fontWeight = this.style.fontWeight;
                if (_fontWeight) {
                    _ary.push(_fontWeight);
                }
                var _fontSize = this.style.fontSize;
                if (!_fontSize) {
                    _fontSize = "13px";
                }
                _ary.push(_fontSize);
                var _fontFamily = this.style.fontFamily;
                if (!_fontFamily) {
                    _fontFamily = "Verdana";
                }
                if (this.style.fontColor) {
                    _color = this.style.fontColor;
                }
                _ary.push(_fontFamily);
            } else {
                if (fontSettings) {
                    var _arySettings = fontSettings.split(" ");
                    if (_arySettings.length == 3) {
                        _ary.push(_arySettings[0]);
                        _ary.push(_arySettings[1]);
                        _ary.push(_arySettings[2]);
                    } else if (_arySettings.length == 2) {
                        _ary.push(_arySettings[0]);
                        _ary.push(_arySettings[1]);
                    }
                }
            }
            var _font = new Font(_ary.join(" "));
            var _suf = _font.render(this._text, _color);
            if (_old_matrix) {
                _suf.matrix = _old_matrix;
            }
            if (borderWidth) {
                if (!borderRGBA) {
                    borderRGBA = [0, 51, 0, 1];
                }
                var _border_suf = Surface.genBorderSuf(_suf, borderWidth, borderRGBA),
                    _border_w = Math.ceil(borderWidth);
                _border_suf.blit(_suf, [_border_w, _border_w]);
                _suf = _border_suf;
            }
            return _suf;
        };
        Label.superConstructor.apply(this, [id, x, y, this.___genSuf()]);
        if (fontSettings) {
            var _arySettings = fontSettings.split(" ");
            if (_arySettings.length == 3) {
                this.style._fontWeight = _arySettings[0];
                this.style._fontSize = _arySettings[1];
                this.style._fontFamily = _arySettings[2];
            } else if (_arySettings.length == 2) {
                this.style._fontSize = _arySettings[0];
                this.style._fontFamily = _arySettings[1];
            }
        }
        //this._flushed = true;

        this.___init = this._init;
        this._init = function () {
            this._intact_suf = this.___genSuf();
            this.___init();
        };

        //this.___init = this._init;
        //this._init = function () {
        //    if (this._text) {
        //        var _old_matrix = null;
        //        if (this._intact_suf) {
        //            _old_matrix = this._intact_suf.matrix;
        //        }
        //        var _ary = [],
        //            _fontWeight = this.style.fontWeight;
        //        if (_fontWeight) {
        //            _ary.push(_fontWeight);
        //        }
        //        var _fontSize = this.style.fontSize;
        //        if (!_fontSize) {
        //            _fontSize = "13px";
        //        }
        //        _ary.push(_fontSize);
        //        var _fontFamily = this.style.fontFamily;
        //        if (!_fontFamily) {
        //            _fontFamily = "sans-serif";
        //        }
        //        _ary.push(_fontFamily);
        //        var _font = new Font(_ary.join(" "));
        //        this._intact_suf = _font.render(this._text, this.style.fontColor);
        //        if (_old_matrix) {
        //            this._intact_suf.matrix = _old_matrix;
        //        }
        //        if (borderWidth) {
        //            if (!borderRGBA) {
        //                borderRGBA = [0, 51, 0, 1];
        //            }
        //            var _border_suf = Surface.genBorderSuf(this._intact_suf, borderWidth, borderRGBA),
        //                _border_w = Math.ceil(borderWidth);
        //            _border_suf.blit(this._intact_suf, [_border_w, _border_w]);
        //            this._intact_suf = _border_suf;
        //        }
        //        this.___init();
        //    }
        //};
    };
    objects.extend(Label, EleBase);

    objects.accessors(Label.prototype, {
        'text': {
            get: function () {
                return this._text;
            },
            set: function (newValue) {
                if (newValue != this._text) {
                    //if (newValue) {
                    //    this._text = newValue;
                    //} else {
                    //    this._text = null;
                    //    this._surface = null;
                    //}
                    //this.flushed = true;
                    this._text = newValue;
                    this.surface = this.___genSuf();
                }
            }
        }
    });

    //---------   Label end   -------------------------------------------



    //=========   :Span   ===============================================

    // fontSettings: string "bold 13px sans-serif" "13px sans-serif"
    var Span = A.Span = function (id, text, x, y, width, height, fontSettings, fontColor, textIndent) {
        this._text = text;
        this._textIndent = textIndent || 0;
        this._width = width || 100;
        this._firstWidth = this._width - this._textIndent;
        this._height = height;

        this.___genSuf = function () {
            var _old_matrix = null, _ary=[], _color = fontColor || "black";
            if (this._intact_suf) {
                _old_matrix = this._intact_suf.matrix;
                var _fontWeight = this.style.fontWeight;
                if (_fontWeight) {
                    _ary.push(_fontWeight);
                }
                var _fontSize = this.style.fontSize;
                if (!_fontSize) {
                    _fontSize = "13px";
                }
                _ary.push(_fontSize);
                var _fontFamily = this.style.fontFamily;
                if (!_fontFamily) {
                    _fontFamily = "Verdana";
                }
                _ary.push(_fontFamily);
                if (this.style.fontColor) {
                    _color = this.style.fontColor;
                }
            } else {
                if (fontSettings) {
                    var _arySettings = fontSettings.split(" ");
                    if (_arySettings.length == 3) {
                        _ary.push(_arySettings[0]);
                        _ary.push(_arySettings[1]);
                        _ary.push(_arySettings[2]);
                    } else if (_arySettings.length == 2) {
                        _ary.push(_arySettings[0]);
                        _ary.push(_arySettings[1]);
                    }
                }
            }
            
            var _font = new Font(_ary.join(" ")),
                _tmp_txt = _font.render("中", _color),
                _tmp_size = _tmp_txt.getSize(),
                _n = Math.floor(this._width / _tmp_size[0]),
                _firstN = this._textIndent > 0 ? Math.floor(this._firstWidth / _tmp_size[0]) : _n,
                _sufs = [];
            for (var _i = 0; _i < this._text.length; _i += _n) {
                var _s = this._text.substr(_i, _i == 0 ? _firstN : _n), _n2 = 0,
                    _suf = null;
                while (true) {
                    if (_i + _s.length == this._text.length || _s.length < (_i == 0 ? _firstN : _n) + _n2) {
                        break;
                    } else {
                        _suf = _font.render(_s, _color);
                        var _suf_size = _suf.getSize(),
                            _w_sub = this._width - _suf_size[0] - (_i == 0 ? this._textIndent : 0);
                        if (_w_sub < _tmp_size[0]) {
                            break;
                        } else {
                            _suf = null;
                            _n2 += parseInt(_w_sub / _tmp_size[0]);
                            _s = this._text.substr(_i, (_i == 0 ? _firstN : _n) + _n2);
                        }
                    }
                }
                if (!_suf) {
                    _suf = _font.render(_s, _color);
                }
                _sufs.push(_suf);
                if (_i == 0) {
                    _i -= (_n - _firstN);
                }
                _i += _n2;
            }
            var _h = this._height > 0 ? this._height : ((_sufs.length == 0 ? 1 : _sufs.length) * _tmp_size[1]);
            var _newSuf = Surface.genSurface([this._width, _h]);
            if (_old_matrix) {
                _newSuf.matrix = _old_matrix;
            }
            for (var _i = 0; _i < _sufs.length; _i++) {
                _newSuf.blit(_sufs[_i], [_i == 0 ? this._textIndent : 0, _i * _tmp_size[1]]);
            }
            return _newSuf;
        };
        Span.superConstructor.apply(this, [id, x, y, this.___genSuf()]);

        if (fontSettings) {
            var _arySettings = fontSettings.split(" ");
            if (_arySettings.length == 3) {
                this.style._fontWeight = _arySettings[0];
                this.style._fontSize = _arySettings[1];
                this.style._fontFamily = _arySettings[2];
            } else if (_arySettings.length == 2) {
                this.style._fontSize = _arySettings[0];
                this.style._fontFamily = _arySettings[1];
            }
        }
        if (fontColor) {
            this.style._fontColor = fontColor;
        }

        this.___init = this._init;
        this._init = function () {
            this._intact_suf = this.___genSuf();
            this.___init();
        };
        
        //if (fontSettings) {
        //    var _arySettings = fontSettings.split(" ");
        //    if (_arySettings.length == 3) {
        //        this.style._fontWeight = _arySettings[0];
        //        this.style._fontSize = _arySettings[1];
        //        this.style._fontFamily = _arySettings[2];
        //    } else if (_arySettings.length == 2) {
        //        this.style._fontSize = _arySettings[0];
        //        this.style._fontFamily = _arySettings[1];
        //    }
        //}
        //this._flushed = true;

        //this.___init = this._init;
        //this._init = function () {
        //    if (this._text) {
        //        var _old_matrix = null;
        //        if (this._intact_suf) {
        //            _old_matrix = this._intact_suf.matrix;
        //        }
        //        var _ary = [],
        //            _fontWeight = this.style.fontWeight;
        //        if (_fontWeight) {
        //            _ary.push(_fontWeight);
        //        }
        //        var _fontSize = this.style.fontSize;
        //        if (!_fontSize) {
        //            _fontSize = "13px";
        //        }
        //        _ary.push(_fontSize);
        //        var _fontFamily = this.style.fontFamily;
        //        if (!_fontFamily) {
        //            _fontFamily = "sans-serif";
        //        }
        //        _ary.push(_fontFamily);
        //        var _font = new Font(_ary.join(" ")),
        //            _tmp_txt = _font.render("中", this.style.fontColor),
        //            _tmp_size = _tmp_txt.getSize(),
        //            _n = Math.floor(this._width / _tmp_size[0]),
        //            _firstN = this._textIndent > 0 ? Math.floor(this._firstWidth / _tmp_size[0]) : _n,
        //            _sufs = [];
        //        for (var _i = 0; _i < this._text.length; _i += (_i == 0 ? _firstN : _n)) {
        //            var _s = this._text.substr(_i, _i == 0 ? _firstN : _n), _n2 = 0,
        //                _suf = null;
        //            while (true) {
        //                if (_i + _s.length == this._text.length || _s.length < _n + _n2) {
        //                    break;
        //                } else {
        //                    _suf = _font.render(_s, this.style.fontColor);
        //                    var _suf_size = _suf.getSize(),
        //                        _w_sub = this._width - _suf_size[0];
        //                    if (_w_sub < _tmp_size[0]) {
        //                        break;
        //                    } else {
        //                        _suf = null;
        //                        _n2 += parseInt(_w_sub / _tmp_size[0]);
        //                        _s = this._text.substr(_i, _n + _n2);
        //                    }
        //                }
        //            }
        //            if (!_suf) {
        //                _suf = _font.render(_s, this.style.fontColor);
        //            }
        //            _sufs.push(_suf);
        //            _i += _n2;
        //        }
        //        var _h = this._height > 0 ? this._height : ((_sufs.length == 0 ? 1 : _sufs.length) * _tmp_size[1]);
        //        this._intact_suf = Surface.genSurface([this._width, _h]);
        //        for (var _i = 0; _i < _sufs.length; _i++) {
        //            this._intact_suf.blit(_sufs[_i], [0, _i * _tmp_size[1]]);
        //        }
        //        if (_old_matrix) {
        //            this._intact_suf.matrix = _old_matrix;
        //        }
        //        this.___init();
        //    }
        //};
    };
    objects.extend(Span, EleBase);

    //---------   Span end   --------------------------------------------


    //=========   :Button   =============================================

    var Button = A.Button = function (id, x, y, imgurlORsize, imgArea, mouseOverImgArea, mouseDownImgArea) {
        this._text = null;
        this._text_ele = null;
        this._suf_normal = null;
        this._suf_mouseover = null;
        this._suf_mousedown = null;

        var __suf_mouseover = null, __suf_mousedown = null;
        if (typeof (imgurlORsize) === 'string') {
            this._suf_normal = image.load(imgurlORsize, imgArea);
            if (mouseOverImgArea) {
                __suf_mouseover = image.load(imgurlORsize, mouseOverImgArea);
            }
            if (mouseDownImgArea) {
                __suf_mousedown = image.load(imgurlORsize, mouseDownImgArea);
            }
        } else if (imgurlORsize instanceof Surface) {
            this._suf_normal = imgurlORsize;
        } else {
            var _w = 68, _h = 28;
            if (imgurlORsize instanceof Array) {
                if (imgurlORsize[0] > 0) {
                    _w = imgurlORsize[0];
                }
                if (imgurlORsize[1] > 0) {
                    _h = imgurlORsize[1];
                }
            }
            var _ra = 8, _minw = _w > _h ? _h : _w;
            if (_minw <= 5) { _ra = 0; }
            else if (_minw <= 10) { _ra = 2; }
            else if (_minw <= 20) { _ra = 4; }
            else if (_minw <= 40) { _ra = 6; }
            var _ps = [[_ra, 0], [_w, 0, _ra], [_w, _h, _ra], [0, _h, _ra], [0, 0, _ra]],
                _cx = _w / 2, _cy = _h / 2, _cp = [_cx, _cy], _r0 = 2, _r1 = (_w > _h ? _w : _h) * 1.5;
            var _qua0 = [0 - _cx / 3, _h / 3], _qua1 = [_w + _cx / 3, _h / 3], _qua2 = [_cx, _h * 2];
            this._suf_normal = Surface.genSurface([_w, _h]);
            draw.polygonArc(this._suf_normal, "#FEC53E", _ps, 0, ["#FEC53E", "#FFE18F", _cx, _cy, _r0, _cx, _cy, _r1]);
            draw.quadraticCurve(this._suf_normal, "#FEBE29", _qua0, _qua1, _qua2, 0, ["#FEBE29", "#FFCC99", _cx, _qua0[1], _r0, _cx, _qua0[1], _r1]);
            draw.polygonArc(this._suf_normal, "#2F5784", _ps, 1);
            __suf_mouseover = Surface.genSurface([_w, _h]);
            draw.polygonArc(__suf_mouseover, "#FEC94B", _ps, 0, ["#FEC94B", "#FFE18F", _cx, _cy, _r0, _cx, _cy, _r1]);
            draw.quadraticCurve(__suf_mouseover, "#FEBE29", _qua0, _qua1, _qua2, 0, ["#FEBE29", "#FFE18F", _cx, _qua0[1], _r0, _cx, _qua0[1], _r1]);
            draw.polygonArc(__suf_mouseover, "#003366", _ps, 1);
            __suf_mousedown = Surface.genSurface([_w, _h]);
            draw.polygonArc(__suf_mousedown, "#FEC94B", _ps, 0, ["#FEC94B", "#FFE18F", _cx, _cy, _r0, _cx, _cy, _r1]);
            draw.quadraticCurve(__suf_mousedown, "#FEBE29", _qua0, _qua1, _qua2, 0, ["#FEBE29", "#FFE18F", _cx, _qua0[1], _r0, _cx, _qua0[1], _r1]);
            draw.polygonArc(__suf_mousedown, "#009933", _ps, 1);
        }
        Button.superConstructor.apply(this, [id, x, y, this._suf_normal]);

        this._suf_handler_mouseover = function (ele, evt) {
            if (ele.enabled && ele._suf_mouseover) {
                ele.surface = ele._suf_mouseover;
            }
        };
        this._suf_handler_mouseout = function (ele, evt) {
            ele.surface = ele._suf_normal;
        };
        this._suf_handler_mousedown = function (ele, evt) {
            if (ele.enabled && ele._suf_mousedown) {
                ele.surface = ele._suf_mousedown;
            }
        };
        this._suf_handler_mouseup = function (ele, evt) {
            if (ele.enabled) {
                ele.surface = ele._suf_mouseover || ele._suf_normal;
            }
        };

        if (__suf_mouseover) {
            this.mouseoverSuf = __suf_mouseover;
        }
        if (__suf_mousedown) {
            this.mousedownSuf = __suf_mousedown;
        }
    };
    objects.extend(Button, EleBase);

    objects.accessors(Button.prototype, {
        'text': {
            get: function () {
                return this._text;
            },
            set: function (newValue) {
                if (newValue) {
                    if (newValue != this._text) {
                        if (this._text_ele) {
                            this._text_ele.remove();
                        }
                        this._text = newValue;
                        var _thisSize = this.size;
                        this._text_ele = new Label(null, newValue, 0, 0, (this.style._fontSize || "17px") + " " + (this.style._fontFamily || "Verdana"));
                        this._text_ele.style.fontColor = this.style._fontColor || "#001170";
                        this._text_ele.____init = this._text_ele._init;
                        var _btn = this;
                        this._text_ele._init = function () {
                            this.____init();
                            if (this.parent == _btn) {
                                var _text_size = this.size;
                                this.x = (_thisSize[0] - _text_size[0]) / 2;
                                this.y = (_thisSize[1] - _text_size[1]) / 2;
                            }
                        };
                        this.append(this._text_ele);
                    }
                } else {
                    this._text = null;
                    this._text_ele.remove();
                    this._text_ele = null;
                }
            }
        },
        'normalSuf': {
            get: function () { return this._suf_normal; },
            set: function (newSuf) {
                this.surface = newSuf;
                this._suf_normal = newSuf;
            }
        },
        'mouseoverSuf': {
            get: function () {
                return this._suf_mouseover;
            },
            set: function (newSuf) {
                if (this._suf_mouseover) {
                    this.removeEvent("mouseover", this._suf_handler_mouseover);
                    this.removeEvent("mouseout", this._suf_handler_mouseout);
                }
                this._suf_mouseover = newSuf;
                this.style.cursor = "pointer";
                this.addEvent("mouseover", this._suf_handler_mouseover);
                this.addEvent("mouseout", this._suf_handler_mouseout);
            }
        },
        'mousedownSuf': {
            get: function () {
                return this._suf_mousedown;
            },
            set: function (newSuf) {
                if (this._suf_mousedown) {
                    this.removeEvent("mousedown", this._suf_handler_mousedown);
                    this.removeEvent("mouseup", this._suf_handler_mouseup);
                }
                this._suf_mousedown = newSuf;
                this.addEvent("mousedown", this._suf_handler_mousedown);
                this.addEvent("mouseup", this._suf_handler_mouseup);
            }
        }
    });

    //---------   Button end   ------------------------------------------


    //=========   :HTMLEle   ============================================

    var HTMLEle = A.HTMLEle = function (id, eleORhtml) {
        this.ele = eleORhtml;
        if (typeof (eleORhtml) === 'string') {
            var _div = document.createElement("div");
            _div.innerHTML = eleORhtml;
            this.ele = _div.firstChild;
        }
        if (id) {
            this.ele.id = id;
        }
        this.ele.style.position = "absolute";
        HTMLEle.superConstructor.apply(this, [this.ele.id, 0, 0, null]);
        this.style = this.ele.style;
    };
    objects.extend(HTMLEle, EleBase);

    HTMLEle.prototype._init = function () {
        var _parentOffset = this.parent.offset,
            _cvs = display._getCanvas(),
            _cvsX = A.getXInParent(_cvs), _cvsY = A.getYInParent(_cvs);
        this.ele.style.left = (_cvsX + _parentOffset.x + this.x) + "px";
        this.ele.style.top = (_cvsY + _parentOffset.y + this.y) + "px";
        if (!this.ele.parentNode) {
            _cvs.parentElement.appendChild(this.ele);
        }
    };

    HTMLEle.prototype.focus = function () {
        if (this.ele.focus) {
            this.ele.focus();
        }
    };

    HTMLEle.prototype.draw = function () {
        if (this.___drawBefores) {
            var _this = this;
            this.___drawBefors.forEach(function (_T) {
                _T(_this);
            });
        }
        this._init();
        if (this._display) {
            this.ele.style.visibility = "visible";
        } else {
            this.ele.style.visibility = "hidden";
        }
        if (this.___drawAfters) {
            var _this = this;
            this.___drawAfters.forEach(function (_T) {
                _T(_this);
            });
        }
    };

    //---------   HTMLEle end   -----------------------------------------


    //=========   :MsgBox   =============================================

    //var MsgBox = A.MsgBox = function (id, tit, msg) {

    //};

    //---------   MsgBox end   ------------------------------------------


    //=========   :Form   ===============================================

    var Form = A.Form = function () {
        this.imgs = null;
        this.audios = null;
        this.amandas = null;
        this.timespan = 30;
        this.body = new EleBase(null, 0, 0, display.getSurface());
        this.body._init = function () {
            this._surface = this._intact_suf;
            this._surface.clear();
        };

        this.body.flushed = true;
    };

    Form.extend = function (formId) {
        var _formClass = function () {
            _formClass.superConstructor.apply(this, []);
        };
        objects.extend(_formClass, Form);
        _formClass.id = formId;
        $A.FORMs[formId] = _formClass;
        return _formClass;
    };

    Form.prototype.clear = function () {
        this.body.surface.clear();
    };

    Form.prototype.flush = function () {
        this.body.draw();
    };

    Form.prototype._onUnload = function () {
        //this.body.removeAllChilds();
        EleBase.___removeAllChildHTMLEles(this.body);
        if (this.onUnload) {
            this.onUnload();
        }
    };

    Form.prototype._onTick = function (dur, dtNow) {
        this.timespan = dur;
        if (this.body.__chgps_htmleles) {
            this.body.__chgps_htmleles.forEach(function (_T) {
                _T._init();
            });
            delete this.body.__chgps_htmleles;
        }
        var _timeout_overs = [];
        _TIMEOUTs.forEach(function (_T) {
            if (_T.tm == 0 || dtNow - _T.lst >= _T.tm) {
                _T.fn.apply(_T.fn, _T.args);
                _T.exed++;
                _T.lst = dtNow;
                if (_T.times != 0 && _T.exed >= _T.times) {
                    _timeout_overs.push(_T);
                    if (_T.cb) {
                        _T.cb.apply(_T.cb, _T.args);
                    }
                }
            }
        });
        if (_timeout_overs.length > 0) {
            _TIMEOUTs = _TIMEOUTs.filter(function (_T) {
                //return !_timeout_overs.any(function (_T2) {
                //    return _T2 == _T;
                //});
                return !_timeout_overs.some(function (_T2) {
                    return _T2 == _T;
                });
            });
        }
        if (this.onTick) {
            this.onTick(dur, dtNow);
        }
        this.flush();
    };

    Form.prototype._onEvent = function (evt) {
        if (event_handlers) {
            var _evt_pos = evt.pos, _body_size = this.body.size,
                _bl_inbody = _evt_pos ? (_evt_pos[0] >= 0 && _evt_pos[0] <= _body_size[0] && _evt_pos[1] >= 0 && _evt_pos[1] <= _body_size[1]) : true;
            if (!A.Loading.__block && (_bl_inbody || evt.type == event.MOUSE_MOTION || evt.type == event.MOUSE_UP)) {
                var _evt_item = null;
                switch (evt.type) {
                    case event.MOUSE_MOTION:
                        var _mouseout = event_handlers.mouseout;
                        if (_mouseout) {
                            for (var _i = 0; _i < _mouseout.length; _i++) {
                                var _item = _mouseout[_i];
                                if (_item.ele.enabled && _item.ele.display && !_item.ele.containPoint(_evt_pos)) {
                                    if (_item.ele.___evt_mouseover) {
                                        _item.ele.___evt_mouseover = false;
                                        _item.handler.forEach(function (_T) {
                                            _T(_item.ele, evt);
                                        });
                                    }
                                    //                                    if (_item.ele != this.body) {
                                    //                                        var _maxIdx = _mouseout.length - 1;
                                    //                                        if (_i < _maxIdx) {
                                    //                                            var _lastItem = _mouseout[_maxIdx];
                                    //                                            if (_lastItem.ele == this.body && !_bl_inbody) {
                                    //                                                if (_lastItem.ele.___evt_mouseover) {
                                    //                                                    _lastItem.ele.___evt_mouseover = false;
                                    //                                                    _lastItem.handler.forEach(function (_T) {
                                    //                                                        _T(_lastItem.ele, evt);
                                    //                                                    });
                                    //                                                }
                                    //                                            }
                                    //                                        }
                                    //                                    }
                                    //                                    break;
                                }
                            }
                        }
                        var _mouseover = event_handlers.mouseover;
                        if (_mouseover) {
                            for (var _i = 0; _i < _mouseover.length; _i++) {
                                var _item = _mouseover[_i];
                                if (_item.ele.enabled && _item.ele.display && _item.ele.containPoint(_evt_pos)) {
                                    if (!_item.ele.___evt_mouseover) {
                                        _item.ele.___evt_mouseover = true;
                                        _item.handler.forEach(function (_T) {
                                            _T(_item.ele, evt);
                                        });
                                    }
                                    if (_item.ele != this.body) {
                                        var _maxIdx = _mouseover.length - 1;
                                        if (_i < _maxIdx) {
                                            var _lastItem = _mouseover[_maxIdx];
                                            if (_lastItem.ele == this.body) {
                                                if (!_lastItem.ele.___evt_mouseover) {
                                                    _lastItem.ele.___evt_mouseover = true;
                                                    _lastItem.handler.forEach(function (_T) {
                                                        _T(_lastItem.ele, evt);
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        display.getSurface().canvas.style.cursor = "default";
                        if (_bl_inbody) {
                            _evt_item = event_handlers.mousemove;
                        }
                        break;
                    case event.CLICK:
                        _evt_item = event_handlers.click;
                        break;
                    case event.MOUSE_DOWN:
                        _evt_item = event_handlers.mousedown;
                        break;
                    case event.MOUSE_UP:
                        var _mouseup = event_handlers.mouseup;
                        if (_mouseup) {
                            for (var _i = 0; _i < _mouseup.length; _i++) {
                                var _item = _mouseup[_i];
                                if (_item.ele == this.body || (_bl_inbody && _item.ele.enabled && _item.ele.display && _item.ele.containPoint(_evt_pos))) {
                                    _item.handler.forEach(function (_T) {
                                        _T(_item.ele, evt);
                                    });
                                    if (_item.ele != this.body) {
                                        var _maxIdx = _mouseup.length - 1;
                                        if (_i < _maxIdx) {
                                            var _lastItem = _mouseup[_maxIdx];
                                            if (_lastItem.ele == this.body) {
                                                _lastItem.handler.forEach(function (_T) {
                                                    _T(_lastItem.ele, evt);
                                                });
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    case event.MOUSE_WHEEL:
                        var _scroll = event_handlers.scroll;
                        if (_scroll) {
                            for (var _i = 0; _i < _scroll.length; _i++) {
                                var _item = _scroll[_i];
                                if (_item.ele == this.body || (_bl_inbody && _item.ele.enabled && _item.ele.display && _item.ele.containPoint(_evt_pos))) {
                                    _item.handler.forEach(function (_T) {
                                        _T(_item.ele, evt);
                                    });
                                    if (_item.ele != this.body) {
                                        var _maxIdx = _scroll.length - 1;
                                        if (_i < _maxIdx) {
                                            var _lastItem = _scroll[_maxIdx];
                                            if (_lastItem.ele == this.body) {
                                                _lastItem.handler.forEach(function (_T) {
                                                    _T(_lastItem.ele, evt);
                                                });
                                            }
                                        }
                                    }
                                    evt.evt.preventDefault();
                                    break;
                                }
                            }
                        }
                        break;
                }
                if (_evt_item) {
                    for (var _i = 0; _i < _evt_item.length; _i++) {
                        var _item = _evt_item[_i];
                        if (_item.ele.enabled && _item.ele.display && _item.ele.containPoint(_evt_pos)) {
                            _item.handler.forEach(function (_T) {
                                _T(_item.ele, evt);
                            });
                            if (_item.ele != this.body) {
                                var _maxIdx = _evt_item.length - 1;
                                if (_i < _maxIdx) {
                                    var _lastItem = _evt_item[_maxIdx];
                                    if (_lastItem.ele == this.body) {
                                        _lastItem.handler.forEach(function (_T) {
                                            _T(_lastItem.ele, evt);
                                        });
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    };

    //---------   Form End   --------------------------------------------

    A._ROOT = "/";
    A.setRoot = function (newRoot) {
        if (newRoot) {
            //if (!newRoot.endWith("/")) {
            //    newRoot += "/";
            //}
            if (newRoot[newRoot.length - 1] != "/") {
                newRoot += "/";
            }
            A._ROOT = newRoot;
        }
    };
    A.setTb = function (tbName, tbVer, blStoreImg, blStoreMixer, callbackFun) {
        localDB.tbName = tbName;
        localDB._storeImg = blStoreImg;
        localDB._storeMixer = blStoreMixer;
        if (typeof (tbVer) != 'undefined') {
            A.getFromDB('tbver', function (_ver) {
                if (tbVer == _ver) {
                    if (callbackFun) {
                        callbackFun();
                    }
                } else {
                    localDB.clearTb(function () {
                        localDB.insert('tbver', tbVer, callbackFun);
                    });
                }
            });
        } else {
            if (callbackFun) {
                callbackFun();
            }
        }
    };
    A._genPath = function (resPath) {
        //if (resPath.startWith("http://") || resPath.startWith("https://") || resPath.startWith("file:///") || resPath.startWith("/")) {
        //    return resPath;
        //}
        if (resPath.slice(0, 7).toLowerCase() == "http://" || resPath[0] == "/") {
            return resPath;
        } else {
            var _str_8 = resPath.slice(0, 8).toLowerCase();
            if (_str_8 == "https://" || _str_8 == "file:///") {
                return resPath;
            }
        }
        return A._ROOT + resPath;
    };

    A.preload = function (keys_imgs, keys_audios, funCallback, funProgress) {
        var _imgs_ok = false, _audios_ok = false, _loadedn = 0, _alln = 0;

        if (keys_imgs) {
            if (typeof (keys_imgs) === 'string') {
                keys_imgs = [keys_imgs];
            }
            if (keys_imgs.length == 0) {
                _imgs_ok = true;
            }
        } else {
            _imgs_ok = true;
        }

        if (keys_audios) {
            if (typeof (keys_audios) === 'string') {
                keys_audios = [keys_audios];
            }
            if (keys_audios.length == 0) {
                _audios_ok = true;
            }
        } else {
            _audios_ok = true;
        }

        var _chkok = function () {
            if (_imgs_ok && _audios_ok) {
                if (funCallback) {
                    funCallback();
                }
            }
        };

        if (_imgs_ok && _audios_ok) {
            _chkok();
        } else {
            if (!_imgs_ok) {
                var _imgs = {}, _img_n = 0;
                keys_imgs.forEach(function (_T) {
                    if (!image.getFromCache(_T)) {
                        _imgs[_T] = A._genPath(_T);
                        _img_n++;
                    }
                });
                if (_img_n > 0) {
                    _alln = _img_n;
                    image.preload(_imgs, function () {
                        _imgs_ok = true;
                        _chkok();
                    }, function (_pLoadedN, _pAllN) {
                        _loadedn++;
                        if (funProgress) {
                            funProgress(_loadedn, _alln);
                        }
                    });
                } else {
                    _imgs_ok = true;
                    _chkok();
                }
            }
            if (!_audios_ok) {
                var _audios = {}, _audio_n = 0;
                keys_audios.forEach(function (_T) {
                    if (!mixer.getFromCache(_T)) {
                        _audios[_T] = A._genPath(_T);
                        _audio_n++;
                    }
                });
                if (_audio_n > 0) {
                    _alln += _audio_n;
                    mixer.preload(_audios, function () {
                        _audios_ok = true;
                        _chkok();
                    }, function (_pLoadedN, _pAllN) {
                        _loadedn++;
                        if (funProgress) {
                            funProgress(_loadedn, _alln);
                        }
                    });
                } else {
                    _audios_ok = true;
                    _chkok();
                }
            }
        }
    };

    A.CUR_FORM = null;
    A.FORMs = {};
    A.PLUGINs = {};

    A.start = function (cvsid, wh, timeDur) {
        display.init(cvsid);
        if (wh) {
            display.setMode(wh);
        }
        if (timeDur && timeDur > 0) {
            time.DUR = timeDur;
        }
        time.init();
        event.init();
        A.changeForm(0);
    };

    A.stop = function () {
        time.stop();
        event.stop();
        _TIMEOUTs = [];
        if (A.CUR_FORM) {
            A.CUR_FORM._onUnload();
        }
        A.CUR_FORM = null;
        _MASK_cached = {};
        var _i = 0;
        while (mixer._INGs.length > 0 && _i < 100) {
            mixer._INGs[0].pause();
            _i++;
        }
    };

    A.Loading = function (alln, bksuf) {
        this.alln = alln || 10;
        this.loadedn = 0;
        this.bksuf = bksuf;
        if (bksuf && !(bksuf instanceof Surface)) {
            this.bksuf = display.getSurface().clone();
        }
        return this;
    };
    A.Loading.prototype._draw = function () {
        var _dis = display.getSurface();
        _dis.clear();
        if (this.bksuf) {
            _dis.blit(this.bksuf, [0, 0]);
        }
        draw.rect(_dis, "rgba(211,211,190,0.6)", new Rect([0, 0], _dis.getSize()), 0);
        this.draw();
    };
    A.Loading.prototype.draw = function () {
        var _dis = display.getSurface(), _disSize = _dis.getSize();
        var _w = _disSize[0] / 2, _h = 60,
            _p0 = [(_disSize[0] - _w) / 2, (_disSize[1] - _h) / 2],
            _p1 = [_p0[0] + _w, _p0[1]],
            _p2 = [_p1[0], _p0[1] + _h],
            _p3 = [_p0[0], _p0[1] + _h],
            _ps = [_p0, _p1, _p2, _p3];
        draw.polygonArc(_dis, "#333300", _ps, 0);
        var _barW = _w - 100, _barH = 8, _barR = _barH / 2,
            _barBottom = _disSize[1] / 2,
            _barTop = _barBottom - _barH,
            _barO0X = (_disSize[0] - _barW) / 2,
            _barO1X = _barO0X + _barW,
            _o0Rect = new Rect(_barO0X - _barR, _barTop, _barH, _barH),
            _loadedColor = "#993300", _barColor = "#999966";
        draw.arc(_dis, _loadedColor, _o0Rect, 90, 270, 0);
        if (this.loadedn > 0) {
            var _barInW = _barW * (this.loadedn / this.alln);
            draw.rect(_dis, _loadedColor, new Rect(_barO0X, _barTop, _barInW, _barH), 0);
            draw.arc(_dis, _loadedColor, new Rect(_barO0X + _barInW - _barR, _barTop, _barH, _barH), -90, 90, 0);
        }
        draw.arc(_dis, _barColor, _o0Rect, 90, 270, 1);
        draw.arc(_dis, _barColor, new Rect(_barO1X - _barR, _barTop, _barH, _barH), -90, 90, 1);
        draw.line(_dis, _barColor, [_barO0X, _barTop], [_barO1X, _barTop], 1);
        draw.line(_dis, _barColor, [_barO0X, _barBottom], [_barO1X, _barBottom], 1);
        var _font = new Font("11px Verdana"),
            _txt = _font.render(this.loadedn + " / " + this.alln, "#9933FF"),
            _txtSize = _txt.getSize();
        _dis.blit(_txt, [(_disSize[0] - _txtSize[0]) / 2, _disSize[1] / 2 + 3]);
    };
    A.Loading.prototype.setLoadedN = function (loadedN, allN) {
        this.alln = allN;
        this.loadedn = loadedN;
        this._draw();
    };
    A.showLoading = function (isModel) {
        if (isModel) {
            A.Loading.__block = true;
        }
        var _ld = new A.Loading(10, true);
        _ld._draw();
        A.Loading.__lding = _ld;
        return _ld;
    };
    A.Loading.prototype.close = function () {
        delete A.Loading.__lding;
        delete A.Loading.__block;
        var _dis = display.getSurface();
        _dis.clear();
        if (this.bksuf && this.bksuf instanceof Surface) {
            _dis.blit(this.bksuf, [0, 0]);
        }
    };

    A.changeForm = function (newFormID, fnOnReady) {
        A.stop();
        var _form_init = function () {
            A.CUR_FORM = new A.FORMs[newFormID]();
            time.start(function (_pDur, _pNow) { A.CUR_FORM._onTick(_pDur, _pNow); });
            event.start(function (_pEvt) { A.CUR_FORM._onEvent(_pEvt); });
            A.CUR_FORM.init();
            if (fnOnReady) {
                fnOnReady();
            }
        };

        if (A.FORMs[newFormID]) {
            _form_init();
        } else {
            if (A.Loading.__lding) {
                A.Loading.__lding.close();
            }
            var _loading = new A.Loading(10, true);
            _loading._draw();
            var _jsid = "___amanda_form_" + newFormID;
            if (!document.getElementById(_jsid)) {
                var _head = document.getElementsByTagName("script")[0].parentNode,
                    _js = document.createElement("script");
                _js.src = A._ROOT + "forms/" + newFormID + ".js";
                _js.async = "true";
                _js.id = _jsid;
                _head.appendChild(_js);
            }
            time.start(function () {
                if (A.FORMs[newFormID]) {
                    var _fmc = A.FORMs[newFormID],
                        _ress_imgs = null, _ress_audios = null, _bl_pg = true;
                    if (_fmc.plugins && _fmc.plugins.length > 0) {
                        _bl_pg = false;
                        var _pluginAllN = _fmc.plugins.length, _plugined = 0;
                        _fmc.plugins.forEach(function (_T) {
                            if (A.PLUGINs[_T]) {
                                _plugined++;
                            } else {
                                var _plugin_jsid = "___amanda_pi_" + _T;
                                if (!document.getElementById(_plugin_jsid)) {
                                    var _head = document.getElementsByTagName("script")[0].parentNode,
                                        _js = document.createElement("script");
                                    _js.src = A._ROOT + "plugins/" + _T + ".js";
                                    _js.async = "true";
                                    _js.id = _plugin_jsid;
                                    _head.appendChild(_js);
                                }
                            }
                        });
                        _loading.setLoadedN(_plugined, _pluginAllN);
                        if (_plugined == _pluginAllN) {
                            _fmc.plugins.forEach(function (_T) {
                                if (_T.imgs && _T.imgs.length > 0) {
                                    _ress_imgs = [];
                                    for (var _k in _T.imgs) {
                                        var _v = _T.imgs[_k];
                                        _ress_imgs.push(_v);
                                    }
                                }
                                if (_T.audios && _T.audios.length > 0) {
                                    _ress_audios = [];
                                    for (var _k in _T.audios) {
                                        var _v = _T.audios[_k];
                                        _ress_audios.push(_v);
                                    }
                                }
                            });
                            _bl_pg = true;
                        }
                    }
                    if (_bl_pg) {
                        time.stop();

                        if (_fmc.imgs) {
                            if (!_ress_imgs) {
                                _ress_imgs = [];
                            }
                            for (var _k in _fmc.imgs) {
                                var _v = _fmc.imgs[_k];
                                _ress_imgs.push(_v);
                            }
                        }
                        if (_fmc.audios) {
                            if (!_ress_audios) {
                                _ress_audios = [];
                            }
                            for (var _k in _fmc.audios) {
                                var _v = _fmc.audios[_k];
                                _ress_audios.push(_v);
                            }
                        }
                        var _resn = 0;
                        if (_ress_imgs) {
                            _resn = _ress_imgs.length;
                        }
                        if (_ress_audios) {
                            _resn += _ress_audios.length;
                        }
                        if (_resn > 0) {
                            _loading.setLoadedN(0, _resn);
                            A.preload(_ress_imgs, _ress_audios, function () {
                                _form_init();
                            }, function (_pLoaded, _pAll) {
                                _loading.setLoadedN(_pLoaded, _pAll);
                            });
                        } else {
                            _form_init();
                        }
                    }
                }
            });
        }
    };
    
    var _TIMEOUTs = [];

    A.setTimeout = function (fn, timeout, args, times, callbackFun) {
        if (typeof (times) == 'undefined' || times == null || times < 0) {
            times = 1;
        }
        var _id = ___genUniqueId();
        _TIMEOUTs.push({ id: _id, fn: fn, tm: timeout, cb: callbackFun, lst: Date.now(), args: args, times: times, exed: 0 });
        return _id;
    };

    A.clearTimeout = function (handlerId) {
        _TIMEOUTs = _TIMEOUTs.filter(function (_T) {
            return _T.id != handlerId;
        });
    };

    A.onMsg = function (msg) {
        if (A.CUR_FORM && A.CUR_FORM.onMsg) {
            A.CUR_FORM.onMsg(msg);
        }
    };

})(window);