/**
 * Created by admin on 2016/7/17.
 */


var AABB = function (pos, width, height) {
    this.pos = pos;
    this.w = width;
    this.h = height;
};
//check if the AABB contains a point
AABB.prototype.contains = function (point) {
    if (this.pos.x < point.x && this.pos.x + this.w > point.x) {
        if (this.pos.y < point.y && this.pos.y + this.w > point.y) {
            return true;
        }
    }
    return false;
};
//check if AABB intersect with another AABB
AABB.prototype.intersect = function (boundary) {
    return this.contains(boundary.pos) && boundary.contains(this.pos);
};

var QuadTree = function (boundary) {
    this.bounary = boundary;
    this.objects = [];
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
    this.CAPACITY=3;
};
//split the current boundary into 4 part nw,ne,sw,se
QuadTree.prototype.split = function () {
    var _pos = this.bounary.pos;
    var x = _pos.x, y = _pos.y;
    var w = this.w / 2, h = this.h / 2;
    this.nw = new QuadTree(new AABB({x: x, y: y}, w, h));
    this.ne = new QuadTree(new AABB({x: x + w, y: y}, w, h));
    this.sw = new QuadTree(new AABB({x: x, y: y + h}, w, h));
    this.se = new QuadTree(new AABB({x: x + w, y: y + h}, w, h));
};
//suppose each data has a position information
QuadTree.prototype.insert = function (obj) {
    //check if the obj in this boundary
    if(!this.bounary.contains(obj.pos)){
        return false;
    }
    //how many objects we want to keep in this boundary
    if(this.objects.length<=this.CAPACITY){
        this.objects.push(obj);
        return true;
    }
    // departed?
    if(this.nw==null){
        this.split();
    }
    if(this.nw.insert(obj)) return true;
    if(this.ne.insert(obj)) return true;
    if(this.sw.insert(obj)) return true;
    if(this.se.insert(obj)) return true;
    return false;
};
QuadTree.prototype.queryRange= function (aabb) {
    var retObj=[];
    //if we don't intersect return []
    if(!this.bounary.intersect(aabb)){
        return retObj;
    }
    for(var i=0;i<this.objects.length;i++){
        retObj.push(this.objects[i]);
    }
    var tmp=this.nw.queryRange(aabb);
    retObj.concat(tmp);
    tmp=this.ne.queryRange(aabb);
    retObj.concat(tmp);
    tmp=this.sw.queryRange(aabb);
    retObj.concat(tmp);
    tmp=this.se.queryRange(aabb);
    retObj.concat(tmp);
    return retObj;
};