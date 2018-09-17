/**
 * Created by admin on 2016/7/6.
 */
var Vector = function (_x, _y) {
    this.x = _x;
    this.y = _y;
};
//distance
Vector.prototype.distanceSq = function () {
    return this.x * this.x + this.y * this.y;
};
//add
Vector.prototype.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y);//return a new vector
};
Vector.prototype.localAdd = function (v) {
    this.x += v.x;
    this.y += v.y;
};
//minus
Vector.prototype.minus = function (v) {
    return new Vector(-this.x + v.x, -this.y + v.y);//return a new vector
};
Vector.prototype.localMinus = function (v) {
    this.x = v.x - this.x;
    this.y = v.y - this.y;
};
//negative
Vector.prototype.negative = function (v) {
    return new Vector(-1 * this.x, -1 * this.y);
};
Vector.prototype.localNegative = function () {
    this.x *= -1;
    this.y *= -1;
};
//mul
Vector.prototype.mul = function (scale) {
    return new Vector(this.x * scale, this.y * scale);//return a new vector
};
Vector.prototype.localMul = function (scale) {
    this.x *= scale;
    this.y *= scale;
};
//div
Vector.prototype.div = function (scale) {
    return new Vector(this.x / scale, this.y / scale);//return a new vector
};
Vector.prototype.localDiv = function (scale) {
    this.x /= scale;
    this.y /= scale;
};
// Normalization
Vector.prototype.norm = function () {
    var dist = Math.sqrt(this.distanceSq());
    return new Vector(this.x / dist, this.y / dist);//return a new vector
};
Vector.prototype.localNorm = function () {
    var dist = Math.sqrt(this.distanceSq());
    if(dist<1e-7) return ;
    this.x /= dist;
    this.y /= dist;
};
//rotate   --->vector rotate
Vector.prototype.rotate = function (angle) {
    var radius = 2 * Math.PI * angle / 360;
    var x = this.x * Math.cos(radius) + this.y * Math.sin(radius);
    var y = this.x * Math.sin(radius) - this.y * Math.cos(radius);
    // console.log(x * x + y * y);
    return new Vector(x, y);
};
Vector.prototype.localRotate = function (angle) {
    this.x = this.x * Math.cos(radius) + this.y * Math.sin(radius);
    this.y = this.x * Math.sin(radius) - this.y * Math.cos(radius);
};
Vector.prototype.localLimit = function (limit) {
    if (this.distanceSq() >= limit * limit) {
        this.localNorm();
        this.localMul(limit);
    }
};
Vector.prototype.limit = function (limit) {
    if (this.distanceSq() > limit * limit) {
        return this.norm().mul(limit);
    }
};
Vector.prototype.length = function () {
    return Math.sqrt(this.distanceSq());
};
//-----------------------------------//
Vector.prototype.getNormal = function () { //return a right normal of a Vector
    return new Vector(this.y, -this.x).norm();//this will not use again
};
Vector.prototype.dot = function (v) {
    return this.x * v.x + this.y * v.y;
};
Vector.prototype.cross = function (v) {
    return this.x * v.y - this.y * v.x;
};
//------------------------------------//
Vector.prototype.angleTo = function (v) {//return angle between to vector
    var rs = v.y * this.x - this.y * v.x;
    return rs / (Math.sqrt(v.x * v.x + v.y * v.y) * Math.sqrt(this.x * this.x + this.y * this.y));
};

Vector.prototype.leftNorm = function () {
    return new Vector(-this.y, this.x).norm();
};
Vector.prototype.rightNorm = function () {
    return new Vector(this.y, -this.x).norm();
};


Vector.prototype.AngleWith = function (v) {// return angle between 2 vectors
    var rs = this.x * v.x + this.y * v.y;
    var ds1=Math.sqrt(v.x * v.x + v.y * v.y);
    var ds2=this.length();
    return Math.acos(rs/(ds1*ds2));
};


//Map function
function map(d, start, end, targetS, targetE) {
    return targetS + (d - start) * (targetE - targetS) / (end - start);
}

function area(p,pa,pb){
    var v1=new Vector(pa.x- p.x,pa.y- p.y);
    var v2=new Vector(pb.x- p.x,pb.y- p.y);
    return Math.abs(v1.length()*v2.length()*Math.sin(v1.AngleWith(v2)));
}