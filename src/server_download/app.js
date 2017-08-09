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
//jquery
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const {window} = new JSDOM(`<!DOCTYPE html>`);
const jquery = require('jQuery')(window);

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('-');
};

function find(source, regExp, start, end) {
    try {
        var find = source.match(regExp)[0];
        return find.substring(start, find.length - end);
    }
    catch (e) {
        return "";
    }
}

function syncRequest(url, callback) {
    var done = false;
    request(url, function (error, response, body) {
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


function fundValution() {
    var url = "http://fund.eastmoney.com/110011.html?spm=search"
    var object = new Object;
    syncRequest(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //查询最新估值
            jquery(body)
                .find('.floatleft.fundZdf')
                .each(function (index, domEle) {
                        console.log("ddddddddd5:" + domEle.innerHTML)
                        object.guzhi = find(domEle.innerHTML, />[\s\S]*?</, 1, 1)
                        console.log("ddddddddd4:" + object.guzhi)
                    }
                );
            //查询最新估值时间
            jquery(body)
                .find('#gz_gztime')
                .each(function (index, domEle) {
                        object.guzhiTime = "20" + domEle.innerHTML.substring(1, 9);
                        console.log("ddddddddd3:" + object.guzhiTime)
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
        data: [
            {
                y: [],
                x: []
            },
            {
                y: [],
                x: []
            },
            {
                y: [],
                x: []
            },
            {
                y: [],
                x: []
            }
        ]
    }

    var done = false;
    var data;
    request("http://fund.10jqka.com.cn/" + fundId + "/historynet.html", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = find(body, /JsonData\s=\s\[.*?\];/, 11, 1);
        }
        done = true;
    })
    deasync.loopWhile(function () {
        return !done;
    });

    //handle result
    //string to json
    var objects = JSON.parse(data);
    //handle today's valuation
    var date = new Date();
    date.yyyymmdd();
    console.log("--"+date.yyyymmdd())
    if (date.yyyymmdd() != objects[0].data) {
        var valuation = fundValution();
        if(valuation.guzhiTime != objects[0].data){
            var lastValue = objects[0].totalnet;
            var fuhao = valuation.guzhi.substring(0, 1);
            var changeValue = valuation.guzhi.substring(1);
            var nowValue;
            if (fuhao == '+') {
                nowValue = parseFloat(lastValue) + parseFloat(changeValue);
            } else {
                nowValue = parseFloat(lastValue) - parseFloat(changeValue);
            }
            var todayObject = new Object();
            todayObject.date = valuation.guzhiTime
            todayObject.totalnet = nowValue.toString()
            objects.unshift(todayObject)
            result.isValuation = true;
        }
    }
    //handle result 22  66  132  264
    for (var i = 0; i < objects.length && i < 264; i++) {
        if(i<22){
            result.data[0].y.push(objects[i].totalnet)
            result.data[0].x.push(objects[i].date)
        }
        if(i<66){
            result.data[1].y.push(objects[i].totalnet)
            result.data[1].x.push(objects[i].date)
        }
        if(i<132){
            result.data[2].y.push(objects[i].totalnet)
            result.data[2].x.push(objects[i].date)
        }
        result.data[3].y.push(objects[i].totalnet)
        result.data[3].x.push(objects[i].date)
    }
    //json to string
    data = JSON.stringify(result);

    res.writeHead(200, {"Access-Control-Allow-Origin": "*"});
    res.end(data);
});


app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

app.use('/', router);
var port = process.env.PORT || 3242;
app.listen(port);
console.log('Magic happens on port ' + port);
