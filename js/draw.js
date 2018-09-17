/**
 * Created by admin on 2016/7/5.
 */

//LINE SEGMENTS
var segments = [

    // Border
    {a: {x: 0, y: 0}, b: {x: 1224, y: 0}},
    {a: {x: 1224, y: 0}, b: {x: 1224, y: 640}},
    {a: {x: 1224, y: 640}, b: {x: 0, y: 640}},
    {a: {x: 0, y: 640}, b: {x: 0, y: 0}},

    // Polygon #1
    {a: {x: 100, y: 150}, b: {x: 120, y: 50}},
    {a: {x: 120, y: 50}, b: {x: 200, y: 80}},
    {a: {x: 200, y: 80}, b: {x: 140, y: 210}},
    {a: {x: 140, y: 210}, b: {x: 100, y: 150}},

    // Polygon #2
    {a: {x: 100, y: 200}, b: {x: 120, y: 250}},
    {a: {x: 120, y: 250}, b: {x: 60, y: 300}},
    {a: {x: 60, y: 300}, b: {x: 100, y: 200}},

    // Polygon #3
    {a: {x: 200, y: 260}, b: {x: 220, y: 150}},
    {a: {x: 220, y: 150}, b: {x: 300, y: 200}},
    {a: {x: 300, y: 200}, b: {x: 350, y: 320}},
    {a: {x: 350, y: 320}, b: {x: 200, y: 260}},

    // Polygon #4
    {a: {x: 340, y: 60}, b: {x: 360, y: 40}},
    {a: {x: 360, y: 40}, b: {x: 370, y: 70}},
    {a: {x: 370, y: 70}, b: {x: 340, y: 60}},

    // Polygon #5
    {a: {x: 450, y: 190}, b: {x: 560, y: 170}},
    {a: {x: 560, y: 170}, b: {x: 540, y: 270}},
    {a: {x: 540, y: 270}, b: {x: 430, y: 290}},
    {a: {x: 430, y: 290}, b: {x: 450, y: 190}},

    // Polygon #6
    {a: {x: 400, y: 95}, b: {x: 580, y: 50}},
    {a: {x: 580, y: 50}, b: {x: 480, y: 150}},
    {a: {x: 480, y: 150}, b: {x: 400, y: 95}}

];

var Segments = [];
for (var i = 0; i < segments.length; i++) {
    var pa = segments[i].a;
    var pb = segments[i].b;
    Segments.push(new Segment(pa, pb));
}
Segments=Segments.slice(0,4);
function draw() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<obstacles.length;i++){
        obstacles[i].draw(ctx);
    }
    ship.drawShipButterfly(ctx);
    //    drawDotLine_line(ctx,{x:100,y:100},{x:200,y:300});
    //    drawDotLine_line(ctx,{x:102,y:100},{x:240,y:301});
    ship_2.drawShip(canvas, ctx);

    ship.setRays();
    ship.ArriveTargetWithPotentialFunction(ship_2.location,obstacles);
    ship.recordTrace(ctx);
    ship.move();
    Segments=Segments.slice(0,0);
    var intersects = ship.rayCasting(Segments,obstacles);
    if (intersects.length > 0)
        ship.drawRayCasting(ctx, intersects);
    if (ship_2.location.x > 0 && ship_2.location.x < 640 && ship_2.location.y > 0 && ship_2.location.y < 640) {
        ship_2.recordTrace(ctx);
    }


}