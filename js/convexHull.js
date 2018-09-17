/**
 * Created by admin on 2016/7/19.
 */

var Point = function (_x, _y) {
    this.x = _x || 0;
    this.y = _y || 0;
};

Point.prototype.draw = function (context, color) {
    if (color)
        context.fillStyle = color;
    else
        context.fillStyle = 'rgba(255,0,255,0.7)';
    context.beginPath();
    context.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
    context.fill();
    context.closePath();
};

Point.prototype.generate = function (N) {
    var plist = [];
    for (var i = 0; i < N; i++) {
        plist.push(new Point(Math.floor(100 + Math.random() * 600), Math.floor(100 + Math.random() * 300)));
    }
    return plist;
};

var ConvexHull = function (plist, ctx) {
    this.plist = plist;
    this.hull = [];
    this.context = ctx;
};

ConvexHull.prototype.incrementalHull = function () {
    var list = this.plist;
    var circle_list=[];
    //maintain a circle list for the hull
    //we search all the point find if this point will enlarge this convex hull
    //if yes, add this point into circle list
    circle_list.push(list[0]);
    circle_list.push(list[1]);
    circle_list.push(list[2]);
    //we start with a triangle
    for(var i=3;i<list.length;i++){
        if(!insidePolygon(list[i],circle_list)){
            //找到凸包的切线
            var p=[];
            for(var j=0;j<circle_list.length;j++){
                //找切点
                var pre=circle_list[(i-1)%circle_list.length];
                var now=circle_list[i];
                var next=circle_list[(i+1)%circle_list.length];
                if(distanceToSegment(list[i],now,pre)*distanceToSegment(list[i],now,next)>0){
                    p.push(j);
                }
            }
            //suppose we find a
            var s=(p[0]+1)%circle_list.length,e=(p[1]+1)%circle_list.length;
            if(s>e){
                var tmp=s;
                s=e;
                e=tmp;
            }
        }
    }
};
//check if this point inside a Polygon
//1、面积法
//2、内角和为360度
//3、求平行于射线交点的否为奇数个
function insidePolygon(p,list){
    //3
    var count=0;
    for(var i=0;i<list.length;i++){
        var p0=list[i];
        var p1=list[(i+1)%list.length];
        var slope=(p1.y-p0.y)/(p1.x-p0.x);
        var cond1= p.x>=p0.x&& p.x<=p1.x;
        var cond2= p.x>=p1.x&& p.x<=p0.x;
        var s= p.y<slope*(p.x-p0.x)+p0.y;
        if(cond1||cond2&&s) count++;
    }
    //2
    var angle=0;
    for(i=0;i<list.length;i++){
        var pp0=list[i];
        var pp1=list[(i+1)%list.length];
        var v2=new Vector(pp0.x- p.x,pp0.y- p.y);
        var v1=new Vector(pp1.x- p.x,pp1.y- p.y);
        angle+=v1.AngleWith(v2);
    }
    console.log(angle);
    return count%2==1;
    //1
}



ConvexHull.prototype.QuickHull = function () {
    //QuickHull算法的思想是：分治算法
    var list = this.plist;
    list = list.sort(function (a, b) {
        return a.x - b.x;
    });
    var p0 = list[0];
    var p1 = list[list.length - 1];
    p0.draw(this.context, '#FFFF00');
    p1.draw(this.context, '#000');
    this.context.beginPath();
    this.context.moveTo(p0.x, p0.y);
    this.context.lineTo(p1.x, p1.y);
    this.context.stroke();
    this.context.closePath();
    var ulist = [], dlist = [];
    for (var i = 1; i < list.length - 1; i++) {
        var dist = distanceToSegment(list[i], p0, p1);
        if (dist > 0) {
            ulist.push(list[i]);
        } else if (dist < 0) {
            dlist.push(list[i]);
        }
        if (dist > 0)
            list[i].draw(this.context, 'rgba(0,255,128,0.7)');
        else
            list[i].draw(this.context);
    }
    var uconvex_list = [];
    var dconvex_list = [];
    uconvex_list.push(p0);
    quickHull(p0, p1, ulist, uconvex_list);
    uconvex_list.sort(function (a, b) {
        return a.x - b.x;
    });
    dconvex_list.push(p1);
    quickHull(p1, p0, dlist, dconvex_list);
    dconvex_list.sort(function (a, b) {
        return b.x - a.x;
    });
    this.hull = uconvex_list.concat(dconvex_list);
    this.hull.push(p0);

};
function quickHull(pA, pB, list, rs_list) {
    //if (list.length == 0) return [pA, pB];
    var llist = [], rlist = [], index = -1;
    var maxdist = 0;
    //find the max distance from the line to the point
    for (var i = 0; i < list.length; i++) {
        var dist = distanceToSegment(list[i], pA, pB);
        if (dist > maxdist) {
            maxdist = dist;
            index = i;
        }
    }
    //we find the max point,divide it into two three part
    if (index != -1)
        for (i = 0; i < list.length; i++) {
            dist = distanceToSegment(list[i], pA, list[index]);
            if (dist > 0) llist.push(list[i]);
            dist = distanceToSegment(list[i], list[index], pB);
            if (dist > 0) rlist.push(list[i]);
        }
    else return;
    //list[index] is convex vertex
    //if ((rlist.length == 0 || llist.length == 0)) {
    //    rs_list.push(list[index]);
    //}
    rs_list.push(list[index]);
    if (llist.length > 0)
        quickHull(pA, list[index], llist, rs_list);
    if (rlist.length > 0)
        quickHull(list[index], pB, rlist, rs_list);


}
function distanceToSegment(p, pa, pb) { // cal the distance from p to the line pa-pb
    if (p.x == pa.x && p.y == pa.y) return 0;
    if (p.x == pb.x && p.y == pb.y) return 0;
    var vap = new Vector(p.x - pa.x, p.y - pa.y);
    var vab = new Vector(pb.x - pa.x, pb.y - pa.y);

    var flag = vab.cross(vap) > 0 ? -1 : 1;
    var len = vap.length();
    return flag * len * Math.sin(vab.AngleWith(vap));

}


ConvexHull.prototype.draw = function (context) {
    if (this.hull.length > 0) {
        var LEN = this.hull.length;
        context.strokeStyle = 'rgba(255,0,0,0.5)';
        for (var i = 0; i < LEN - 1; i++) {
            var p = this.hull[i];

            var p1 = this.hull[(i + 1) % LEN];
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(p1.x, p1.y);
            context.fillStyle='#ff0';
            context.fillText('('+ p.x+','+ p.y+')', p.x, p.y);
            context.stroke();
            context.closePath();
        }
    }
};
function AndrewSide(list) {
    var stack = [];
    stack.push(list[0]);
    stack.push(list[1]);
    list = list.slice(2);
    var len = 2;
    var pb = stack[0], pc = stack[1];
    while (list.length > 0) {
        len = stack.length;
        var p = list[0];
        while (antiClockwise(pb, pc, p) <= 0) {
            stack.pop();
            if (stack.length == 1) {
                break;
            }
            //console.log(stack.length);
            pc = stack[stack.length - 1];
            pb = stack[stack.length - 2];
        }
        stack.push(p);
        list = list.slice(1);
        pc = stack[stack.length - 1];
        pb = stack[stack.length - 2];
    }
    return stack;
}
ConvexHull.prototype.Andrew = function () {
    var list = this.plist;
    list = list.sort(function (a, b) {
        return a.x - b.x;
    });
    var stack = AndrewSide(list);
    this.hull = this.hull.concat(stack);
    list = list.reverse();
    stack = AndrewSide(list);
    this.hull = this.hull.concat(stack);
};


ConvexHull.prototype.giftWrapping = function () {
    var list = this.plist;
    var max_y = list[0].y;
    var mp = 0;
    var visit = new Array(list.length);
    //find the max_y point
    for (var i = 0; i < list.length; i++) {
        if (list[i].y > max_y) {
            max_y = list[i].y;
            mp = i;
        }
    }
    //search the convex hull
    this.hull.push(list[mp]);
    visit[mp] = true;
    var now = list[mp];
    var next = null;
    var start = list[mp];
    while (start != next) {
        var Clock_max = -100000000;
        var index = -1;
        now = this.hull[this.hull.length - 1];
        for (i = 0; i < list.length; i++) {
            var p = this.hull.length > 2 ? this.hull[this.hull.length - 2] : new Point(now.x + 1, now.y);
            var Clock = cross(now, p, list[i]);
            if (Clock_max < Clock) {
                Clock_max = Clock;
                index = i;
            }
        }
        if (index != -1) {
            next = list[index];
            this.hull.push(list[index]);
        }
    }


};

function antiClockwise(pa, pb, pc) {
    var v1 = new Vector(pb.x - pa.x, pb.y - pa.y);//pb-pa
    var v2 = new Vector(pc.x - pb.x, pc.y - pb.y);
    var rs = v1.cross(v2);
    return rs;
}
function cross(p, pa, pb) {
    var v1 = new Vector(pa.x - p.x, pa.y - p.y).norm();
    var v2 = new Vector(pb.x - p.x, pb.y - p.y).norm();
    return v1.AngleWith(v2);
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function main() {
    var plist = new Point().generate(250);
    var convex = new ConvexHull(plist, ctx);
    //convex.QuickHull();
    convex.Andrew(plist);
    for (var i = 0; i < plist.length; i++) {
        plist[i].draw(ctx);
        //ctx.fillStyle = '#000';
        //ctx.fillText(plist[i].x + ',' + plist[i].y, plist[i].x, plist[i].y);
    }
    //convex.giftWrapping();
    //console.log(convex.hull);
    convex.draw(ctx);
}

main();
//function test(){
//    var list=[new Point(100,500),new Point(300,360),new Point(250,300),
//        new Point(200,270),new Point(80,290),new Point(60,350)];
//    var v1=new Vector(1,0);
//    for(var i=1;i<list.length;i++){
//        var v2=new Vector(list[i].x-list[0].x,list[i].y-list[0].y).norm();
//        console.log(v1.AngleWith(v2),'==== '+list[i].x+','+list[i].y);
//    }
//
//}
//
//test();