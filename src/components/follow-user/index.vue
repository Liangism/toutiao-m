<template>
  <van-button
    v-if="isFollowed"
    class="follow-btn"
    round
    size="small"
    :loading="loading"
    @click="onFollow"
  >已关注</van-button>
  <van-button
    v-else
    class="follow-btn"
    type="info"
    color="#3296fa"
    round
    size="small"
    icon="plus"
    :loading="loading"
    @click="onFollow"
  >关注</van-button>
</template>

<script>
import { addFollow, deleteFollow } from '@/api/user'

export default {
  name: 'FollowUser',
  // 自定义组件的 v-model
  model: {
    prop: 'isFollowed',
    event: 'update-is_followed'
  },
  props: {
    isFollowed: {
      type: Boolean,
      required: true
    },
    authorId: {
      type: [Number, String, Object],
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async onFollow() {
      // 开启按钮的 loading 状态
      this.loading = true

      try {
        if (this.isFollowed) {
          // 已关注，则取消关注
          await deleteFollow(this.authorId)
        } else {
          // 否则添加关注
          await addFollow(this.authorId)
        }

        // 更新视图
        this.$emit('update-is_followed', !this.isFollowed)
      } catch (err) {
        let message = '操作失败，请重试'
        if (err.response && err.response.status === 400) {
          message = '不能关注自己哦~'
        }
        this.$toast.fail(message)
      }

      // 关闭按钮的 loading 状态
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>
</style>
