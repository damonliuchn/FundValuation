<template>
    <div class="column">

        <div class="row">
            <el-input v-model="input"  placeholder="请输入基金代码"></el-input>
            <el-button style="margin-left:5px" @click="search(1)" :disabled="searchButtonDisable">搜索</el-button>
        </div>

        <div class="echarts">
            <ECharts :options="bar" ref="chart" theme="macarons" auto-resize></ECharts>
            <div style="width:0px;height: 0px"></div>
        </div>

        <el-radio-group v-model="radio3" :disabled="radioDisable">
            <el-radio-button label="月"></el-radio-button>
            <el-radio-button label="季"></el-radio-button>
            <el-radio-button label="半年"></el-radio-button>
            <el-radio-button label="年"></el-radio-button>
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
                searchButtonDisable:true,
                radioDisable:true,
                radio3: '月',
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
        mounted () {
            this.search(0)
        },
        watch:{
            // 通过这种语法来watch就行，文档里有。。。看需求，还可以直接watch data，使用deep:true来深度观察
            'radio3':{
                handler(val,oldVal) {
                    if(!this.result){
                        return
                    }
                    if(val == "月"){
                        this.updateData(0);
                    }else if(val == "季"){
                        this.updateData(1);
                    }else if(val == "半年"){
                        this.updateData(2);
                    }else if(val == "年"){
                        this.updateData(3);
                    }
                },
                // 深度观察
                deep:true
            },
            'input':{
                handler(val,oldVal) {
                    if(val && val.length>0 && !this.radioDisable){
                        this.searchButtonDisable = false
                    }else {
                        this.searchButtonDisable = true
                    }
                },
                // 深度观察
                deep:true
            }
        },

        components: {
            ECharts
        },
        methods: {
            search(type) {
                this.showLoading();

                var id = "110011";
                if(type == 0){
                    if (typeof(this.$route.params.id)!="undefined"&&this.$route.params.id!=null) {
                        id = this.$route.params.id
                    }
                }else{
                    id = this.input;
                }
                console.log("fundId="+id)
                this.$http.get('http://' + window.document.location.host + '/data?fundId=' + id)
                    .then(response => {
                            this.result = response.body;
                            this.updateData(0);
                            this.hideLoading()
                        }, response => {
                            console.log("ddddddddd3:")
                            this.hideLoading()
                        }
                    );
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
            showLoading(){
                this.bar.series[0].data = []
                this.bar.xAxis.data = []
                this.$refs.chart.showLoading({
                    text: '正在加载',
                    color: '#4ea397',
                    maskColor: 'rgba(255, 255, 255, 0.4)'
                })
                this.radio3 = "月"
                this.radioDisable = true;
                this.searchButtonDisable = true;
            },
            hideLoading(){
                this.$refs.chart.hideLoading()
                this.radioDisable = false;
                if(this.input.length>0){
                    this.searchButtonDisable = false;
                }
            }
        },
    }

</script>

<style scoped>
    .column {
        /*display: -webkit-flex; !* Safari *!*/
        display: flex;
        flex-direction: column;
        align-items:center;
    }
    .row{
        /*display: -webkit-flex; !* Safari *!*/
        display: flex;
        flex-direction: row;
        align-items:center;
    }
    .echarts {
        width: 100%;
        margin-top: 0px;
        margin-bottom: -35px;
        /*height: auto;*/
        /*flex-direction:column;*/
        /*width: 800px;*/
        /*height: 400px;*/
    }
</style>