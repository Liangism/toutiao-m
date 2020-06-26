<template>
  <div class="update-birthday">
    <van-datetime-picker
      v-model="currentDate"
      type="date"
      title="生日"
      :min-date="minDate"
      :max-date="maxDate"
      @cancel="$emit('cancel')"
      @confirm="onConfirm"
    />
  </div>
</template>

<script>
import { updateUserProfile } from '@/api/user'
import dayjs from 'dayjs'

export default {
  name: 'UpdateBirthday',
  props: {
    value: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      minDate: new Date(1960, 0, 1),
      maxDate: new Date(),
      currentDate: new Date(this.value)
    }
  },
  methods: {
    async onConfirm() {
      this.$toast.loading({
        message: '保存中...',
        forbidClick: true, // 禁止背景点击
        duration: 0 // 持续展示
      })

      try {
        const currentDate = dayjs(this.currentDate).format('YYYY-MM-DD')

        await updateUserProfile({
          brithday: currentDate
        })

        // 更新视图
        this.$emit('input', currentDate)

        // 关闭弹层
        this.$emit('cancel')

        // 提示成功
        this.$toast.success('更新成功')
      } catch (err) {
        console.log(err)

        this.$toast.fail('更新失败')
      }
    }
  }
}
</script>

<style scoped lang="less">
</style>
