<!--
 -  2019/7/22  lize
 -->
<template>

  <div id="app">

    <router-view></router-view>

  </div>

</template>

<script>

    export default {

        name:'app',

        data () {

            return {}

        },
        mounted () {

            this.initialize();

        },

        methods: {

            //初始化
          initialize(){

              console.log(process.env.VUE_APP_API);

              this.$Http.get('./RouterInfo.conf.json')

                .then((e) =>{

                  console.log(e);

                })

                .catch((er) =>{

                  console.log(er);

                })
          },

        }

    }
</script>

<style scoped lang="scss">

</style>
