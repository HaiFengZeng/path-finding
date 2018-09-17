/**
 * Created by admin on 2016/7/29.
 */
function randInt(a, b) {
    //return int between a and b,a<b
    //if b is null return random int between 0-a
    if (b == null) return Math.floor(Math.random() * a);
    return Math.floor(a + Math.random() * (b - a));
}
//generate a random 2D vector
function rand2D() {
    var a = Math.random() - 0.5;
    var b = Math.random() - 0.5;
    var v = new Vector(a, b);
    v.localNorm();
    return v;
}
function sqrt(x) {
    if (x > 0) {
        return Math.sqrt(x);
    }
}
function cos(x) {
    return Math.cos(x);
}
function sin(x) {
    return Math.sin(x);
}
function floor(x) {
    return Math.floor(x);
}

function pointToLineDistance(pa, pb, p) {

    var dir = new Vector(p.x - pa.x, p.y - pa.y);
    var p_dir = new Vector(pb.x - pa.x, pb.y - pa.y).norm();
    var t = dir.dot(p_dir);
    if (t < 0 || t > distance(pa, pb)) return 10000;
    return Math.sqrt(Math.abs(dir.distanceSq() - t * t));
}

function pointProjectToLine(pa, pa_dir, pb) {
    var dx = pb.x - pa.x, dy = pb.y - pa.y;
    var dir = pa_dir.norm();
    var t = dir.x * dx + dir.y * dy;
    return pa.add(dir.mul(t));
}

function distance(pa, pb) {
    return Math.sqrt((pa.x - pb.x) * (pa.x - pb.x) + (pa.y - pb.y) * (pa.y - pb.y));
}

function LinePointWithParameter(pa, dir, t) {
    var d = new Vector(dir.x, dir.y).norm();
    return new Vector(pa.x, pa.y).add(d.mul(t));
}

function str2id(x, y) {
    return x.toString() + '_' + y.toString();
}
function pointToLineDistance1(pa, pb, p) {
    var dir = new Vector(pb.x - pa.x, pb.y - pa.y).norm();
    var dx = p.x - pa.x, dy = p.y - pa.y;
    var t = dir.x * dx + dir.y * dy;
    if (t > distance(pa, pb) || t < 0) {
        return 10000;
    } else
        return pointToLineDistance(pa, dir, p);
}
//given the point a and b and the direction in pa,return the center of the circle
//s->start radius ;e->end radius
function getCenter(pa, pb, dirA,index) {
    var m = new Vector((pa.x + pb.x) / 2, (pa.y + pb.y) / 2);
    var ab = pa.minus(pb);
    var d1 = ab.getNormal();
    var d2 = dirA.getNormal();
    var t1 = (m.x * d1.y - m.y * d1.x + pa.y * d1.x - pa.x * d1.y) / (d2.x * d1.y - d1.x * d2.y);
    var center = pa.add(d2.mul(t1));
    var s = Math.atan2(pa.x - center.x, pa.y - center.y);
    var e = Math.atan2(pb.x - center.x, pb.y - center.y);
    s = atan2ToRadius(s);
    e = atan2ToRadius(e);
    var flag=index%2==0?1:-1;
    var db = new Vector(pb.x - center.x, pb.y - center.y).getNormal().negative();
    if(t1>0) db=db.negative();
    return {
        's': s,
        'e': e,
        'R': distance(pa, center),
        'c': center,
        't': t1,
        'dirB': db
    };
}


function atan2ToRadius(x) {
    var PI = Math.PI;
    if (x < PI / 2 && x > 0) x = PI / 2 - x;
    else if (x >= PI / 2 && x <= PI)   x = 5 * PI / 2 - x;
    else if (x < 0 && x > -PI / 2) x = PI / 2 - x;
    else if (x >= -PI && x < -PI / 2) x = PI / 2 - x;
    return x;
}