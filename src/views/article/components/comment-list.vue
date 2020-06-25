<template>
  <div class="comment-list">
    <!-- 评论列表 -->
    <!-- list 在可视范围内才触发 onLoad -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="已显示全部评论"
      :error="error"
      error-text="加载失败，请点击重试"
      :immediate-check="false"
      @load="onLoad"
    >
      <comment-item
        v-for="(item, index) in list"
        :key="index"
        :comment="item"
        @reply-click="$emit('reply-click', $event)"
      />
    </van-list>
  </div>
</template>

<script>
import { getComments } from '@/api/comment'
import CommentItem from './comment-item'

export default {
  name: 'CommentList',
  components: {
    CommentItem
  },
  props: {
    source: {
      type: [Number, String, Object],
      requires: true
    },
    list: {
      type: Array,
      default: () => [] // 默认值
    },
    type: {
      type: String,
      // 自定义 Prop 数据验证
      validator(value) {
        return ['a', 'c'].includes(value)
      },
      default: 'a'
    }
  },
  data() {
    return {
      // list: [],
      loading: false,
      finished: false,
      error: false,
      offset: null, // 请求下一页数据的页码
      limit: 10
    }
  },
  created() {
    this.loading = true
    this.onLoad()
  },
  methods: {
    async onLoad() {
      try {
        // 1. 请求获取数据
        const { data } = await getComments({
          type: this.type, // 评论类型，a-对文章(article)的评论，c-对评论(comment)的回复
          source: this.source.toString(), // 源id，文章id或评论id
          offset: this.offset, // 获取评论数据的偏移量，值为评论id，表示从此id的数据向后取，不传表示从第一页开始读取数据
          limit: this.limit
        })

        // 2. 将数据添加到列表中
        const { results } = data.data
        this.list.push(...results)
        // 传递总数据条数
        this.$emit('onload-success', data.data)

        // 3. 将加载更多的 loading 设置为 false
        this.loading = false

        // 4. 判断是否还有数据
        if (results.length) {
          this.offset = data.data.last_id // 更新获取下一页数据的页码
        } else {
          this.finished = true
        }
      } catch (err) {
        this.error = true
        this.loading = false
      }
      this.finished = true
    }
  }
}
</script>

<style scoped lang="less">
</style>
