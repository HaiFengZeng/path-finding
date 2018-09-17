/**
 * Created by admin on 2016/8/19.
 */
var roadBase = function (type, width, pa, pb, dirA) {
    this.type = type;
    this.width = width;
    this.pa = pa;
    this.pb = pb;
    this.dirA = dirA;
    this.dirB = null;
    if (this.type == 'line') {
        this.dirA = new Vector(this.pb.x - this.pa.x, this.pb.y - this.pa.y).norm();
    }
};

roadBase.prototype.draw = function (context,index) {
    if (this.type == 'line') {
        var normLeft = this.dirA.getNormal();
        context.fillStyle = 'rgba(105,123,110,0.3)';
        var lefts = this.pa.add(normLeft.mul(this.width));
        var lefte = this.pb.add(normLeft.mul(this.width));
        var rights = this.pa.add(normLeft.negative().mul(this.width));
        var righte = this.pb.add(normLeft.negative().mul(this.width));
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
        context.arc(this.pa.x, this.pa.y, 2, 0, 2 * Math.PI, false);
        context.arc(this.pb.x, this.pb.y, 2, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();
        drawDotLine_line(context, this.pa, this.pb);
    } else if (this.type == 'circle') {
        //we need to find circle center
        var ab=new Vector(this.pb.x-this.pa.x,this.pb.y-this.pa.y);
        var rs = getCenter(this.pa, this.pb, this.dirA);
        var ca = new Vector(this.pa.x - rs.c.x, this.pa.y - rs.c.y).norm();
        var cb = new Vector(this.pb.x - rs.c.x, this.pb.y - rs.c.y).norm();
        var flag = false;
        if (rs.t > 0) flag = true;
        var d = this.width;
        var al = this.pa.add(ca.mul(d)), ar = this.pa.add(ca.mul(-d));
        var bl = this.pb.add(cb.mul(d)), br = this.pb.add(cb.mul(-d));
        var m=new Vector((this.pa.x+this.pb.x)/2,(this.pa.y+this.pb.y)/2);
        var cm= new Vector(m.x-rs.c.x, m.y-rs.c.y);
        var cmd=atan2ToRadius(Math.atan2(cm.x,cm.y));
        //var ook=cmd>rs.s&&cmd<rs.e;
        //var da = this.pa.add(this.dirA.mul(-10));
        var db = this.pa.add(this.dirA.mul(90));
        context.save();
        context.strokeStyle = 'rgba(0,0,255,0.5)';
        //context.moveTo(this.pa.x, this.pa.y);
        //context.lineTo(db.x, db.y);
        //context.arc(rs.c.x, rs.c.y, rs.R , rs.e, rs.s, ok);
        context.stroke();
        context.beginPath();
        context.fillStyle = 'rgba(105,123,110,0.3)';
        var ok = rs.s < rs.e;
        //var r=ab.dot(rs.dirB)>0&&ab.dot(this.dirA)>0;
        var r=this.dirA.dot(ca.getNormal())<0;
        if(r){
            context.arc(rs.c.x, rs.c.y, rs.R + this.width, rs.s, rs.e, false);
            context.lineTo(br.x, br.y);
            context.arc(rs.c.x, rs.c.y, rs.R - this.width, rs.e, rs.s, true);
        }
        else{
            context.arc(rs.c.x, rs.c.y, rs.R + this.width, rs.e, rs.s, false);
            context.lineTo(al.x, al.y);
            context.arc(rs.c.x, rs.c.y, rs.R - this.width, rs.s, rs.e, true);
        }

        context.fill();
        context.closePath();
        drawDotLine_line(context, this.pa, rs.c);
        drawDotLine_line(context, this.pb, rs.c);
        context.restore();
    }
};


var RoadPath = function () {
    this.roadList = [];
    this.circle_list=[];
};
//build a road with a circle list

RoadPath.prototype.setup = function (circleList) {
    var p0_dir = rand2D();
    this.circle_list=circleList;
    for (var i = 0; i < circleList.length - 1; i++) {
        var pa = circleList[i];
        var pb = circleList[i + 1];
        var ab = new Vector(pb.x - pa.x, pb.y - pa.y);
        var type = 'circle';
        if (Math.abs(ab.cross(p0_dir)) < 1E-3) {
            type = 'line';
        }
        this.roadList.push(new roadBase(type, 20, pa, pb, p0_dir));
        var rs = getCenter(pa, pb, p0_dir,i);
        if (type != 'line')
            p0_dir = rs.dirB;
        else p0_dir = ab.norm();
    }

};
RoadPath.prototype.draw = function (context) {

    if (this.roadList) {
        for (var i = 0; i < this.roadList.length; i++) {
            context.beginPath();
            this.roadList[i].draw(context,i);
            context.closePath();
        }
    }
};
RoadPath.prototype.connectFirstAndLast= function () {
    var pn=this.roadList[this.roadList.length-1];
    var p0=this.roadList[0];
};