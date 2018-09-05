var S = {}
// module.exports = S

/*

OBJECT
──────

el                  elements
p                   properties
d                   duration
e                   ease
delay               delay
cb                  callback
cbDelay             callback delay
round               rounding of values
update              custom function to update external things

PROPERTIES
──────────

x                   transform3d → {x: [start, end, unit]} → unit: 'px' for pixel || % if not declared
y
rotate
rotateX
rotateY
scale
scaleX
scaleY
opacity
height
width

SVG
───

type                'polygon' or 'path'
start               optional
end

LINE
────

elWithLength        optional → The total length of the line is calculated with him if he's present (example: folio dodecagon)
dashed              '1,4' or false
start               percentage → default: 0
end                 percentage → default: 100

TRANSLATION EXAMPLE
───────────────────

this.anim = new S.Merom({el: '#id', p: {x: [0, 600, 'px']}, d: 2000, e: 'Power4Out'})

this.anim.play()

this.anim.play({p: {x: {newEnd: 50}}, reverse: true})

MORPHING JS EXAMPLE
───────────────────

this.morph = new S.Merom({
    el: '#circle',
    svg: {
        type: 'polygon',
        end: '57.2,32.8 60.6,34.7 64.3,36.9 68.5,39.3 71.1,40.8 74.2,42.6 77.6,44.6 80.9,46.5 85,48.8 88.1,50.6 91.4,52.5 94.5,54.3 97.6,56.1 100.9,58 104.5,60.1 109,62.7 113,65 109.6,67 105.9,69.1 101.7,71.5 98.9,73.1 95.4,75.2 92,77.1 89.1,78.8 85.6,80.8 82,82.9 77.6,85.5 73.4,87.8 70.3,89.7 67.2,91.5 63.6,93.5 59.7,95.8 55.9,98 52.3,100 49.5,101.7 46.7,103.3 43.8,105 41,106.6 38,108.3 38,103 38,97.3 38,92.7 38,89.2 38,85.6 38,81.7 38,77.9 38,73.2 38,68.8 38,65 38,61.1 38,56.8 38,52.4 38,47.9 38,44.3 38,39.4 38,35.2 38,30.5 38,25.7 38,21.7 41,23.5 44.6,25.5 48.4,27.7 51.4,29.4 54,30.9'
    },
    d: 2000,
    e: 'Power4Out'
})

this.morph.play()

MORPHING HTML EXAMPLE
─────────────────────

<svg width="130" height="130" viewBox="0 0 130 130">
    <polygon id="circle" points="65,0 71.7,0.3 78.2,1.4 85.6,3.3 92.6,6.1 97.1,8.5 102.3,11.8 107.1,15.5 111.1,19.2 116,24.7 119.4,29.5 122.7,35 125.2,40.4 127.5,47.2 129,53.5 129.8,59.6 130,65 129.8,70.6 128.9,76.9 127.5,82.9 125.2,89.5 122.6,95.1 119.6,100.3 115.7,105.7 111,111 106.6,115 101.7,118.6 95.8,122.2 90.1,125 83.1,127.4 76.3,129 70.6,129.8 65,130 59.6,129.8 53.1,128.9 46.7,127.4 40.4,125.2 34.5,122.4 29,119.1 23.9,115.3 19,111 13.9,105.1 10.6,100.6 7.2,94.8 4.8,89.5 2.3,82.4 1.1,76.9 0.3,71.2 0,65 0.3,58.8 1.1,53 2.9,45.8 5.8,38.1 8.3,33.2 11.3,28.3 14.7,23.8 19.1,18.9 23.8,14.7 28.8,11 34.1,7.8 39.3,5.3 46.5,2.7 53.2,1.1 58.9,0.3"/>
</svg>

LINE JS EXAMPLE
───────────────

this.line = new S.Merom({
    el: '.shape',
    line: {
        elWithLength: this.el
        dashed: '1,4',
        start: 0,
        end: 25
    },
    d: 2000,
    e: 'Power4Out'
})

this.line.play()

LINE CIRCLE HTML EXAMPLE
────────────────────────

<svg width="30" height="30" viewBox="0 0 30 30">
    <circle class="shape" r="14.5" cx="15" cy="15"></circle>
</svg>

LINE PATH HTML EXAMPLE
──────────────────────

<svg width="100" height="100" viewBox="0 0 100 100">
    <path class="shape" d="M1,50a49,49 0 1,0 98,0a49,49 0 1,0 -98,0"/>
</svg>

LINE CSS EXAMPLE
────────────────

.shape {
    fill: none;
    stroke: pink;
    opacity: 0;
}

*/

S.Merom = function (opts) {
    S.BindMaker(this, ['getRaf', 'loop', 'updSvg', 'updLine', 'updProp'])

    this.v = this.varsInit(opts)
}

S.Merom.prototype = {

    varsInit: function (o) {
        var v = {
            el: S.Selector.el(o.el),
            e: {
                value: o.e || 'linear'
            },
            d: {
                origin: o.d || 0,
                curr: 0
            },
            delay: o.delay || 0,
            cb: o.cb || false,
            cbDelay: o.cbDelay || 0,
            reverse: o.reverse || false,
            round: o.round,
            progress: 0,
            time: {
                elapsed: 0
            }
        }
        v.elL = v.el.length

        // Update
        if (S.Has(o, 'update')) {
            v.update = function () {o.update(v)}
        } else if (S.Has(o, 'svg')) {
            v.update = this.updSvg
        } else if (S.Has(o, 'line')) {
            v.update = this.updLine
        } else {
            v.update = this.updProp
        }

        var p = o.p || false
        var s = o.svg || false
        var l = o.line || false
        // Prop
        if (p) {
            v.prop = {}
            v.propPos = []
            var keys = Object.keys(p)
            v.propL = keys.length
            for (var i = 0; i < v.propL; i++) {
                var key = keys[i]
                // Save prop in array
                v.prop[i] = {
                    name: key,
                    origin: {
                        start: p[key][0],
                        end: p[key][1]
                    },
                    curr: p[key][0],
                    start: p[key][0],
                    end: p[key][1],
                    unit: p[key][2] || '%'
                }
                // Save position of each prop in prop.arr
                v.propPos[key.charAt(0)] = i
            }
        // Svg
        } else if (s) {
            v.svg = {
                type: s.type,
                attr: s.type === 'polygon' ? 'points' : 'd',
                end: s.end,
                originArr: {},
                arr: {},
                val: []
            }
            v.svg.start = s.start || v.el[0].getAttribute(v.svg.attr)
            v.svg.curr = v.svg.start
            v.svg.originArr.start = this.svgSplit(v.svg.start)
            v.svg.originArr.end = this.svgSplit(v.svg.end)
            v.svg.arr.start = v.svg.originArr.start
            v.svg.arr.end = v.svg.originArr.end
            v.svg.arrL = v.svg.arr.start.length
        // Line
        } else if (l) {
            v.line = {
                elWL: l.elWithLength,
                dashed: l.dashed,
                coeff: {
                    start: l.start !== undefined ? (100 - l.start) / 100 : 1,
                    end: l.end !== undefined ? (100 - l.end) / 100 : 0
                },
                shapeL: [],
                origin: {
                    start: [],
                    end: []
                },
                curr: [],
                start: [],
                end: []
            }

            for (var i = 0; i < v.elL; i++) {
                v.line.shapeL[i] = getShapeLength(v.el[i])

                var strokeD
                if (v.line.dashed) {
                    var dashL = 0
                    var dashArr = dashed.split(/[\s,]/)
                    var dashArrL = dashArr.length
                    for (var j = 0; j < dashArrL; j++) {
                        dashL += parseFloat(dashArr[j]) || 0
                    }
                    var a = ''
                    var dashCount = Math.ceil(v.line.shapeL[i] / dashL)
                    for (var j = 0; j < dashCount; j++) {
                        a += dashed + ' '
                    }
                    strokeD = a + '0' + ' ' + v.line.shapeL[i]
                } else {
                    strokeD = v.line.shapeL[i]
                }
                v.el[i].style.strokeDasharray = strokeD
                v.line.origin.start[i] = v.line.coeff.start * v.line.shapeL[i]
                v.line.origin.end[i] = v.line.coeff.end * v.line.shapeL[i]
                v.line.curr[i] = v.line.origin.start[i]
                v.line.start[i] = v.line.origin.start[i]
                v.line.end[i] = v.line.origin.end[i]
            }

            function getShapeLength (el) {
                if (el.tagName === 'circle') {
                    var radius = el.getAttribute('r')
                    return 2 * radius * Math.PI
                } else if (el.tagName === 'line') {
                    var x1 = el.getAttribute('x1')
                    var x2 = el.getAttribute('x2')
                    var y1 = el.getAttribute('y1')
                    var y2 = el.getAttribute('y2')
                    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2)
                } else if (el.tagName === 'polyline') {
                    var totalLength = 0
                    var prevPos
                    var elPtsL = el.points.numberOfItems
                    for (var i = 0; i < elPtsL; i++) {
                        var pos = el.points.getItem(i)
                        if (i > 0) {
                            totalLength += Math.sqrt(Math.pow((pos.x - prevPos.x), 2) + Math.pow((pos.y - prevPos.y), 2))
                        }
                        prevPos = pos
                    }
                    return totalLength
                } else {
                    var el = v.line.elWL || el
                    return el.getTotalLength()
                }
            }
        }

        return v
    },

    play: function (opts) {
        this.pause()
        this.varsUpd(opts)
        setTimeout(this.getRaf, this.v.delay)
    },

    pause: function () {
        cancelAnimationFrame(this.raf)
        this.needEnd = true
    },

    varsUpd: function (opts) {
        var o = opts || {}
        var newEnd = S.Has(o, 'reverse') && o.reverse ? 'start' : 'end'

        // Prop
        if (S.Has(this.v, 'prop')) {
            for (var i = 0; i < this.v.propL; i++) {
                this.v.prop[i].end = this.v.prop[i].origin[newEnd]
                this.v.prop[i].start = this.v.prop[i].curr
                if (S.Has(o, 'p') && S.Has(o.p, this.v.prop[i].name)) {
                    if (S.Has(o.p[this.v.prop[i].name], 'newEnd')) {
                        this.v.prop[i].end = o.p[this.v.prop[i].name].newEnd
                    }
                    if (S.Has(o.p[this.v.prop[i].name], 'newStart')) {
                        this.v.prop[i].start = o.p[this.v.prop[i].name].newStart
                    }
                }
            }
        // Svg
        } else if (S.Has(this.v, 'svg')) {
            if (S.Has(o, 'svg') && S.Has(o.svg, 'start')) {
                this.v.svg.arr.start = o.svg.start
            } else {
                this.v.svg.arr.start = this.svgSplit(this.v.svg.curr)
            }
            if (S.Has(o, 'svg') && S.Has(o.svg, 'end')) {
                this.v.svg.arr.end = o.svg.end
            } else {
                this.v.svg.arr.end = this.v.svg.originArr[newEnd]
            }
        // Line
        } else if (S.Has(this.v, 'line')) {
            for (var i = 0; i < this.v.elL; i++) {
                this.v.line.start[i] = this.v.line.curr[i]
            }
            if (S.Has(o, 'line') && S.Has(o.line, 'end')) {
                this.v.line.coeff.end = (100 - o.line.end) / 100
                for (var i = 0; i < this.v.elL; i++) {
                    this.v.line.end[i] = this.v.line.coeff.end * this.v.line.shapeL[i]
                }
            } else {
                this.v.line.end[i] = this.v.line.origin[newEnd][i]
            }
        }

        this.v.d.curr = S.Has(o, 'd') ? o.d : this.v.d.origin - this.v.d.curr + this.v.time.elapsed
        this.v.e.value = o.e || this.v.e.value
        this.v.e.calc = S.Ease[this.v.e.value]
        this.v.delay = S.Has(o, 'delay') ? o.delay : this.v.delay
        this.v.cbDelay = S.Has(o, 'cbDelay') ? o.cbDelay : this.v.cbDelay
        this.v.cb = S.Has(o, 'cb') ? o.cb : this.v.cb
    },

    getRaf: function () {
        this.v.time.start = 0

        this.raf = requestAnimationFrame(this.loop)
    },

    loop: function (now) {
        if (!this.v.time.start) this.v.time.start = now
        this.v.time.elapsed = now - this.v.time.start
        this.v.progress = this.v.d.curr > 0 ? this.v.e.calc(Math.min(this.v.time.elapsed / this.v.d.curr, 1)) : 1

        this.v.update()

        if (this.v.progress < 1) {
            this.raf = requestAnimationFrame(this.loop)
        } else if (this.needEnd) {
            this.needEnd = false
            this.v.update()
            if (this.v.cb) {
                setTimeout(this.v.cb, this.v.cbDelay)
            }
        }
    },

    updProp: function () {
        // Lerp
        for (var i = 0; i < this.v.propL; i++) {
            this.v.prop[i].curr = this.lerp(this.v.prop[i].start, this.v.prop[i].end)
        }

        // Transform
        var x = S.Has(this.v.propPos, 'x') ? this.v.prop[this.v.propPos['x']].curr + this.v.prop[this.v.propPos['x']].unit : 0
        var y = S.Has(this.v.propPos, 'y') ? this.v.prop[this.v.propPos['y']].curr + this.v.prop[this.v.propPos['y']].unit : 0
        var t3d = x + y === 0 ? 0 : 'translate3d(' + x + ',' + y + ',0)'
        var r = S.Has(this.v.propPos, 'r') ? this.v.prop[this.v.propPos['r']].name + '(' + this.v.prop[this.v.propPos['r']].curr + 'deg)' : 0
        var s = S.Has(this.v.propPos, 's') ? this.v.prop[this.v.propPos['s']].name + '(' + this.v.prop[this.v.propPos['s']].curr + ')' : 0
        var t = t3d + r + s === 0 ? 0 : [t3d, r, s].filter(function (val) {return val !== 0}).join(' ')

        // Opacity
        var o = S.Has(this.v.propPos, 'o') ? this.v.prop[this.v.propPos['o']].curr : -1

        // Width & Height
        var w = S.Has(this.v.propPos, 'w') ? this.v.prop[this.v.propPos['w']].curr + this.v.prop[this.v.propPos['w']].unit : 0
        var h = S.Has(this.v.propPos, 'h') ? this.v.prop[this.v.propPos['h']].curr + this.v.prop[this.v.propPos['h']].unit : 0

        // Dom update
        for (var i = 0; i < this.v.elL; i++) {
            if (this.v.el[i] === undefined) break
            if (t !== 0) {
                this.v.el[i].style.transform = t
            }
            if (o >= 0) {
                this.v.el[i].style.opacity = o
            }
            if (w !== 0) {
                this.v.el[i].style.width = w
            }
            if (h !== 0) {
                this.v.el[i].style.height = h
            }
        }
    },

    updSvg: function () {
        // Lerp
        this.v.svg.currTemp = ''
        for (var i = 0; i < this.v.svg.arrL; i++) {
            this.v.svg.val[i] = this.isSvgLetter(this.v.svg.arr.start[i]) ? this.v.svg.arr.start[i] : this.lerp(+this.v.svg.arr.start[i], +this.v.svg.arr.end[i])
            this.v.svg.currTemp += this.v.svg.val[i] + ' '
            this.v.svg.curr = this.v.svg.currTemp.trim()
        }

        // Dom update
        for (var i = 0; i < this.v.elL; i++) {
            if (this.v.el[i] === undefined) break
            this.v.el[i].setAttribute(this.v.svg.attr, this.v.svg.curr)
        }
    },

    updLine: function () {
        // Lerp + Dom update
        for (var i = 0; i < this.v.elL; i++) {
            var elS = this.v.el[i].style
            this.v.line.curr[i] = this.lerp(this.v.line.start[i], this.v.line.end[i])
            elS.strokeDashoffset = this.v.line.curr[i]
            if (this.v.progress === 0) {
                elS.opacity = 1
            }
        }
    },

    lerp: function (start, end) {
        return S.Round(S.Lerp.init(start, end, this.v.progress), this.v.round)
    },

    svgSplit: function (coords) {
        var s = coords.split(' ')
        var sL = s.length
        var arr = []
        for (var i = 0; i < sL; i++) {
            var s2 = s[i].split(',')
            var s2L = s2.length
            for (var j = 0; j < s2L; j++) {
                arr.push(+s2[j])
            }
        }
        return arr
    },

    isSvgLetter: function (v) {
        return (v === 'M' || v === 'L' || v === 'C' || v === 'Z')
    }

}

/*

this.tl = new S.Timeline()
this.tl.from({el: '#id0', p: {x: [0, 600, 'px'], rotate: [0, 360]}, d: 5000, e: 'linear'})
this.tl.from({el: '#id1', p: {x: [0, 600, 'px'], rotate: [0, 360]}, d: 5000, e: 'linear', delay: 300})

this.tl.play()

this.tl.pause()

this.tl.play({reverse: true})

*/

S.Timeline = function () {
    this.arr = []
    this.delay = 0
}

S.Timeline.prototype = {

    from: function (opts) {
        this.delay += S.Has(opts, 'delay') ? opts.delay : 0
        opts.delay = this.delay
        this.arr.push(new S.Merom(opts))
    },

    play: function (reverse) {
        this.run('play', reverse)
    },

    pause: function () {
        this.run('pause')
    },

    run: function (type, r) {
        var arrL = this.arr.length
        var o = !r ? undefined : r
        for (var i = 0; i < arrL; i++) {
            this.arr[i][type](o)
        }
    }

}

/*

S.BindMaker(this, ['bindFunction1', 'bindFunction2', 'bindFunction3'])

*/

S.BindMaker = function (self, bindArr) {
    var bindArrL = bindArr.length

    for (var i = 0; i < bindArrL; i++) {
        self[bindArr[i]] = self[bindArr[i]].bind(self)
    }
}

/*

const easeMultiplier = S.Ease['linear'](multiplier)

*/

S.Ease = {
    linear: function (m) {
        return m
    },
    Power1In: function (m) {
        return -Math.cos(m * (Math.PI / 2)) + 1
    },
    Power1Out: function (m) {
        return Math.sin(m * (Math.PI / 2))
    },
    Power1InOut: function (m) {
        return -0.5 * (Math.cos(Math.PI * m) - 1)
    },
    Power2In: function (m) {
        return m * m
    },
    Power2Out: function (m) {
        return m * (2 - m)
    },
    Power2InOut: function (m) {
        return m < 0.5 ? 2 * m * m : -1 + (4 - 2 * m) * m
    },
    Power3In: function (m) {
        return m * m * m
    },
    Power3Out: function (m) {
        return (--m) * m * m + 1
    },
    Power3InOut: function (m) {
        return m < 0.5 ? 4 * m * m * m : (m - 1) * (2 * m - 2) * (2 * m - 2) + 1
    },
    Power4In: function (m) {
        return m * m * m * m
    },
    Power4Out: function (m) {
        return 1 - (--m) * m * m * m
    },
    Power4InOut: function (m) {
        return m < 0.5 ? 8 * m * m * m * m : 1 - 8 * (--m) * m * m * m
    },
    Power5In: function (m) {
        return m * m * m * m * m
    },
    Power5Out: function (m) {
        return 1 + (--m) * m * m * m * m
    },
    Power5InOut: function (m) {
        return m < 0.5 ? 16 * m * m * m * m * m : 1 + 16 * (--m) * m * m * m * m
    },
    ExpoIn: function (m) {
        return (m === 0) ? 0 : Math.pow(2, 10 * (m - 1))
    },
    ExpoOut: function (m) {
        return (m === 1) ? 1 : -Math.pow(2, -10 * m) + 1
    },
    ExpoInOut: function (m) {
        if (m === 0) {
            return 0
        } else if (m === 1) {
            return 1
        } else if ((m /= 0.5) < 1) {
            return 0.5 * Math.pow(2, 10 * (m - 1))
        } else {
            return 0.5 * (-Math.pow(2, -10 * --m) + 2)
        }
    }
}

/*

S.Has(object, 'property')

*/

S.Has = function (obj, key) {
    return obj ? hasOwnProperty.call(obj, key) : false
}

/*

const isString = S.Is.string(varToCheck)
const isObject = S.Is.object(varToCheck)

*/

S.Is = {
    string: function (v) {
        return typeof v === 'string'
    },

    object: function (v) {
        return v === Object(v)
    },

    array: function (v) {
        return v.constructor === Array
    },

    def: function (v) {
        return v !== undefined
    },

    undef: function (v) {
        return v === undefined
    },

    nodes: function (v) {
        const sdc = Object.prototype.toString.call(v)

        return typeof v === 'object' &&
            /^\[object (HTMLCollection|NodeList|Object)]$/.test(sdc) &&
            (typeof v.length === 'number') &&
            (v.length === 0 || (typeof v[0] === 'object' && v[0].nodeType > 0))
    }
}

/*
    TODO

    nodeList (nodes) {
        const sdc = Object.prototype.toString.call(nodes)

        return typeof nodes === 'object' &&
            /^\[object (HTMLCollection|NodeList|Object)]$/.test(sdc) &&
            (typeof nodes.length === 'number') &&
            (nodes.length === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0))
    }
*/

/*

►►►  init : simple lerp (!== OP's algorithm used to prevent the floating-point error)

S.Lerp.init(start, end, multiplier)

►►►  extend : lerp with coordinates change

S.Lerp.extend(nX, n0, n1, start, end)

*/

S.Lerp = {
    init: function (s, e, m) {
        return s + (e - s) * m
    },

    extend: function (nX, n0, n1, s, e) {
        return s + (e - s) / (n1 - n0) * (nX - 1)
    }
}

/*

S.Round(number, precision)

►►►  precision is optional → 3 by default

0 → 1
1 → 0.1
2 → 0.01
3 → 0.001

*/

S.Round = function (n, p) {
    var p = p !== undefined ? Math.pow(10, p) : 1000
    return Math.round(n * p) / p
}

/*

const isSafari = S.Snif.isSafari
const version = S.Snif.version
const isTouch = S.Snif.isTouch

*/

S.Snif = {
    uA: navigator.userAgent.toLowerCase(),

    get isMobileIE () {
        return /iemobile/i.test(this.uA)
    },

    get isMobileOpera () {
        return /opera mini/i.test(this.uA)
    },

    get isIOS () {
        return /iphone|ipad|ipod/i.test(this.uA)
    },

    get isBlackberry () {
        return /blackberry/i.test(this.uA)
    },

    get isMobileAndroid () {
        return /android.*mobile/.test(this.uA)
    },

    get isAndroid () {
        return this.isMobileAndroid || !this.isMobileAndroid && /android/i.test(this.uA)
    },

    get isFirefox () {
        return this.uA.indexOf('firefox') > -1
    },

    get safari () {
        return this.uA.match(/version\/[\d\.]+.*safari/)
    },

    get isSafari () {
        return !!this.safari && !this.isAndroid
    },

    get isSafariOlderThan8 () {
        var limit = 8
        var version = limit
        if (this.isSafari) {
            var versionWithVersionWord = this.safari[0].match(/version\/\d{1,2}/)
            version = +versionWithVersionWord[0].split('/')[1]
        }
        return version < limit
    },

    get isIEolderThan11 () {
        return this.uA.indexOf('msie') > -1
    },

    get isIE11 () {
        return navigator.appVersion.indexOf('Trident/') > 0
    },

    get isIE () {
        return this.isIEolderThan11 || this.isIE11
    },

    get isMac () {
        return navigator.platform.toLowerCase().indexOf('mac') > -1
    },

    get isMobile () {
        return this.isMobileAndroid || this.isBlackberry || this.isIOS || this.isMobileOpera || this.isMobileIE
    },

    get isTouch () {
        return 'ontouchstart' in window
    }
}

/*

►►►  firstTime for window resizer

const throttle = new S.Throttle({
    cb: callback,
    delay: 200
    onlyAtEnd: true
})

throttle.init()

*/

S.Throttle = function (opts) {
    this.delay = opts.delay
    this.cb = opts.cb
    this.onlyAtEnd = opts.onlyAtEnd
    this.last
    this.timer
}

S.Throttle.prototype = {
    init: function () {
        var self = this
        var firstTime = true
        var now = Date.now()
        if ((this.last && now < this.last + this.delay) || firstTime) {
            firstTime = false
            clearTimeout(this.timer)
            this.timer = setTimeout(function () {
                self.last = now
                self.cb()
            }, this.delay)
        } else {
            this.last = now
            if (!this.onlyAtEnd) {
                firstTime = false
                this.cb()
            }
        }
    }
}

/*

GET ELEMENT BY
──────────────

const content = S.G.id('content')
const btn = S.G.class('btn')
const span = S.G.tag('span')

CHILD OF ELEMENT
────────────────

const elements = S.G.class('elements', parentEl)

*/

S.G = {
    parent: function (p) {
        return p ? p : document
    },

    id: function (el, p) {
        return this.parent(p).getElementById(el)
    },

    class: function (el, p) {
        return this.parent(p).getElementsByClassName(el)
    },

    tag: function (el, p) {
        return this.parent(p).getElementsByTagName(el)
    }
}

/*

const body = S.Dom.body

*/

S.Dom = {
    html: document.documentElement,
    body: document.body
}

/*

const el[0] = S.Selector.el(selector)
const type = S.Selector.type(selector)
const name = S.Selector.name(selector)

*/

S.Selector = {
    el: function (v) {
        var el = []
        if (S.Is.string(v)) {
            var elName = v.substring(1)
            if (v.charAt(0) === '#') {
                el[0] = S.G.id(elName)
            } else {
                el = S.G.class(elName)
            }
        } else if (S.Is.nodes(v)) {
            for (let node of v) {
                el.push(node)
            }
        } else {
            el[0] = v
        }
        return el
    },

    type: function (v) {
        if (v.charAt(0) === '#') {
            return 'id'
        } else {
            return 'class'
        }
    },

    name: function (v) {
        return v.substring(1)
    }
}

/*

const elementLiIndex = S.Index.list(liElement)
const elementClassIndex = S.Index.class(elementWithClass, className)

*/

S.Index = {
    index: function (n, els) {
        var elsL = els.length
        for (var i = 0; i < elsL; i++) {
            if (n === els[i]) {
                return i
            }
        }
        return -1
    },

    list: function (n) {
        var els = n.parentNode.children
        return this.index(n, els)
    },

    class: function (n, cN) {
        var els = S.G.class(cN)
        return this.index(n, els)
    }
}

/*

►►►  element is optional

S.BindMaker(this, ['mmCb'])

this.MM = new S.MM({
    element: '#element',
    cb: this.mmCb
})

this.MM.on()
this.MM.off()

mmCb (posX, posY, event) {

}

*/

S.MM = function (opts) {
    this.el = S.Selector.el(opts.element)[0] || document
    this.cb = opts.cb
    this.iM = S.Snif.isMobile
    this.tick = false

    S.BindMaker(this, ['getRaf', 'run'])
}

S.MM.prototype = {

    on: function () {
        this.l('add')
    },

    off: function () {
        this.l('remove')
    },

    l: function (action) {
        var type = this.iM ? 'touch' : 'mouse'
        S.L(this.el, action, type + 'move', this.getRaf)
    },

    getRaf: function (e) {
        this.e = e

        if (!this.tick) {
            this.raf = requestAnimationFrame(this.run)
            this.tick = true
        }
    },

    run: function () {
        var t = this.iM ? this.e.changedTouches[0] : this.e

        this.cb(t['pageX'], t['pageY'], this.e)
        this.tick = false
    }

}

/*

S.BindMaker(this, ['resize'])

this.RO = new S.RO({
    cb: this.resize,
    throttle: {
        delay: 100,
        onlyAtEnd: true
    }
})

this.RO.on()
this.RO.off()

resize (event) {

}

*/

S.RO = function (opts) {
    this.cb = opts.cb
    this.iM = S.Snif.isMobile
    this.tick = false

    S.BindMaker(this, ['getThrottle', 'getRaf', 'run'])

    this.throttle = new S.Throttle({
        cb: this.getRaf,
        delay: opts.throttle.delay,
        onlyAtEnd: opts.throttle.onlyAtEnd
    })
}

S.RO.prototype = {

    on: function () {
        this.l('add')
    },

    off: function () {
        this.l('remove')
    },

    l: function (action) {
        if (this.iM) {
            S.L(window, action, 'orientationchange', this.getThrottle)
        } else {
            S.L(window, action, 'resize', this.getThrottle)
        }
    },

    getThrottle: function (e) {
        this.e = e
        this.throttle.init()
    },

    getRaf: function () {
        if (!this.tick) {
            this.raf = requestAnimationFrame(this.run)
            this.tick = true
        }
    },

    run: function () {
        this.cb(this.e)
        this.tick = false
    }

}

/*

S.BindMaker(this, ['scrollCb'])

this.scroll = new S.Scroll(this.scrollCb)

this.scroll.on()
this.scroll.off()

scrollCb (currentScrollY, delta, event) {

}

*/

S.Scroll = function (cb) {
    this.cb = cb
    this.tick = false

    S.BindMaker(this, ['getRaf', 'run'])
}

S.Scroll.prototype = {

    on: function () {
        this.startScrollY = pageYOffset

        this.l('add')
    },

    off: function () {
        this.l('remove')
    },

    l: function (action) {
        S.L(window, action, 'scroll', this.getRaf)
    },

    getRaf: function (e) {
        this.e = e

        if (!this.tick) {
            this.raf = requestAnimationFrame(this.run)
            this.tick = true
        }
    },

    run: function () {
        var currentScrollY = pageYOffset
        var delta = -(currentScrollY - this.startScrollY)

        // Reset start scroll y
        this.startScrollY = currentScrollY

        this.cb(currentScrollY, delta, this.e)
        this.tick = false
    }

}

/*

S.BindMaker(this, ['wtCb'])

this.WT = new S.WT(this.wtCb)

this.WT.on()
this.WT.off()

wtCb (delta, type, event) {

}

type → 'scroll' or 'touch'

*/

S.WT = function (cb) {
    this.cb = cb
    this.iM = S.Snif.isMobile
    this.tick = false

    S.BindMaker(this, ['touchStart', 'getRaf', 'run'])
}

S.WT.prototype = {

    on: function () {
        this.l('add')
    },

    off: function () {
        this.l('remove')
    },

    l: function (action) {
        var d = document
        if (this.iM) {
            S.L(d, action, 'touchstart', this.touchStart)
            S.L(d, action, 'touchmove', this.getRaf)
        } else {
            S.L(d, action, 'mouseWheel', this.getRaf)
        }
    },

    getRaf: function (e) {
        this.e = e
        this.e.preventDefault()

        if (!this.tick) {
            this.raf = requestAnimationFrame(this.run)
            this.tick = true
        }
    },

    run: function () {
        var eType = this.e.type

        if (eType === 'wheel') {
            this.onWheel()
        } else if (eType === 'mousewheel') {
            this.onMouseWheel()
        } else if (eType === 'touchmove') {
            this.touchMove()
        }
    },

    onWheel: function () {
        this.type = 'scroll'
        this.delta = this.e.wheelDeltaY || this.e.deltaY * -1

        // deltamode === 1 -> wheel mouse, not touch pad
        // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
        if (S.Snif.isFirefox && this.e.deltaMode === 1) {
            this.delta *= 40
        }

        this.getCb()
    },

    onMouseWheel: function () {
        this.type = 'scroll'
        this.delta = (this.e.wheelDeltaY) ? this.e.wheelDeltaY : this.e.wheelDelta

        this.getCb()
    },

    touchStart: function (e) {
        this.start = e.targetTouches[0].pageY
    },

    touchMove: function () {
        this.type = 'touch'
        this.delta = this.e.targetTouches[0].pageY - this.start

        this.getCb()
    },

    getCb: function () {
        this.cb(this.delta, this.type, this.e)
        this.tick = false
    }

}

/*

S.WTP.on()
S.WTP.off()

*/

S.WTP = {
    p: function (e) {
        e.preventDefault()
    },

    l: function (action) {
        var t = S.Snif.isMobile ? 'touchmove' : 'mouseWheel'
        S.L(document, action, t, this.p, {passive: false})
    },

    on: function () {
        this.l('add')
    },

    off: function () {
        this.l('remove')
    }
}

/*

S.L(element, 'add', 'click', callback)

S.L(document, 'remove', 'touchmove', callback, {passive: false})

*/

S.L = function (el, action, type, cb, o) {
    var d = document
    var el = S.Selector.el(el)
    var elL = el.length
    var t

    if (type === 'mouseWheel') {
        t = 'onwheel' in d ? 'wheel' : d.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll'
    } else if (type === 'focusOut') {
        t = S.Snif.isFirefox ? 'blur' : 'focusout'
    } else {
        t = type
    }

    for (var i = 0; i < elL; i++) {
        el[i][action + 'EventListener'](t, cb, o)
    }
}

/*

const options = {
    totalH: element.offsetHeight,
    cb: afterTop
}

S.ScrollToTop(options)

*/

S.ScrollToTop = function (opts) {
    var currentPos = pageYOffset
    var scrollToOpts = {
        dest: 0,
        d: getDuration(),
        e: getEase(),
        cb: opts.cb
    }

    S.ScrollTo(scrollToOpts)

    function getDuration () {
        var coeff = S.Lerp.init(300, 1500, currentPos / opts.totalH)

        return currentPos === 0 ? 0 : coeff
    }

    function getEase () {
        var step = 500

        if (currentPos <= step * 5) {
            return 'Power' + Math.ceil(currentPos / step) + 'InOut'
        } else {
            return 'ExpoInOut'
        }
    }
}

/*

S.ScrollTo({
    dest: 1000,
    d: 200,
    e: 'Power3Out',
    cb: afterTop
})

*/

S.ScrollTo = function (opts) {
    var d = document
    var scrollNode = d.scrollingElement ? d.scrollingElement : S.Dom.body // Chrome v.61
    var scrollable = S.Snif.isFirefox || S.Snif.isIE ? d.documentElement : scrollNode
    var start = pageYOffset
    var end = opts.dest
    var r = 1000
    var anim = new S.Merom({d: opts.d, e: opts.e, update: upd, cb: getCb})

    if (start === end) {
        getCb()
    } else {
        S.WTP.on()
        anim.play()
    }

    function upd (v) {
        scrollable.scrollTop = Math.round(S.Lerp.init(start, end, v.progress) * r) / r
    }

    function getCb () {
        S.WTP.off()

        if (opts.cb) {
            opts.cb()
        }
    }
}

/*

►►►  Scroll immediatly to top

S.ScrollZero()

*/

S.ScrollZero = function () {
    window.scrollTo(0, 0)
}

/*

►►►  Scroll top when refresh browser

S.TopWhenRefresh()

*/

S.TopWhenRefresh = function () {
    window.onbeforeunload = function () {
        window.scrollTo(0, 0)
    }
}

/*

const winH = S.Win.h
const path = S.Win.path

*/

var perf = performance

S.Win = {
    get w () {
        return innerWidth
    },

    get h () {
        return innerHeight
    },

    get path () {
        return location.pathname
    },

    get hostname () {
        return location.hostname
    },

    get href () {
        return location.href
    }
}
