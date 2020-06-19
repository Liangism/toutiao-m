// PostCSS 配置文件
module.exports = {
  plugins: {
    // vueCLI 默认已经配置
    // 'autoprefixer': {
    //   browsers: ['Android >= 4.0', 'iOS >= 8']
    // },
    'postcss-pxtorem': {
      // 识别 vant 匹配参数
      rootValue ({
        file
      }) {
        return file.indexOf('vant') !== -1 ? 37.5 : 75
      },
      propList: ['*']
    }
  }
}
