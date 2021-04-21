<!--
 -  2019/9/17  lize
 -->
<template>
  <div class = "index-about-page">我是index-about组件</div>
</template>

<script>
    export default {
        data () {
            return {}
        },
        mounted () {
          console.log(this.$route.query);
          console.log(typeof this.$route.query.flag)
          if(this.$route.query.flag){
              alert(111111111111111111111)
          }
        },
        methods: {}
    }
</script>

<style scoped lang="scss">

</style>
