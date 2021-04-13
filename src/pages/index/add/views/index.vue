<!--
 * @Descripttion:
 * @version:
 * @Author: lize
 * @Date: 2019-07-22 15:46:41
 * @LastEditors: lize
 * @LastEditTime: 2019-08-23 09:59:23
 -->
<!--
 -  2019/7/22  lize
 -->
<template>

  <div class = "IndexPage">

    <div>

        我是Index页面的add单页

    </div>

    <label>

      <div style="height:40px;border: 1px solid gray;width: 100px;display: flex;align-items: center;justify-content: center;cursor: pointer">导入文件</div>

      <input type="file" style="display: none" @change = "importFiles($event)">

    </label>

    <div style="height:40px;border: 1px solid gray;width: 100px;display: flex;align-items: center;justify-content: center;cursor: pointer" @click = "downloadFile">下载</div>
  </div>
</template>
<script>

  // import Excel from '@/common/components/CbimExcelModule/service.js'
  import Excel from 'vue-excel-plugin'
    export default {
        data () {
            return {
                excelAry:[]
            }
        },
        mounted () {
            this.initialize();
        },
        methods: {

          //初始化
          initialize(){

            console.log(Excel);

          },

          importFiles(event){

            Excel.importFile(event.target.files[0])

              .then((e) =>{

                this.excelAry = e;

                console.log(e)

              })

              .catch((er) =>{

                console.log(er);

              })

          },

          downloadFile(){

            Excel.downloadExcel('csv',this.excelAry,'测试下载')

              .then((e) =>{

                console.log(e);

              })

              .catch((er) =>{

                console.log(er);

              })

          }

        }
    }

</script>

<style scoped lang="scss">

</style>
