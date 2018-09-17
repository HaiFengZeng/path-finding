/**
 * Created by admin on 2016/8/4.
 */
//TWO KINDS OF GRAPHS NORMAL-->


var gEdge = function (from, to, weight) {
    this.from = from;
    this.to = to;
    this.weight = weight;
};
var gNode = function (index, info) {
    this.index = index;
    this.visited = false;
    this.info = info;//存储顶点信息
};
//we use the x_y to represent index(id)
var Graph = function () {
    this.V = null;//the number of vertexes
    this.E = null;//the number of edges
    //this.Matrix=[];
    // there're two  ways to represent graph using matrix or Array list
    this.inEdge = {};//存储入边表，
    this.outEdge = {};//store edges to all neighbors
    this.Node = {};//all the nodes
};
//当有动态添加节点的时候，矩阵显然不是一个好的表示方法
//因为需要重新申请空间，复制数据
Graph.prototype.addEdge = function (from, to, weight) {
    if (!this.outEdge[from]) {
        this.outEdge[from] = new Array();
        this.outEdge[from].push(new gEdge(from, to, weight));
    } else {
        this.outEdge[from].push(new gEdge(from, to, weight));
    }
    if (!this.inEdge[to]) {
        this.inEdge[to] = new Array();
        this.inEdge[to].push(new gEdge(from, to, weight));
    } else {
        this.inEdge[to].push(new gEdge(from, to, weight));
    }
};
//return the neighbors to index
Graph.prototype.getNeighbors = function (index) {
    index = parseInt(index);
    var edges = this.outEdge[index];
    var nd_list = [];
    for (var i = 0; i < edges.length; i++) {
        nd_list.push(this.Node[edges[i].to]);
    }
    return nd_list;
};
//visit a graph using DFS ,start in s
Graph.prototype.dfs = function (s) {
    var node = this.Node[s];
    node.visited = true;
    //console.log('visit node->' + s);
    var outEdges = this.getNeighbors(s);
    for (var i = 0; i < outEdges.length; i++) {
        if (!outEdges[i].visited) {
            this.dfs(outEdges[i].index);//search next point
        }
    }
};
Graph.prototype.bfs = function (s, context) {
    var Q = [];
    var visited = new Array(this.getV());
    var NODE = this.Node;
    var node = NODE[s];
    Q.push(node);
    while (Q.length > 0) {
        node = Q[0];
        //console.log('visit node' + node.index);
        node.visited = true;
        visited[node.index] = true;
        var nd_list = this.getNeighbors(node.index);
        for (var i = 0; i < nd_list.length; i++) {
            var nd = nd_list[i];
            if (!nd.visited) {
                if (context) {
                    context.beginPath();
                    context.strokeStyle = 'rgba(0,0,0,0.2)';
                    context.moveTo(node.info.x, node.info.y);
                    context.lineTo(nd.info.x, nd.info.y);
                    context.stroke();
                    context.closePath();
                }
                if (!nd.visited && !context) {
                    Q.push(nd);
                    visited[nd.index] = true
                }
                if (!visited[nd.index]) {
                    Q.push(nd);
                    visited[nd.index] = true
                    nd.visited = true
                }
            }
        }
        Q = Q.slice(1);
    }
};
Graph.prototype.init = function (edges, nodes) {
    this.Node = nodes;
    for (k in edges) {
        var w = edges[k];
        var ft = k.split('_');
        this.addEdge(parseInt(ft[0]), parseInt(ft[1]), w);
    }

};
Graph.prototype.getV = function () {
    var count = 0;
    for (k in this.Node) {
        count++;
    }
    this.V = count;
    return this.V;
};
Graph.prototype.draw = function (context) {
    //draw node

    for (key in this.Node) {
        var nd = this.Node[key].info;
        context.beginPath();
        context.fillStyle = 'rgba(0,255,0,0.2)';
        context.arc(nd.x, nd.y, 4, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.fillStyle = 'rgba(255,0,125,0.5)';
        context.fillText(key, nd.x - 2, nd.y - 4);

    }
    //draw edges
    this.bfs(0, context);


};

//ADD NODE
Graph.prototype.pathFinding_Djistra = function (s, target) {
    if (s == target) return null;
    //search from s find the all shortest path to all nodes
    var nd = this.Node[s];
    var cost = new Array(this.getV());
    var path = new Array(this.getV());
    var visited = new Array(this.getV());
    var INF = 100000000;
    for (var i = 0; i < path.length; i++) {
        cost[i] = INF;
        path[i] = s;
        visited[i] = false;
    }
    var nbs = this.getNeighbors(s);
    for (i = 0; i < nbs.length; i++) {
        var nb = nbs[i];
        cost[nb.index] = distance(nd.info, nb.info);
    }
    visited[s] = true;
    path[s] = -1;
    cost[s] = 0;
    //find the cheapest cost
    for (var k = 0; k < this.getV(); k++) {
        var min = 10000, midex = -1;
        for (var i = 0; i < cost.length; i++) {
            if (cost[i] < min && cost[i] != INF && !visited[i]) {
                min = cost[i];
                midex = i;
            }
        }
        if (midex != -1) {//found
            visited[midex] = true;
            var nnd = this.Node[midex];
            nbs = this.getNeighbors(midex);
            for (var j = 0; j < nbs.length; j++) {
                var ndj = nbs[j];
                if (cost[nnd.index] + distance(ndj.info, nnd.info) < cost[ndj.index]) {
                    cost[ndj.index] = cost[nnd.index] + distance(ndj.info, nnd.info);
                    path[ndj.index] = nnd.index;
                }
            }
        }
    }

    var p = path[target];
    var path_list = [this.Node[target].info];
    while (p != -1) {
        path_list.push(this.Node[p].info);
        p = path[p];
    }
    //path_list.push(this.Node[s].info);
    return path_list.reverse();

};

var MOUSE = { x: 0, y: 0 };

Graph.prototype.handleAddPointEvent = function (x, y, obstacles) {
    MOUSE.x = x;
    MOUSE.y = y;
    //if the position is valid
    var info = new Vector(x, y);
    if (validLocation(info, obstacles)) {
        //find the nodes if distance <200
        return this.addNode(info, obstacles, 200);
    }
    return null;
};

//TO-LIST


Graph.prototype.addNode = function (info, obstacles, range) {
    var r = range || 120;
    var index = this.getV();
    var nd = new gNode(index, info);
    this.Node[index] = nd;
    //build edges to the other nodes beside nd
    var count = 0;
    var min = 1000000;
    var id = -1;
    for (node in this.Node) {
        var nod = this.Node[node];
        var dd = distance(nod.info, info);
        if (dd < 5) return node;
        if (nod.index != index) {
            if (!isLineCrossObstacles(nod.info, info, obstacles)) {
                if (dd < 120) {
                    this.addEdge(nod.index, index, dd);
                    this.addEdge(index, nod.index, dd);
                    count++;
                }
                else if (dd < min) {
                    min = dd;
                    id = node;
                }
            }

        }
    }
    if (count == 0) {
        this.addEdge(id, index, min);
        this.addEdge(index, id, min);
    }
    return index;
};

//GRID---->
var GridGraph = function (width, height, size) {
    this.SIZE = size;
    this.row = Math.floor(height / this.SIZE) + 1;
    this.col = Math.floor(width / this.SIZE) + 1;
    this.width = width;
    this.height = height;
    this.Matrix = new Array(this.col * this.row);
    this.visit = new Array(this.col * this.row);

};

GridGraph.prototype.get = function (x, y) {
    return {
        'm': this.Matrix[x * this.col + y],
        'v': this.visit[x * this.col + y]
    }
};
GridGraph.prototype.set = function (x, y, info) {

    /*
     if(!this.get(x,y)){
     this.Matrix[x*this.col+y]=new Array();
     this.Matrix[x*this.col+y].push(info);
     }*/
    this.visit[x * this.col + y] = 1;
};
GridGraph.prototype.draw = function (context) {
    /*
     context.strokeStyle='rgba(0,0,0,0.1)';
     context.beginPath();
     for(var i=0;i<this.row;i++){
     context.moveTo(0,this.SIZE*i);
     context.lineTo(this.width,this.SIZE*i);
     context.stroke();
     }
     for(var j=0;j<this.col;j++){
     context.moveTo(this.SIZE*j,0);
     context.lineTo(this.SIZE*j,this.height);
     context.stroke();
     }
     context.closePath();*/
    context.fillStyle = 'rgba(125,0,155,0.3)';
    for (i = 0; i < this.col; i++) {
        for (j = 0; j < this.row; j++) {
            if (this.visit[i * this.col + j] == 1) {
                context.fillRect(i * this.SIZE, j * this.SIZE, this.SIZE, this.SIZE);
                context.fill();
            }
        }
    }


};
GridGraph.prototype.getXY = function (pos) {
    var x = floor(pos.x / this.SIZE), y = floor(pos.y / this.SIZE);
    return this.get(x, y);
};
GridGraph.prototype.setXY = function (pos) {
    var x = floor(pos.x / this.SIZE), y = floor(pos.y / this.SIZE);
    this.visit[x * this.col + y] = 1;
};
GridGraph.prototype.init = function (obstacles) {
    for (var i = 0; i < obstacles.length; i++) {
        var pos = obstacles[i].pos;
        var x = floor(pos.x / this.SIZE), y = floor(pos.y / this.SIZE);
        var R = obstacles[i].R;
        var size = floor(R / this.SIZE) + 2;
        for (var k = x - size; k <= x + size; k++) {
            for (var m = y - size; m <= y + size; m++) {
                var plist = [new Vector(this.SIZE * k, this.SIZE * m),
                    new Vector(this.SIZE * (k + 1), this.SIZE * m),
                    new Vector(this.SIZE * k, this.SIZE * (1 + m)),
                    new Vector(this.SIZE * (k + 1), this.SIZE * (m + 1))
                ];
                for (var p = 0; p < plist.length; p++) {
                    if (distance(plist[p], pos) < R) {
                        this.set(k, m);
                        break;
                    }
                }
            }
        }
    }
};
GridGraph.prototype.getijMidPos = function (k, m) {
    var plist = [new Vector(this.SIZE * k, this.SIZE * m),
        new Vector(this.SIZE * (k + 1), this.SIZE * m),
        new Vector(this.SIZE * k, this.SIZE * (1 + m)),
        new Vector(this.SIZE * (k + 1), this.SIZE * (m + 1))
    ];
    var v = new Vector(0, 0);
    for (var i = 0; plist < v.length; i++) {
        v.localAdd(plist[i]);
    }
    v.localDiv(plist.length);
    return v;
};
GridGraph.prototype.pathFinding = function (s, e) {
    //start from s,search the target s
    //s and e represent as the pos
    var sx = floor(s.x / this.SIZE), sy = floor(s.y / this.SIZE);
    var ex = floor(e.x / this.SIZE), ey = floor(e.y / this.SIZE);
    if (sx == ex && sy == ey) return null;
    var Q = [];
    Q.push(s);
    //search 8 directions
    var dir = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    var visited = {};
    var path = {};
    while (Q.length > 0) {
        var f = Q[0];
        visited[str2id(f.x, f.y)] = 1;
        if (f.x == ex && f.y == ey) {
            console.log('find path');

        }
        for (var i = 0; i < dir.length; i++) {
            var nx = f.x + dir[0], ny = f.y + dir[1];

            if (nx >= 0 && nx <= this.row && ny >= 0 && ny <= this.col) {
                if (!visited[str2id(nx, ny)] && !this.get(nx, ny)) {
                    Q.push({
                        x: nx,
                        y: ny
                    });
                    path[str2id(nx, ny)] = str2id(f.x, f.y);
                }
            }
        }
    }


};