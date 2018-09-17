/**
 * Created by admin on 2016/7/7.
 */

var WIDTH = 1124;
var HEIGHT = 640;


var MyShip = function (x, y, scale, color) {
    this.location = new Vector(x, y);   //vector location
    this.speed = new Vector(-0.1, -0.2);     //vector speed
    this.acceleration = new Vector(0, 0);
    this.scale = scale;
    this.maxSpeed = 4;                    //speed limit
    this.mass = 1;
    this.maxForce = 0.01;
    this.color = color;
    this.rayRange = 120;
    this.Rays = [];
    this.Radius = 10;
    this.dna = null;
    this.recordPath = [];
    this.RaysScan = [];
    //dna

};
MyShip.prototype.move = function () {
    this.speed.localAdd(this.acceleration);
    var speed = Math.sqrt(this.speed.distanceSq());
    if (speed > (Math.sqrt(this.maxSpeed))) {
        this.speed.localNorm();
        this.speed.localMul(Math.sqrt(this.maxSpeed));
    }
    this.location.localAdd(this.speed);
    /*to draw the path */
    this.recordPath.push(new Vector(this.location.x, this.location.y));
    if (this.recordPath.length > 1000) {
        this.recordPath = this.recordPath.slice(this.recordPath.length - 1000);
    }
    this.acceleration.localMul(0);
};

MyShip.prototype.drawShip = function (canvas, context, fillstyle) {
    // context.arc(this.location.x,this.location.y,10,0,Math.PI*2,false);
    context.save();
    var angle = Math.atan2(this.speed.y, this.speed.x);
    context.fillStyle = this.color;
    context.beginPath();
    var location = this.location.rotate(angle);
    context.translate(this.location.x, this.location.y);
    context.rotate(angle + Math.PI / 2);
    context.moveTo(0, -10);
    context.lineTo(-8, 6);
    context.lineTo(8, 6);
    context.lineTo(0, -10);
    context.fill();
    context.closePath();
    context.beginPath();
    context.strokeStyle = '#00ff00';
    context.arc(0, 0, 10, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
    context.beginPath();
    context.fillStyle = fillstyle || '#ff3322';
    context.rect(3, 6, 3, 4);
    context.rect(-6, 6, 3, 4);
    context.fill();
    context.closePath();
    context.restore();

};
MyShip.prototype.setRays = function (R, rayType) {// R means the length of the ray,maybe we can use it
    this.Rays = [];
    var flag = this.speed.y * this.speed.x > 0 ? 1 : -1;
    var start = Math.atan2(this.speed.y, this.speed.x);
    var angle = 180 * start / Math.PI;

    var rayNum = 20;
    var step = this.rayRange / rayNum;
    var startAngle = angle - this.rayRange / 2;
    for (var i = 0; i <= rayNum; i++) {
        var radius = (startAngle + step * i) * Math.PI / 180;
        var dir = new Vector(Math.cos(radius), Math.sin(radius));
        var ray = new Ray(this.location, dir);
        this.Rays.push(ray);
    }
};

MyShip.prototype.rayCasting = function (segments, obstacles) {
    var rs_list = new Array(this.Rays.length);
    //for now we just ray caste all segments to find all intersections and return a list for debug
    for (var i = 0; i < this.Rays.length; i++) {
        var Near;
        var nearest = 10000000;
        for (var seg = 0; seg < segments.length; seg++) {
            var ray = this.Rays[i];
            var rs = ray.intersect(segments[seg]);
            if (rs_list[i]) {
                if (rs && Math.abs(rs_list[i].t) > Math.abs(rs.t)) {
                    rs_list[i] = rs;
                }
            } else {
                rs_list[i] = rs;
            }
            /*
             if (rs) {
             if (Math.abs(rs.t) < nearest ) {
             nearest = Math.abs(rs.t);
             Near = rs;
             }
             }*/
        }
        //rs_list.push(Near);
    }
    if (obstacles) {
        for (var j = 0; j < this.Rays.length; j++) {
            nearest = 10000000;
            for (i = 0; i < obstacles.length; i++) {
                rs = this.Rays[j].intersectWithCircle(obstacles[i]);
                /*if (rs != null) {
                 if (Math.abs(rs.t) < nearest) {
                 nearest = Math.abs(rs.t);
                 Near = rs;
                 }
                 }*/
                if (rs_list[j]) {
                    if (rs && Math.abs(rs_list[j].t) > Math.abs(rs.t)) {
                        rs_list[j] = rs;
                    }
                } else {
                    rs_list[j] = rs;
                }
            }
            //rs_list.push(Near);
        }
    }
    this.RaysScan = rs_list;
    return rs_list;
};
MyShip.prototype.drawRayCasting = function (context, intersects) {

    //we generate our rays
    var flag = this.speed.y * this.speed.x > 0 ? 1 : -1;
    var start = Math.atan2(this.speed.y, this.speed.x);
    var angle = 180 * start / Math.PI;

    var s = (angle - this.rayRange / 2) * Math.PI / 180;
    var e = (angle + this.rayRange / 2) * Math.PI / 180;
    // context.save();
    // context.fillStyle = 'rgba(255,126,120,0.5)';
    // context.arc(this.location.x, this.location.y, 200, s, e, false);
    // context.fill();
    // context.restore();
    // context.beginPath();
    context.strokeStyle = 'rgba(125,122,12,1)';
    for (var i = 0; i < intersects.length; i++) {
        var rs = intersects[i];
        if (rs) {
            context.moveTo(this.location.x, this.location.y);
            context.lineTo(rs.x, rs.y);
        }
    }
    // context.closePath();
    context.stroke();
};
MyShip.prototype.applyForce = function (force) {
    force.localDiv(this.mass);
    this.acceleration.localAdd(force);
};

MyShip.prototype.arrive = function (target) {//target is a Vector
    var toTarget = this.location.minus(target);
    toTarget.localNorm();
    var r = Math.sqrt(this.location.minus(target).distanceSq());
    //console.log(r);
    if (r > 50) {
        toTarget.localMul(Math.sqrt(this.maxSpeed));
    } else {
        var desired = map(r, 0, 100, 0, this.maxSpeed);
        toTarget.localMul(desired);
    }
    //toTarget.localNegative();
    var steer = this.speed.minus(toTarget);
    steer.localLimit(Math.sqrt(this.maxForce));
    this.applyForce(steer);
};
MyShip.prototype.recordTrace = function (context) {
    context.strokeStyle = 'rgba(255,0,0,0.5)';

    for (var i = 0; i < this.recordPath.length - 1; i++) {
        var Pos_i = this.recordPath[i];
        var Pos_next = this.recordPath[i + 1];
        context.beginPath();
        context.moveTo(Pos_i.x, Pos_i.y);
        context.lineTo(Pos_next.x, Pos_next.y);
        context.stroke();
        context.closePath();
    }

};

MyShip.prototype.chase = function (target) {

    var toTarget = this.location.minus(target);
    toTarget.localNorm();
    toTarget.localMul(this.maxSpeed);
    var steer = this.speed.minus(toTarget);
    steer.localLimit(this.maxForce);
    this.applyForce(steer);
};

MyShip.prototype.followPath = function (targets, context, flag) {
    if (!targets || targets.length <= 1) return;
    //target array :a list list form a circle
    //we hope to follow the path, suppose we are in the current target ,if we are arrive it set next target
    //find which path the ship in
    var pos = this.location;
    var min_dis = 1000000;
    var index = -1;

    for (var i = 0; i < targets.length - 1; i++) {
        var index1 = (i);
        var index2 = (i + 1);
        var pa = targets[index1];
        var pb = targets[index2];
        var ab = new Vector(pb.x - pa.x, pb.y - pa.y).norm();
        var dist = pointToLineDistance(pa, pb, pos);
        if (min_dis >= dist) {
            min_dis = dist;
            index = i;
        }

    }
    if (index < targets.length - 1) {
        pa = targets[index];
        pb = targets[index + 1];
    }
    var Rsp = targets[targets.length - 1];
    ab = new Vector(pb.x - pa.x, pb.y - pa.y).norm();
    var predict_location = this.location.add(this.speed.norm().mul(5));
    if (distance(Rsp, this.location) < 10 && flag) {
        flag = 1;
        this.arrive(Rsp);
        return;
    }

    if (predict_location.x > pb.x || predict_location.x < pa.x) {
        predict_location = pb;
    }
    if (distance(pos, pb) < 10) {
        pa = targets[(index + 1) % targets.length];
        pb = targets[(index + 2) % targets.length];
        ab = new Vector(pb.x - pa.x, pb.y - pa.y).norm();
        predict_location = LinePointWithParameter(pa, ab, 5);
        context.beginPath();
        context.strokeStyle = 'rgba(255,0,255,0.4)';
        context.arc(predict_location.x, predict_location.y, 4, 0, Math.PI * 2, false);
        context.closePath();
        context.stroke();
        this.chase(predict_location);
        return;
    }
    context.beginPath();
    context.strokeStyle = 'rgba(0,0,255,0.4)';
    context.arc(predict_location.x, predict_location.y, 4, 0, Math.PI * 2, false);
    context.closePath();
    context.stroke();
    var pTarget = pointProjectToLine(pa, ab, predict_location);
    this.chase(pTarget);

};
MyShip.prototype.flee = function (target) {
    var toTarget = this.location.minus(target);
    toTarget.localNorm();
    var r = Math.sqrt(this.location.minus(target).distanceSq());

    toTarget.localMul(Math.sqrt(this.maxSpeed));
    //toTarget.localNegative();
    var steer = this.speed.minus(toTarget);
    steer.localLimit(Math.sqrt(this.maxForce));
    steer.localNegative();
    //this.applyForce(steer);
    return steer;
};
MyShip.prototype.slowdown = function (speed) {
    if (this.speed.length() > speed) {
        this.speed.localNorm();
        this.speed.localMul(sqr(speed));
    }
};
MyShip.prototype.avoidWalls = function () {
    //MAX GAP 30
    var GAP = 100;
    var steer = null;
    if (this.location.x < GAP || this.location.x > WIDTH - GAP) {
        if (this.location.y < GAP) {
            this.flee(new Vector(0, 0));
        } else
            this.flee(new Vector(0, this.location.y));
        if (this.location.x > WIDTH - GAP) {
            if (this.location.y < GAP) {
                this.flee(new Vector(WIDTH, 0));
            } else
                this.flee(new Vector(WIDTH, this.location.y));
        }

    }
    if (this.location.y < GAP || this.location.y > HEIGHT - GAP) {

        this.flee(new Vector(this.location.x, 0));
        if (this.location.y > HEIGHT - GAP) {
            if (this.location.x < GAP) {
                this.flee(new Vector(0, HEIGHT));
            } else if (this.location.x > WIDTH - GAP) {
                this.flee(new Vector(WIDTH, HEIGHT));
            } else
                this.flee(new Vector(this.location.x, HEIGHT));
        }

    }


};


MyShip.prototype.collisionToShip = function (ship) {
    var mx = this.location.x, my = this.location.y;
    var sx = ship.location.x, sy = ship.location.y;
    var vx1 = new Vector(mx, my);
    var vx2 = new Vector(sx, sy);
    return vx1.minus(vx2).length() > (this.Radius + ship.Radius);
};
MyShip.prototype.collisionToWalls = function (seg) {
    var dir = seg.direction.norm();
    var dx = seg.pA.x - this.location.x;
    var dy = seg.pA.y - this.location.y;
    var d = dx * dx + dy * dy - this.Radius * this.Radius;
    var b = 2 * (dir.x * dx + dir.y * dy);
    var rs = b * b - 4 * d;
    if (rs < 0) return false;
    var t1 = (b - Math.sqrt(rs)) / 2;
    var t2 = (b + Math.sqrt(rs)) / 2;
    return new Segment(new Vector(seg.pA.add(seg.direction.mul(t1))), new Vector(seg.pA.add(seg.direction.mul(t1))));
};

MyShip.prototype.inRange = function (pos, range) {
    return this.location.minus(new Vector(pos.x, pos.y)).length() < range;

};


MyShip.prototype.drawShipButterfly = function (ctx) {

    var pi_half = Math.PI / 2;
    var theta = 0;
    var plist = [];
    var cx = 0, cy = 0;
    for (theta = 0; theta <= Math.PI * 2; theta += 0.01) {
        var r = Math.exp(Math.cos(theta - pi_half)) - 2 * Math.cos((theta - pi_half) * 4)
            + Math.pow(Math.sin((theta - pi_half) / 12), 5);
        //var x=this.location.x+20*r*Math.cos(theta);
        var x = 3 * r * Math.cos(theta);
        //var y=this.location.y+20*r*Math.sin(theta);
        var y = 3 * r * Math.sin(theta);
        cx += x;
        cy += y;
        plist.push({ 'x': x, 'y': y });
    }
    cx /= plist.length;
    cy /= plist.length;
    var maxLen = -1000000;
    for (i = 0; i < plist.length; i++) {
        var dist = (cx - plist[i].x) * (cx - plist[i].x) + (cy - plist[i].y) * (cy - plist[i].y);
        dist = Math.sqrt(dist);
        if (dist > maxLen) {
            maxLen = dist;
        }
    }
    ctx.save();
    var angle = Math.atan2(this.speed.y, this.speed.x);
    ctx.translate(this.location.x, this.location.y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,255,0.2)';
    for (var i = 0; i < plist.length; i++) {
        ctx.moveTo(plist[i].x, plist[i].y);
        ctx.lineTo(plist[(i + 1) % plist.length].x, plist[(i + 1) % plist.length].y);
    }
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(cx, cy, maxLen, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

};

//利用光线扫描的点来判断行驶路线
MyShip.prototype.AvoidObstacleWithRayScan = function (target, obstacles) {
    var toTarget = this.location.minus(target);
    var dd = toTarget.length();
    toTarget.localNorm();
    var dir = new Vector(0, 0);
    var max_t = -10000;
    var min_dist_list = [];
    var max_t_list = [];
    if (this.RaysScan.length != 0) {
        for (var i = 0; i < this.RaysScan.length; i++) {
            var ray_p = this.RaysScan[i];
            //we get the all the scan point ,we find the the longest scan point
            //can we pass it without collision
            var canPass = false;
            var R = this.Radius;
            var min_dist = 100000;
            for (var j = 0; j < obstacles.length; j++) {
                if (this.inRange(obstacles[j].pos, 250)) {
                    var d = pointToLineDistance(this.location, new Vector(ray_p.x, ray_p.y), obstacles[j].pos);
                    min_dist = min_dist > d ? d : min_dist;
                }
            }
            if (min_dist > R) {
                canPass = true;//we can pass through it
                max_t_list.push(ray_p);
            }
            /*
             else{
             var op_dir=new Vector(this.location.x-obstacles[j].pos.x,this.location.y-obstacles[j].y);
             var op_len=op_dir.length() - this.Radius - obstacles[i].R;
             op_dir.localNorm();
             dir.localAdd(op_dir.mul(k/(op_len*op_len)));
             }*/
        }
        var max_index = 0;
        if (max_t_list.length > 0) {
            for (i = 0; i < max_t_list.length; i++) {
                if (max_t_list[i].t > max_t) {
                    max_t = max_t_list[i].t;
                    max_index = i;
                }
            }
            var best_v = new Vector(max_t_list[max_index].x - this.location.x,
                max_t_list[max_index].y - this.location.y).norm();
            dir.localAdd(best_v);
            //dir.localMul(1.2);
        }
    }
    toTarget.localAdd(dir);
    dir = new Vector(0, 0);
    var k = 200;
    for (var i = 0; i < obstacles.length; i++) {
        if (this.inRange(obstacles[i].pos, 200)) {
            var d = new Vector(this.location.x - obstacles[i].pos.x, this.location.y - obstacles[i].pos.y);
            var dist = d.length() - this.Radius - obstacles[i].R;
            d.localNorm();
            d.localMul(k / (dist * dist));
            dir.localAdd(d);
        }
    }
    var speed = this.maxSpeed;
    if (dd < 100) {
        speed = map(dd, 0, 100, 0, Math.sqrt(this.maxSpeed));
    }
    toTarget.localAdd(dir);
    toTarget = toTarget.norm().mul(speed);
    var steer = this.speed.minus(toTarget);
    steer.localLimit(Math.sqrt(this.maxForce));
    this.applyForce(steer);
};

//躲避障碍物的势函数
MyShip.prototype.ArriveTargetWithPotentialFunction = function (target, obstacles) {
    var toTarget = this.location.minus(target);
    var dd = toTarget.length();
    toTarget.localNorm();
    var dir = new Vector(0, 0);
    var k = 5;
    for (var i = 0; i < obstacles.length; i++) {
        if (this.inRange(obstacles[i].pos, 200)) {
            var d = new Vector(this.location.x - obstacles[i].pos.x, this.location.y - obstacles[i].pos.y);
            var dist = d.length() - this.Radius - obstacles[i].R;
            d.localNorm();
            d.localMul(k / (dist * dist));
            dir.localAdd(d);
        }
    }
    var speed = this.maxSpeed;
    if (dd < 100) {
        speed = map(dd, 0, 100, 0, Math.sqrt(this.maxSpeed));
    }
    toTarget.localAdd(dir);
    toTarget = toTarget.norm().mul(speed);
    var steer = this.speed.minus(toTarget);
    steer.localLimit(Math.sqrt(this.maxForce));
    this.applyForce(steer);
};


//group separate
MyShip.prototype.separate = function (shipList) {
    var diff = new Vector(0, 0);
    var k = 20;
    var count = 0;
    for (var i = 0; i < shipList.length; i++) {
        var ship = shipList[i];
        if (ship != this) {
            var d = distance(ship.location, this.location) - ship.Radius - this.Radius;
            if (Math.abs(d) < 50) {//do the separate
                var dir = ship.location.minus(this.location);
                dir.localDiv(Math.abs(d) + 0.001);
                diff.localAdd(dir);
                count++;
            }
        }
    }
    if (diff.length() > 1e-6) {
        //    diff.localDiv(count);
        diff.localNorm();
        diff.localMul(Math.sqrt(this.maxSpeed));
        var steer = this.speed.minus(diff);
        steer.localNorm();
        steer.localLimit(Math.sqrt(this.maxForce));
        return steer;
    }
    return new Vector(0, 0);
};

MyShip.prototype.seek = function (target) {
    var t = new Vector(target.x, target.y);
    var toTarget = this.location.minus(t);
    toTarget.localNorm();
    toTarget.localMul(Math.sqrt(this.maxSpeed));
    var steer = this.speed.minus(toTarget);
    steer.localNorm();
    steer.localLimit(Math.sqrt(this.maxForce));
    return steer;
};
MyShip.prototype.align = function (shipList) {
    var speed = new Vector(0, 0);
    var count = 0;
    for (var i = 0; i < shipList.length; i++) {
        var ship = shipList[i];
        if (ship != this) {
            var d = distance(ship.location, this.location) - ship.Radius - this.Radius;
            if (Math.abs(d) < 150) {//do the separate
                speed.localAdd(ship.speed);
                count++;
            }
        }
    }
    if (count > 0) {
        speed.localDiv(count);
        speed.localNorm();
        speed.localMul(sqrt(this.maxSpeed));

        var steer = this.speed.minus(speed);
        steer.localNorm();
        steer.localLimit(Math.sqrt(this.maxForce));
        return steer;
    }
    return new Vector(0, 0);

};
MyShip.prototype.queue = function () {

};
//some group behaviors
MyShip.prototype.applyBehavior = function (ship_list, target, leader) {
    if (leader == undefined) {
        var separate = this.separate(ship_list);
        var seek = this.seek(target);
        var align = this.align(ship_list);
        var cohesion = this.cohesion(ship_list);
        //
        separate.localMul(1.5);
        seek.localMul(0.9);
        align.localMul(0.8);
        cohesion.localMul(0.5);
        //
        this.applyForce(separate);
        this.applyForce(seek);
        this.applyForce(align);
        this.applyForce(cohesion);
    }
    else if (this != ship_list[leader]) {
        separate = this.separate(ship_list);
        seek = this.seek(ship_list[leader].location);
        align = this.align(ship_list);
        cohesion = this.cohesion(ship_list);
        //
        separate.localMul(2.8);
        seek.localMul(1.0);
        align.localMul(0.5);
        cohesion.localMul(0.5);
        //
        this.applyForce(separate);
        this.applyForce(seek);
        this.applyForce(align);
        this.applyForce(cohesion);
    } else if (this == ship_list[leader]) {
        seek = this.seek(target);
        separate = this.separate(ship_list);
        separate.localMul(0.5);
        this.applyForce(seek);
        this.applyForce(separate);
    }

};
MyShip.prototype.followWithLeader = function (ship_list, target, leader, context) {
    var pos = ship_list[leader].location;
    var dir = ship_list[leader].speed;
    var angle = Math.atan2(dir.x, dir.y);
    var predict = pos.add(dir.norm().mul(300));
    if (this != ship_list[leader]) {
        //判断自己是不是在leader的视野里，假设leader的视野是速度方向的60度夹角
        var m_pos = this.location;
        var ab = new Vector(-pos.x + m_pos.x, -pos.y + m_pos.y);
        var angle1 = Math.atan2(ab.x, ab.y);
        var r = Math.PI / 6;
        context.fillStyle = 'rgba(0,0,255,1)';
        if (angle1 > angle - r && angle1 < angle + r) {
            var fleePos1 = pointProjectToLine(pos, dir, this.location);
            var flee1 = this.flee(fleePos1);
            var flee2 = this.flee(pos);
            var separate = this.separate(ship_list);
            flee1.localMul(1.2);
            flee2.localMul(1.2);
            separate.localMul(1.2);
            this.applyForce(separate);
            this.applyForce(flee1);
            this.applyForce(flee2);

            context.beginPath();
            context.arc(fleePos1.x, fleePos1.y, 5, 0, Math.PI * 2, false);
            context.closePath();
            context.fill();
        } else {
            //var power=map(this.speed.length(),0,dir.length(),0,1);
            separate = this.separate(ship_list);
            var seek = this.seek(ship_list[leader].location);
            var align = this.align(ship_list);
            var cohesion = this.cohesion(ship_list);
            //
            separate.localMul(2);
            seek.localMul(0.6);
            align.localMul(0.3);
            cohesion.localMul(0.3);
            //
            //this.applyForce(power);
            this.applyForce(separate);
            this.applyForce(seek);
            this.applyForce(align);
            this.applyForce(cohesion);
        }


    } else if (this == ship_list[leader]) {

        //separate = this.separate(ship_list);
        //separate.localMul(0.5);

        if (distance(this.location, target)) {
            this.arrive(target);
        } else {
            seek = this.seek(target);
            this.applyForce(seek);
        }
        //this.applyForce(separate);
    }
};
MyShip.prototype.cohesion = function (shipList) {
    var mid = new Vector(0, 0);
    var count = 0;
    for (var i = 0; i < shipList.length; i++) {
        var ship = shipList[i];
        if (ship != this) {
            var d = distance(ship.location, this.location) - ship.Radius - this.Radius;
            if (Math.abs(d) < 150) {//do the separate
                mid.localAdd(ship.location);
                count++;
            }
        }
    }
    if (count > 0) {
        mid.localDiv(count);
        return this.seek(mid);
    }
    return new Vector(0, 0);
};
MyShip.prototype.queueToFollow = function (ship_list, target, leader, context) {
    var pos = ship_list[leader].location;
    var dir = ship_list[leader].speed;
    var angle = Math.atan2(dir.x, dir.y);
    var predict = pos.add(dir.norm().mul(300));
    if (this != ship_list[leader]) {
        //判断自己是不是在leader的视野里，假设leader的视野是速度方向的60度夹角
        for (var i = 0; i < ship_list.length; i++) {
            if (this != ship_list[i]) {
                var ship = ship_list[i];
                var m_pos = this.location;
                var ab = new Vector(-ship.location.x + m_pos.x, -ship.location.y + m_pos.y);
                var angle1 = Math.atan2(ab.x, ab.y);
                var r = Math.PI / 4;
                if (distance(m_pos, ship.location) - 2 * ship.Radius < 20) {
                    if (angle1 > angle - r && angle1 < angle + r) {

                        /*
                         context.fillStyle = 'rgba(0,0,255,1)';
                         context.beginPath();
                         context.arc(fleePos1.x, fleePos1.y, 5, 0, Math.PI * 2, false);
                         context.closePath();
                         context.fill();*/
                    }
                }


            }
        }

        {
            //var power=map(this.speed.length(),0,dir.length(),0,1);
            separate = this.separate(ship_list);
            var seek = this.seek(ship_list[leader].location);
            var align = this.align(ship_list);
            var cohesion = this.cohesion(ship_list);
            //
            separate.localMul(2);
            seek.localMul(0.6);
            align.localMul(0.3);
            cohesion.localMul(0.3);
            //
            //this.applyForce(power);
            this.applyForce(separate);
            this.applyForce(seek);
            this.applyForce(align);
            this.applyForce(cohesion);
        }


    } else if (this == ship_list[leader]) {

        //separate = this.separate(ship_list);
        //separate.localMul(0.5);

        if (distance(this.location, target)) {
            this.arrive(target);
        } else {
            seek = this.seek(target);
            this.applyForce(seek);
        }
        //this.applyForce(separate);
    }
};


var Vehicles = function () { //a list of ships
    this.ship_list = [];
    this.leader = null;
    this.behavoirType = null;
};

Vehicles.prototype.addShip = function (ship) {
    this.ship_list.push(ship);
};
Vehicles.prototype.setLeader = function (index) {
    this.leader = index;
};
Vehicles.prototype.queue = function () {

};

Vehicles.prototype.groupPathFollow = function (pathList, context) {
    for (var i = 0; i < this.ship_list.length; i++) {
        if (i == this.leader) {
            this.ship_list[i].followPath(pathList, context, 1);
        } else {
            this.ship_list[i].followWithLeader(this.ship_list, this.ship_list[i].location, 0, context);

        }
        this.ship_list[i].move();
    }
};

Vehicles.prototype.followLeader = function (target, context) {

    for (var i = 0; i < this.ship_list.length; i++) {
        this.ship_list[i].followWithLeader(this.ship_list, target, 0, context);
        this.ship_list[i].move();
    }
};
Vehicles.prototype.run = function (target) {

    for (var i = 0; i < this.ship_list.length; i++) {
        //  this.ship_list[i].applyBehavior(this.ship_list,target);
        this.ship_list[i].applyBehavior(this.ship_list, target, 0);
        this.ship_list[i].move();
        //    this.ship_list[i].recordTrace(ctx);
    }
};

Vehicles.prototype.setup = function (N) {
    for (var i = 0; i < N; i++) {
        var ship = new MyShip(randInt(100 + 10 * i, 750 + 20 * i),
            randInt(50 + 10 * i, 40 + 20 * i), 1, 'rgba(' + 125 + ',' + 125 + ',' + 10 * i % 25 + ',0.5)');
        ship.acceleration = rand2D();
        ship.speed = rand2D();
        if (i == 0) {
            ship.maxSpeed = 5;
        }
        this.addShip(ship);
    }
    this.setLeader(0);//the index eq 0 is the leader
};


Vehicles.prototype.draw = function (context) {
    for (var i = 0; i < this.ship_list.length; i++) {
        if (i == this.leader) {
            this.ship_list[i].drawShip(null, context, '#0033aa');
        } else
            this.ship_list[i].drawShip(null, context);
        //    this.ship_list[i].recordTrace(context);

        //this.ship_list[i].drawShipButterfly(context);
    }
};