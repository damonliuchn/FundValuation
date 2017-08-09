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

    export default {
        data() {
            return {
                input: '',
                xxData: [],
                yyData: [],
                result:{},
                loading: true,
                bar: {
                    title: {
                        text: ''
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
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
            this.$http.get('http://' + window.document.location.host + '/data?fundId=' + id)
                .then(response => {
                        this.result = response.body;
                        this.updateData(0);
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
            updateData (type) {
                this.xxData = this.result.data[type].x;
                this.yyData = this.result.data[type].y;

                this.bar.yAxis.min = this.result.data[type].minY;
                this.bar.yAxis.max = this.result.data[type].maxY;

                this.bar.series[0].data = this.yyData
                this.bar.xAxis.data = this.xxData

                //handle markPoint
                var value = parseFloat(this.yyData[this.yyData.length-1])
                this.bar.series[0].markPoint.data[0].value = value
                this.bar.series[0].markPoint.data[0].yAxis = value
                this.bar.series[0].markPoint.data[0].xAxis = this.xxData[this.xxData.length-1]

                this.loading = false
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