//debug 调试http://i5ting.github.io/node-debug-tutorial/#302
// 这个需要用npm来安装，只需要执行下列语句：

// npm install -g node-inspector
// 安装完成之后，通常可以直接这样启动在后台：

// node-inspector &
// 默认会监听8080端口，当然，也可能通过使用--web-port参数来修改。然后，在执行node程序的时候，多加个参数：--debug-brk, 如下：

// node --debug-brk app.js
// 或者

// node-debug app.js
// 控制台会返回“debugger listening on port 5858”， 现在打开浏览嚣，访问http://localhost:8080/debug?port=5858，这时候就会打开一个很像Chrome内置调试工具的界面，并且代码断点在第一行，下面就可以使用这个来调试了。
var express = require('express');
var app = express();
var router = express.Router();
var fs = require("fs");
var path = require("path");
var url = require('url');
var deasync = require('deasync');
var fileList = [];
var request = require('request');
var iconv = require('iconv-lite');
//jquery
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {window} = new JSDOM(`<!DOCTYPE html>`);
const jquery = require('jquery')(window);

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('-');
};
//加法
Number.prototype.add = function(arg){
    var r1,r2,m;
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2))
    return (this*m+arg*m)/m
}
//减法
Number.prototype.sub = function (arg){
    return this.add(-arg);
}

//乘法
Number.prototype.mul = function (arg)
{
    var m=0,s1=this.toString(),s2=arg.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}

//除法
Number.prototype.div = function (arg){
    var t1=0,t2=0,r1,r2;
    try{t1=this.toString().split(".")[1].length}catch(e){}
    try{t2=arg.toString().split(".")[1].length}catch(e){}
    with(Math){
        r1=Number(this.toString().replace(".",""))
        r2=Number(arg.toString().replace(".",""))
        return (r1/r2)*pow(10,t2-t1);
    }
}

function find(source, regExp, start, end) {
    try {
        var find = source.match(regExp)[0];
        return find.substring(start, find.length - end);
    }
    catch (e) {
        return "";
    }
}

function syncRequest(url, callback,encoding) {
    var done = false;

    request({
        encoding: null,
        url: url
    }, function (error, response, body) {
        if(body){
            if(encoding){
                body = iconv.decode(body, encoding).toString();
            }else{
                body = iconv.decode(body, 'utf-8').toString();
            }
        }
        callback(error, response, body);
        done = true;
    })

    deasync.loopWhile(function () {
        return !done;
    });
}

router.get('/forward_get', function (req, res) {
    var host = req.protocol + '://' + req.get('host');
    var params = url.parse(req.url, true);
    var trueUrl = params.query.url;
    var done = false;
    var data;
    request(trueUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = body
        }
        done = true;
    })
    deasync.loopWhile(function () {
        return !done;
    });
    res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
    res.end(data);
});

router.get('/test', function (req, res) {
    var url = "http://fund.eastmoney.com/110011.html?spm=search"
    syncRequest(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //查询最新估值
           var aa= find(body, /<title>[\s\S]*?\(/, 7, 1)

            console.log("ddddddddd5:"+aa)
        }
    })
    // console.log(nowValue.toString())
    res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
    res.end("test");
});

function fundValution(fundId) {
    var url = "http://fund.eastmoney.com/"+fundId+".html?spm=search"
    var object = new Object;
    syncRequest(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //查询最新估值
            jquery(body)
                .find('.floatleft.fundZdf')
                .each(function (index, domEle) {
                        //console.log("ddddddddd5:" + domEle.innerHTML)
                        object.guzhi = find(domEle.innerHTML, />[\s\S]*?</, 1, 1)
                        //console.log("ddddddddd4:" + object.guzhi)
                    }
                );
            //查询最新估值时间
            jquery(body)
                .find('#gz_gztime')
                .each(function (index, domEle) {
                        object.guzhiTime = "20" + domEle.innerHTML.substring(1, 9);
                        //console.log("ddddddddd3:" + object.guzhiTime)
                    }
                );
        }
    })
    return object;
}

/**
 返回数据格式

 [

 {
     isValuation:true
     y:[],
     x:[]
 },

 {
     isValuation:true
     y:[],
     x:[]
 },

 {
     isValuation:true
     y:[],
     x:[]
 },

 {
     isValuation:true
     y:[],
     x:[]
 }

 ]




 */
//http://fund.10jqka.com.cn/002881/historynet.html   JsonData = [{    }];
//http://localhost:3242/data?fundId=110011
router.get('/data', function (req, res) {
    var host = req.protocol + '://' + req.get('host');
    var params = url.parse(req.url, true);
    var fundId = params.query.fundId;

    var result = {
        isValuation: false,
        name:"",
        data: [
            {
                y: [],
                x: [],
                minY:0,
                maxY:0
            },
            {
                y: [],
                x: [],
                minY:0,
                maxY:0
            },
            {
                y: [],
                x: [],
                minY:0,
                maxY:0
            },
            {
                y: [],
                x: [],
                minY:0,
                maxY:0
            }
        ]
    }
    var tempData;
    syncRequest("http://fund.10jqka.com.cn/" + fundId + "/historynet.html", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            tempData = find(body, /JsonData\s=\s\[.*?\];/, 11, 1);
            result.name = find(body, /<title>[\s\S]*?\(/, 7, 1)
        }
    },'gb2312')
    //string to json
    var objects = JSON.parse(tempData);
    //handle today's valuation
    var date = new Date();
    if (date.yyyymmdd() != objects[0].data) {
        var valuation = fundValution(fundId);
        if(valuation.guzhiTime != objects[0].data){
            var lastValue = objects[0].totalnet;
            var nowValue = Number(parseFloat(lastValue)).add(parseFloat(valuation.guzhi));
            var todayObject = new Object();
            todayObject.date = valuation.guzhiTime
            todayObject.totalnet = nowValue.toString()
            objects.unshift(todayObject)
            result.isValuation = true;
        }
    }
    //handle result 22  66  132  264
    var min = parseFloat(objects[0].totalnet);
    var max = parseFloat(objects[0].totalnet);
    var paddingMin,paddingMax;
    for (var i = 0; i < objects.length && i < 264; i++) {
        if(min>parseFloat(objects[i].totalnet)){
            min = parseFloat(objects[i].totalnet);
        }
        if(max<parseFloat(objects[i].totalnet)){
            max = parseFloat(objects[i].totalnet);
        }
        // var padding =Number(Number(max).sub(min)).div(6);
        // paddingMin = Number(min).sub(padding);
        // paddingMax = Number(max).add(padding);
        var padding = (max - min)/6;
        paddingMin =parseFloat((min-padding).toFixed(4));
        paddingMax =parseFloat( (max+padding).toFixed(4));

        if(i<22){
            result.data[0].y.push(objects[i].totalnet)
            result.data[0].x.push(objects[i].date)
            result.data[0].minY = paddingMin;
            result.data[0].maxY = paddingMax;
        }
        if(i<66){
            result.data[1].y.push(objects[i].totalnet)
            result.data[1].x.push(objects[i].date)
            result.data[1].minY = paddingMin;
            result.data[1].maxY = paddingMax;
        }
        if(i<132){
            result.data[2].y.push(objects[i].totalnet)
            result.data[2].x.push(objects[i].date)
            result.data[2].minY = paddingMin;
            result.data[2].maxY = paddingMax;
        }
        result.data[3].y.push(objects[i].totalnet)
        result.data[3].x.push(objects[i].date)
        result.data[3].minY = paddingMin;
        result.data[3].maxY = paddingMax;
    }
    for (var i = 0; i < 4; i++) {
        result.data[i].y.reverse()
        result.data[i].x.reverse()
    }
    //json to string

    tempData = JSON.stringify(result);
    //set response
    res.set({
        'content-type': 'application/json'
    })
    res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
    res.end(tempData);
});


app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use('/', router);
var port = process.env.PORT || 3242;
app.listen(port);
console.log('Magic happens on port ' + port);
