/**
 * Created by admin on 2016/7/9.
 */
var Segment = function (_pa, _pb) {//line segment
    this.pA = _pa;
    this.pB = _pb;
};
Segment.prototype.direction = function () {
    return new Vector(this.pB.x - this.pA.x, this.pB.y - this.pA.y);
};
//rays
var Ray = function (pos, dir) {
    this.position = new Vector(pos.x, pos.y);
    this.dir = new Vector(dir.x, dir.y);
    dir.norm();
};
Ray.prototype.intersect = function (Segment) {// find intersection to a segment and return it and length
    var pa = Segment.pA;
    var pb = Segment.pB;
    var dx = this.dir.x;
    var dy = this.dir.y;
    var x0 = this.position.x;
    var y0 = this.position.y;
    var s = (x0 * dy - y0 * dx - pb.x * dy + dx * pb.y) / ((pa.x - pb.x) * dy - (pa.y - pb.y) * dx);
    if (s < 0 || s > 1) {
        return null;
    }
    var t = (s * pa.x + (1 - s) * pb.x - x0) / dx;
    var x = s * pa.x + (1 - s) * pb.x;
    var y = s * pa.y + (1 - s) * pb.y;

    return t > 0 ? {x: x, y: y, t: t} : null;
};

Ray.prototype.intersectWithCircle = function (circle) {
    //the ray has two or one intersects with the circle
    //circle parameters radius and pos
    //first we should check the direction
    //the return parameter t>0
    var dx = this.position.x - circle.pos.x;
    var dy = this.position.y - circle.pos.y;
    var ax = this.dir.x, ay = this.dir.y;
    var c = dx * dx + dy * dy - circle.R * circle.R;
    var b = 2 * dx * ax + 2 * dy * ay;
    var delta = b * b - 4 * c;
    if (delta < 0 || b > 0) return null;
    var t1 = (-b - Math.sqrt(delta)) / 2;
    var t2 = (-b + Math.sqrt(delta)) / 2;
    var intersect = Math.abs(t1) > Math.abs(t2) ? this.position.add(this.dir.mul(t2)) : this.position.add(this.dir.mul(t1));
    return rs = {
        't': Math.min(Math.abs(t1), Math.abs(t2)),
        'x': intersect.x,
        'y': intersect.y
    };

};


var Path = function (width, controlPoints) {
    this.width = width;
    this.controlPoints = controlPoints;//
    this.segments = [];
};
Path.prototype.generate = function () {

};
Path.prototype.draw = function () {

};


var DotLen = 12, GapLen = 5;

//Road we build roads and draw it
var roadSeg = function (type, pA, pB, width, r, angle, dir) {
    //some control point start point A and end point B
    //road width ,for now width is set to constant Integer
    //type circle or line;only two types for now
    //angle means the angle from start point to end point
    //dir -->the direction of the start point if type is a circle
    //if r is greater than 0,the circle center is to right hand else to left hand
    this.start = new Vector(pA.x, pA.y);
    if (type == 'line')
        this.end = new Vector(pB.x, pB.y);

    if (type == 'line')
        this.dir = new Vector(this.end.x - this.start.x, this.end.y - this.start.y);
    else
        this.dir = dir;
    this.angle = angle;
    this.type = type;
    this.width = width;
    this.normalLeft = this.dir.getNormal();
    if (type == 'line') {
        //once we have road we should return for conners
        this.sl = this.start.add(this.normalLeft.mul(this.width / 2));
        this.sr = this.start.add(this.normalLeft.negative().mul(this.width / 2));
        this.el = this.end.add(this.normalLeft.mul(this.width / 2));
        this.er = this.start.add(this.normalLeft.negative().mul(this.width / 2));
    }
    if (this.type == 'circle') {
        this.r = r;
        //we have to get end point if this is a circle
        var _toCenter = this.dir.getNormal().negative();
        var center = this.start.add(_toCenter.mul(this.r));
        var _dir = _toCenter.negative();
        var _toEnd = _dir.rotate(this.angle);
        this.end = center.add(_toEnd.mul(this.r));
        var mid = this.start.add(this.end);
        mid.localDiv(2);
        var sAngle = this.start.minus(center).norm().negative();
        var eAngle = this.end.minus(center).norm().negative();
        this.sl = sAngle.mul(this.r - this.width / 2).add(center);
        this.sr = sAngle.mul(this.r + this.width / 2).add(center);
        this.el = eAngle.mul(this.r + this.width / 2).add(center);
        this.er = eAngle.mul(this.r - this.width / 2).add(center);
    } else {
        this.r = null;
    }

};

function drawDotLine_line(context, start, end) {
    context.strokeStyle = 'rgba(255,0,0,0.5)';
    var dist = new Vector(start.x - end.x, start.y - end.y).length();
    var part = Math.floor(dist / (DotLen + GapLen));
    var dir = new Vector(-start.x + end.x, -start.y + end.y).norm();
    var left = dist - part * (DotLen + GapLen);
    for (var i = 0; i <= part; i++) {
        var len = DotLen + GapLen;
        var xy = new Vector(start.x, start.y).add(dir.mul(len * i));
        context.beginPath();
        context.moveTo(xy.x, xy.y);
        var to = xy.add(dir.mul(DotLen));
        context.lineTo(to.x, to.y);
        context.stroke();
        context.closePath();
    }
    context.beginPath();
    context.moveTo(xy.x, xy.y);
    context.lineTo(end.x, end.y);
    context.closePath();
};

function drawDotLine_arc(context, start, end, center, r) {

    var angle = Math.asin(start.angleTo(end));
    var flag = angle < 0 ? -1 : 1;
    var part = Math.abs(angle) / (3 * Math.PI / 180);
    start = Math.atan2(start.y, start.x);
    if (start < 0) {
        start += Math.PI * 2;
        part = (Math.abs(angle + Math.PI)) / (3 * Math.PI / 180);
    }
    var step = (3 * Math.PI / 180);
    context.strokeStyle = 'rgba(255,0,0,0.2)';
    //for (var i = 0; i <= part; i++) {
    //    context.beginPath();
    //    context.arc(center.x, center.y, Math.abs(r), start + i * step*flag, start + i * step*flag + flag*step / 2, r<0);
    //    context.stroke();
    //    context.closePath();
    //}
    context.save();
    context.beginPath();
    context.arc(center.x, center.y, r, start, start + angle, false);
    context.stroke();
    context.closePath();
    context.restore();
}
roadSeg.prototype.getEndDir = function () {
    //return the direction of the end of the arc
    if (this.type == 'line') {
        return this.dir.norm();
    }
    var _toCenter = this.dir.getNormal().negative();
    var _dir = _toCenter.negative();
    var _toEnd = _dir.rotate(this.angle);
    return _toEnd.rightNorm();
};

roadSeg.prototype.draw = function (context) {
    if (this.type == 'line') {
        context.fillStyle = 'rgba(105,123,110,0.3)';
        var lefts = this.start.add(this.normalLeft.mul(this.width / 2));
        var lefte = this.end.add(this.normalLeft.mul(this.width / 2));
        var rights = this.start.add(this.normalLeft.negative().mul(this.width / 2));
        var righte = this.end.add(this.normalLeft.negative().mul(this.width / 2));
        context.beginPath();
        context.moveTo(lefts.x, lefts.y);
        context.lineTo(lefte.x, lefte.y);
        context.lineTo(righte.x, righte.y);
        context.lineTo(rights.x, rights.y);
        //context.lineTo(lefts.x, lefts.y);
        context.fill();
        context.closePath();
        context.beginPath();
        context.fillStyle = 'rgba(0,255,125,1)';
        context.arc(this.start.x, this.start.y, 2, 0, 2 * Math.PI, false);
        context.arc(this.end.x, this.end.y, 2, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();
        drawDotLine_line(context, this.start, this.end);
    }
    else if (this.type == 'circle') {
        //notice that we have the radius greater than width
        if (Math.abs(this.r) < this.width) {
            return false;
        }
        var mid = this.start.add(this.end);
        mid.localDiv(2);
        var _toCenter = this.dir.getNormal().negative();
        var center = this.start.add(_toCenter.mul(this.r));
        var sAngle = this.start.minus(center).norm().negative();
        var eAngle = this.end.minus(center).norm().negative();
        var anglestart = Math.atan2(sAngle.y, sAngle.x);
        var angleend = Math.atan2(eAngle.y, eAngle.x);
        var sAleft = sAngle.mul(this.r - this.width / 2).add(center);
        var sAright = sAngle.mul(this.r + this.width / 2).add(center);
        context.beginPath();
        context.fillStyle = 'rgba(0,0,125,0.5)';
        context.arc(this.start.x, this.start.y, 5, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(center.x, center.y, 5, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(this.end.x, this.end.y, 5, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
        var eAleft = eAngle.mul(this.r + this.width / 2).add(center);
        var eAright = eAngle.mul(this.r - this.width / 2).add(center);
        context.strokeStyle = 'rgba(105,123,110,0.5)';
        context.fillStyle = 'rgba(105,123,110,0.3)';
        context.beginPath();
        context.arc(center.x, center.y, Math.abs(this.r) + this.width / 2, anglestart, angleend, false);
        context.arc(center.x, center.y, Math.abs(this.r) - this.width / 2, angleend, anglestart, true);
        //context.stroke();

        context.closePath();
        context.fill();
        drawDotLine_line(context, this.start, center);
        drawDotLine_line(context, this.end, center);
        drawDotLine_arc(context, sAngle, eAngle, center, this.r);

    }
};
var Road = function (roads) {
    //A Road contains many road segments
    this.roads = [] || roads;
};
Road.prototype.draw = function (context) {
    for (var i = 0; i < this.roads.length; i++) {
        var road = this.roads[i];
        road.draw(context);
    }
};

Road.prototype.generateRoads = function (N) {
    var count = 0;
    var width = 40;
    //we generate N road segments and join it
    while (count < N) {
        var type = Math.random() > 0.4 ? 'line' : 'circle';//more lines
        if (count == 0) {
            if (type == 'line') {
                // a line  segment
                var start = new Vector(80, 150);
                var dir = (new Vector(1, Math.random() - 0.5)).norm();
                var len = Math.floor(150 + 40 * (Math.random() - 0.5));
                var end = start.add(dir.mul(len));
                this.roads.push(new roadSeg(type, start, end, width, 0));
            } else {
                start = new Vector(80, 150);
                var alpha = Math.floor((Math.random() - 0.5) * 60 + 60);
                var d = Math.floor(100 + Math.random() * 50);
                var R = Math.floor(d + 50 * Math.random());
                dir = new Vector(1, 0);
                var flag = Math.random() > 0.5 ? 1 : -1;
                var center = start.add(dir.mul(R));
                dir.rotate(d);
                end = start.add(dir.mul(d));
                this.roads.push(new roadSeg(type, start, end, width, R, alpha - 180, dir));
            }
        } else {
            var last = this.roads[count - 1];
            var now_type = Math.random() > 0.3 ? 'line' : 'circle';
            if (last.type == 'line') {

                if (now_type == 'line') {
                    start = last.end;
                    dir = last.dir.norm();
                    len = Math.floor(100 + 40 * (Math.random() - 0.5));
                    end = start.add(dir.mul(len));
                    this.roads.push(new roadSeg(now_type, start, end, width, 0));
                } else {
                    start = last.end;
                    dir = last.getEndDir();
                    flag = Math.random() > 0.3 ? 1 : -1;
                    var toCenter = last.normalLeft.mul(flag).norm();
                    R = Math.floor(width * 2 + 80 * Math.random());
                    alpha = Math.floor(Math.random() * 60 + 60);
                    end = null;
                    this.roads.push(new roadSeg(now_type, start, end, width, R, alpha - 180, dir));
                }
            } else {//last time we generate a arc
                if (now_type == 'line') {
                    start = last.end;
                    dir = last.getEndDir().negative();
                    len = Math.floor(100 + 40 * (Math.random() - 0.5));
                    end = start.add(dir.mul(len));
                    this.roads.push(new roadSeg(now_type, start, end, width, 0));
                } else {
                    start = last.end;
                    dir = last.getEndDir().negative();
                    toCenter = last.normalLeft.mul(flag).norm();
                    R = Math.floor(width * 2 + 80 * Math.random());
                    alpha = Math.floor(Math.random() * 60 + 60);
                    end = null;
                    this.roads.push(new roadSeg(now_type, start, end, width, R, alpha - 180, dir));
                }

            }
        }
        count++;
    }
};

Road.prototype.buildRoadWithCircleList = function (circle_list) {
    //we build the outer road with the circle list
    var LEN = circle_list.length;
    for (var i = 0; i < LEN; i++) {
        var p0 = circle_list[i];
        var p1 = circle_list[(i + 1) % LEN];
        var p2 = circle_list[(i + 2) % LEN];
        var p3 = circle_list[(i + 3) % LEN];
        var v1 = new Vector(p0.x - p1.x, p0.y - p1.y).norm().leftNorm();
        var v2 = new Vector(p1.x - p2.x, p1.y - p2.y).norm().leftNorm();
        var v3 = new Vector(p2.x - p3.x, p2.y - p3.y).norm().leftNorm();
        if (v1.minus(v2).length() < 1e-5) {
            //p0-p1 is a line

        }
    }
};

//return a dir in next point
function findNextDirection(pa, pb, dirA, type) {
    if (type == 'line') return dirA;
    if (type == 'circle') {
        dirA = dirA.norm();
        var mx = (pa.x + pb.x) / 2;
        var my = (pa.y + pb.y);
        var xab = pa.x - pb.x;
        var yab = pa.y - pb.y;
        var dx = dirA.x, dy = dir.y;
        var t = -2 * xab * yab / (dx * yab + dy * xab);
        var center = new Vector(pa.x, pa.y).add(dirA.mul(t));
        return new Vector(pb.x - center.x, pb.y - center.y).norm();
    }
}


//势函数模拟
//定义圆形的障碍物，他的势函数和1/(dist*dist)成反比，方向想法
//我们要给每一个障碍编号
var ObstacleCircle = function (pos, radius) {
    this.index=null;
    this.pos = pos;
    this.R = radius;
};

ObstacleCircle.prototype.draw = function (context) {
    context.fillStyle = 'rgba(255,0,255,0.5)';
    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.R, 0, Math.PI * 2, false);
    context.fill();
    context.closePath();
};

//build nodes with obstacles
function buildNodes(obstacles,ctx) {
    var node_list=[];
    for(i=0;i<obstacles.length;i++){
        var pa=obstacles[i].pos;
        var p1x=pa.x-obstacles[i].R*2;
        var p1y=pa.y-obstacles[i].R*2;
        var p2x=pa.x+obstacles[i].R*2;
        var p2y=pa.y+obstacles[i].R*2;
        var pax=pa.x,pay=pa.y;
        var _r=obstacles[i].R*2;
        for(var dd=0;dd<6;dd++){
            node_list.push(new Vector(pax+_r*Math.cos(Math.PI*dd/3),pay+_r*Math.sin(Math.PI*dd/3)));
        }
        /*
        node_list.push(new Vector(p1x,p1y));
        node_list.push(new Vector(p2x,p1y));
        node_list.push(new Vector(p2x,p2y));
        node_list.push(new Vector(p1x,p2y));
        */
        for(var k=0;k<obstacles.length;k++){
            var pb=obstacles[k].pos;
            var dist=distance(pa,pb);
            if(k!=i){
                if(dist<250){
                    if(dist-obstacles[i].R-obstacles[k].R>20){
                        var mid=new Vector((pa.x+pb.x)/2,(pb.y+pa.y)/2);
                        var ok=true;
                        for(var j=0;j<obstacles.length;j++){
                            if(distance(mid,obstacles[j].pos)-obstacles[j].R-10<0){
                                ok=false;
                            }
                        }
                        if(ok)
                        node_list.push(mid);
                    }
                }

            }
        }
    }
    var rs_list=[];
    //去掉所有在障碍物的点
    for(var i=0;i<node_list.length;i++){
        var na=node_list[i];
        var isok=true;
        for(var j=0;j<obstacles.length;j++){
            var nb=obstacles[j];
            if(distance(na,nb.pos)<nb.R+5){
                isok=false;
            }
        }
        if(isok){
            rs_list.push(na);
        }
    }
    //对剩下的点进行融合

    var visited=new Array(rs_list.length);
    var list=mergeNodes(rs_list,40);
    //list=mergeNodes(list,40);
    //var list=rs_list;

    /*    for(var i=0;i<rs_list.length;i++){
        if(!visited[i]){
            var l=new Vector(0,0);
            visited[i]=true;
            var count=0;
            for(var j=0;j<rs_list.length;j++){
                dist=distance(rs_list[i],rs_list[j]);
                if(dist<40){
                    visited[j]=true;
                    l.localAdd(rs_list[j]);
                    count++;
                }
            }
            if(count>0)
            {
                l.localDiv(count);

            }
            list.push(l);
        }

    }*/
    //ctx.save();
    //
    //ctx.fillStyle="rgba(0,255,0,0.6)";
    //for(var k=0;k<rs_list.length;k++){
    //    ctx.beginPath();
    //    ctx.arc(rs_list[k].x,rs_list[k].y,3,0,Math.PI*2,false);
    //    ctx.closePath();
    //    ctx.fill();
    //}
    //ctx.restore();
    //现在对这些点进行连接
    var edges={};
    var gnode={};
    var visit=new Array(list.length);
    ctx.strokeStyle='rgba(0,0,0,0.4)';
    for(var k=0;k<list.length;k++){
        if(!visit[k]){
            pa=list[k];
            for(var i=0;i<k;i++) {
                pb=list[i];
                if(distance(pa,pb)<150&&i!=k){
                    ok=true;
                    for(var j=0;j<obstacles.length;j++){
                        var cnd1=pointToLineDistance(pa,pb,obstacles[j].pos)<obstacles[j].R+10;
                        var cnd2=distance(pa,obstacles[j].pos)<100&&distance(pb,obstacles[j].pos)<100;
                        if(cnd1){
                            ok=false;
                        }
                    }
                    if(ok){
                        if(!edges[str2id(i,k)]) edges[str2id(i,k)]=distance(pa,pb);
                        if(!edges[str2id(k,i)]) edges[str2id(k,i)]=distance(pa,pb);

                        if(!gnode[k]){
                            gnode[k]=new gNode(k,pa);
                        }
                        if(!gnode[i]){
                            gnode[i]=new gNode(i,pb);
                        }
                        ctx.moveTo(pa.x,pa.y);
                        ctx.lineTo(pb.x,pb.y);
                        ctx.stroke();
                    }

                }
            }
        }

    }


    ctx.save();
    ctx.fillStyle="rgba(0,0,255,0.3)";
    for(var k=0;k<list.length;k++){
        ctx.beginPath();
        ctx.arc(list[k].x,list[k].y,6,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    return {
        'EDGES':edges,
        'NODES':gnode
    };
}


function mergeNodes(rs_list,range){
    var visited=new Array(rs_list.length);
    var list=[];
    for(var i=0;i<rs_list.length;i++){
        if(!visited[i]){
            var l=new Vector(0,0);
            visited[i]=true;
            var count=0;
            for(var j=0;j<rs_list.length;j++){
                var dist=distance(rs_list[i],rs_list[j]);
                if(dist<range){
                    visited[j]=true;
                    l.localAdd(rs_list[j]);
                    count++;
                }
            }
            if(count>0)
            {
                l.localDiv(count);

            }
            list.push(l);
        }

    }
    return list;
}

function isLineCrossObstacles(pa,pb,obstacles){
    var ok=false;
    for(var j=0;j<obstacles.length;j++){
        var cnd1=pointToLineDistance(pa,pb,obstacles[j].pos)<obstacles[j].R+15;
        var cnd2=distance(pa,obstacles[j].pos)<100&&distance(pb,obstacles[j].pos)<100;
        if(cnd1&&cnd2){
            ok=true;
        }
    }
    return ok;
}
var MAP={};
var EDGE_LIST=[];
function validLocation(pos,obstacles){
    for(var i=0;i<obstacles.length;i++){
        if(distance(pos,obstacles[i])<obstacles[i].R+10){
            return false;
        }
    }
    return true;
}

function generateNode(obstacles,x,y,SIZE){
    if(x>WIDTH-SIZE||x<SIZE||y<SIZE||y>HEIGHT-SIZE){
        return;
    }
    var x1=x-SIZE,x2=x+SIZE;
    var y1=y-SIZE,y2=y+SIZE;
    if(!MAP[str2id(x,y)]){

    }
}





var MAP_SHIP= function (obstacles) {
    this.obstacles=obstacles;
    this.node_list=[];//if we generate maps ,we get a list of graph node
    //so we can do path finding
};
