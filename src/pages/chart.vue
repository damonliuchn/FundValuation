<template>
    <div class="column">

        <div class="row">
            <el-input v-model="input" placeholder="请输入内容"></el-input>
            <div></div>
            <el-button style="margin-left:5px">默认按钮</el-button>
        </div>

        <div class="echarts">
            <ECharts :options="bar"  theme="macarons" auto-resize></ECharts>
            <div style="width:0px;height: 0px"></div>
        </div>

        <el-radio-group v-model="radio3">
            <el-radio-button label="上海"></el-radio-button>
            <el-radio-button label="北京"></el-radio-button>
            <el-radio-button label="广州"></el-radio-button>
            <el-radio-button label="深圳"></el-radio-button>
        </el-radio-group>

    </div>
</template>

<script>
    import ECharts from 'vue-echarts/components/ECharts.vue'
    import 'echarts/lib/chart/bar'
    import 'echarts/lib/chart/line'
    import 'echarts/lib/chart/pie'
    import 'echarts/lib/chart/map'
    import 'echarts/lib/chart/radar'
    import 'echarts/lib/chart/scatter'
    import 'echarts/lib/chart/effectScatter'
    import 'echarts/lib/component/tooltip'
    import 'echarts/lib/component/polar'
    import 'echarts/lib/component/geo'
    import 'echarts/lib/component/legend'
    import 'echarts/lib/component/title'
    import 'echarts/lib/component/visualMap'
    import 'echarts/theme/macarons.js'

    import jquery from 'jquery';

    export default {
        data() {
            return {
                input: '',
                xxData: [],
                yyData: [],
                loading: true,
                bar: {
                    title: {
                        text: ''
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
//                    legend: {
//                        data: ['半月', '月','季', '半年','年']
//                    },
                    xAxis: {
                        data: []
                    },
                    yAxis: {
                        min: 3.5,
                        max: 3.8
                    },
                    series: [{
                        name: '累计净值',
                        type: 'line',
                        data: [],
                        markPoint: {
                            data : [
                                {name: '最新值', value: 0, xAxis: "", yAxis: 0}
                            ]
                        },
                        markLine: {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        }
                    }]
                }
            }
        },
        created () {

        },
        mounted () {//110011
            var id = this.$route.params.id;
            if (!id) {
                id = "110011"
            }
            var url = "http://fund.eastmoney.com/" + id + ".html?spm=search"
            this.$http.get('http://' + window.document.location.host + '/forward_get?url=' + url)
                .then(response => {
                        this.webContent = response.body;
                        var thisVue = this;
                        //查询历史净值
                        jquery(this.webContent)
                            .find('.ui-table-hover')
                            .each(function (index, domEle) {
                                    if (index == 2) {
                                        //console.log(index + ":" + domEle.innerHTML);
                                        for (var i = 1; i < domEle.rows.length; i++) {
                                            console.log(domEle.rows[i].cells[2].innerHTML)
                                            thisVue.addData(domEle.rows[i].cells[0].innerHTML, domEle.rows[i].cells[2].innerHTML)
                                        }
                                    }
                                }
                            );
                        //查询最新估值
                        var guzhi;
                        jquery(this.webContent)
                            .find('.floatleft.fundZdf')
                            .each(function (index, domEle) {
                                    console.log("ddddddddd5:" + domEle.innerHTML)
                                    guzhi = thisVue.find(domEle.innerHTML, />[\s\S]*?</, 1, 1)
                                    console.log("ddddddddd4:" + guzhi)
                                }
                            );
                        //查询最新估值时间
                        var guzhiTime;
                        jquery(this.webContent)
                            .find('#gz_gztime')
                            .each(function (index, domEle) {
                                    guzhiTime = domEle.innerHTML.substring(4, 9);
                                    console.log("ddddddddd3:" + guzhiTime)
                                }
                            );
                        this.addEstimateData(guzhiTime, guzhi)
                        this.fillData();
                    }, response => {
                        console.log("ddddddddd3:")
                    }
                );
        },
        components: {
            ECharts
        },
        methods: {
            clearData() {
                this.yyData = [];
                this.xxData = [];
            },
            addData(name, value) {
                this.yyData.push(value)
                this.xxData.push(name)
            },
            addEstimateData(name, value) {
                var last = this.xxData[0];
                if (last != name) {
                    var lastValue = this.yyData[0];
                    var fuhao = value.substring(0, 1);
                    var tempValue = value.substring(1);
                    var trueValue;
                    if (fuhao == '+') {
                        trueValue = parseFloat(lastValue) + parseFloat(tempValue);
                    } else {
                        trueValue = parseFloat(lastValue) - parseFloat(tempValue);
                    }
                    this.yyData.unshift(trueValue.toString())
                    this.xxData.unshift(name)
                }
            },
            fillData () {
                this.updateYAxis();
                this.bar.series[0].data = this.yyData.reverse()
                this.bar.xAxis.data = this.xxData.reverse()

                var value = parseFloat(this.yyData[this.yyData.length-1])
                this.bar.series[0].markPoint.data[0].value = value
                this.bar.series[0].markPoint.data[0].yAxis = value
                this.bar.series[0].markPoint.data[0].xAxis = this.xxData[this.xxData.length-1]
                this.loading = false
            },
            onReady(instance) {
                console.log(instance);
            },
            updateYAxis() {
                var min = parseFloat(this.yyData[0]);
                var max = parseFloat(this.yyData[0]);
                for (var i=0;i<this.yyData.length;i++)
                {
                    if(min>parseFloat(this.yyData[i])){
                        min = parseFloat(this.yyData[i]);
                    }
                    if(max<parseFloat(this.yyData[i])){
                        max = parseFloat(this.yyData[i]);
                    }
                }
                var padding = (max - min)/6;
                this.bar.yAxis.min = min-padding;
                this.bar.yAxis.max = max+padding;
            },
            find(source, regExp, start, end) {
                try {
                    var find = source.match(regExp)[0];
                    return find.substring(start, find.length - end);
                }
                catch (e) {
                    return "";
                }
            }
        },
    }

</script>

<style scoped>
    .column {
        display: -webkit-flex; /* Safari */
        display: flex;
        flex-direction: column;
        align-items:center;
    }
    .row{
        display: -webkit-flex; /* Safari */
        display: flex;
        flex-direction: row;
        align-items:center;
    }
    .echarts {
        width: 100%;
        margin-top: -15px;
        margin-bottom: -35px;
        /*height: auto;*/
        /*flex-direction:column;*/
        /*width: 800px;*/
        /*height: 400px;*/
    }
</style>