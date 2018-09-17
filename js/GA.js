/**
 * Created by admin on 2016/7/29.
 */

//遗传算法基于不同的问题，应该设计相应的编码方式、适应度函数
//DNA表示在1-1000帧的过程中,gen[i]表示第i帧的力的方向
var DNA= function (conf) {
    this._fitness=0.0;
    this.gen=null;
    this.genFun=conf['genCode'];
    this.fitFun=conf['fitFun'];
    //this.mutateFunc=conf['mutateFunc'];
};
//how to represent our gen
DNA.prototype.InitGen= function (genCode) {
    this.gen=this.genFun();
};
DNA.prototype.fitness= function (dna) {
    this._fitness=this.fitFun(this.gen);
};
DNA.prototype.mutation= function (m) {
    for(var i=0;i<this.gen.length;i++){
        if(Math.random()<m){
            this.gen[i]=rand2D();
        }
    }
};
DNA.prototype.crossover= function (dna1,dna2) {

};
var GA= function (population,mutation) {
    this.totalPopulation=population;//种群数量
    this.mutation=mutation;//变异系数
    this.population=[];
};
//#SETP 1:initialize the populations
GA.prototype.InitPopulation= function (fitFun,mutateFunc,genCode) {
    for(var i=0;i<this.totalPopulation;i++){
        var dna=new DNA(fitFun,mutateFunc);
        dna.InitGen(genCode);
        this.population.push(dna);
    }
};
//#SETP 2:evaluate the dna's fitness and create the mating pool
GA.prototype.fitness= function () {
    for(var i=0;i<this.population.length;i++){

    }
};
GA.prototype.selection= function () {

};