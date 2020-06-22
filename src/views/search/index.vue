<template>
  <div class="search-container">
    <!-- 搜索栏 -->
    <!--
      Tips: 在 van-search 外层增加 form 标签，且 action 不为空，即可在 iOS 输入法中显示搜索按钮
    -->
    <form class="search-form" action="/">
      <van-search
        v-model="searchText"
        show-action
        shape="round"
        placeholder="请输入搜索关键词"
        background="#3296fa"
        @search="onSearch"
        @cancel="onCancel"
        @focus="isResultShow=false"
      />
    </form>
    <!-- 搜索结果 -->
    <search-result v-if="isResultShow" :search-text="searchText" />

    <!-- 搜索建议 -->
    <search-suggestion v-else-if="searchText" :search-text="searchText" @search="onSearch" />

    <!-- 搜索历史 -->
    <search-history
      v-else
      :search-histories="searchHistories"
      @clear-search-histories="searchHistories = []"
      @search="onSearch"
    />
  </div>
</template>

<script>
import SearchHistory from './components/search-history'
import SearchSuggestion from './components/search-suggestion'
import SearchResult from './components/search-result'
import { setItem, getItem } from '@/utils/storage'

export default {
  name: 'SearchIndex',
  components: {
    SearchHistory,
    SearchSuggestion,
    SearchResult
  },
  data() {
    return {
      searchText: '',
      isResultShow: false, // 控制搜索结果的展示
      searchHistories: getItem('TOUTIAO_SEARCH_HISTORIES') || [] // 搜索历史记录数据
    }
  },
  watch: {
    searchHistories(val) {
      // 同步到本地存储
      setItem('TOUTIAO_SEARCH_HISTORIES', val)
    }
  },
  methods: {
    onSearch(val) {
      // 更新文本框内容
      this.searchText = val

      // 存储搜索历史记录
      const index = this.searchHistories.indexOf(val)
      if (index !== -1) {
        this.searchHistories.splice(index, 1)
      }
      this.searchHistories.unshift(val)

      // 渲染处理结果
      this.isResultShow = true
    },
    onCancel() {
      this.$router.back()
    }
  }
}
</script>

<style lang="less" scoped>
.search-container {
  padding-top: 108px;
  .van-search__action {
    color: #fff;
  }
  .search-form {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
}
</style>
