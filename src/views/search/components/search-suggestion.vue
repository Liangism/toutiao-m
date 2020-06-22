<template>
  <div class="search-suggestion">
    <van-cell
      icon="search"
      v-for="(text, index) in suggestions"
      :key="index"
      @click="$emit('search',text)"
    >
      <div slot="title" v-html="highlight(text)"></div>
    </van-cell>
  </div>
</template>

<script>
import { getSearchSuggestions } from '@/api/search'
import { debounce } from 'lodash'

export default {
  name: 'SearchSuggestion',
  props: {
    searchText: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      suggestions: [] // 联想建议数据列表
    }
  },
  watch: {
    searchText: {
      // 监听 searchText
      //   handler(value) {
      //     this.loadSearchSuggestions(value)
      //   },
      // 防抖优化
      handler: debounce(function(value) {
        this.loadSearchSuggestions(value)
      }, 200),
      immediate: true // 监听开始立即触发
    }
  },
  methods: {
    async loadSearchSuggestions(q) {
      try {
        const { data } = await getSearchSuggestions(q)
        this.suggestions = data.data.options
      } catch (err) {
        this.$toast('数据获取失败，请稍后重试')
      }
    },
    highlight(text) {
      const highlightStr = `<span style="color: #3296fa">${this.searchText}</span>`
      const reg = new RegExp(this.searchText, 'gi')
      return text.replace(reg, highlightStr)
    }
  }
}
</script>

<style scoped lang="less"></style>
