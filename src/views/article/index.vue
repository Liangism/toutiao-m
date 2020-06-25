<template>
  <div class="article-container">
    <!-- 导航栏 -->
    <van-nav-bar class="page-nav-bar" left-arrow title="文章详情" @click-left="$router.back()"></van-nav-bar>

    <div class="main-wrap">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-wrap">
        <van-loading color="#3296fa" vertical>加载中</van-loading>
      </div>

      <!-- 加载完成-文章详情 -->
      <div v-else-if="article.title" class="article-detail">
        <!-- 文章标题 -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- 用户信息 -->
        <van-cell class="user-info" center :border="false">
          <van-image class="avatar" slot="icon" round fit="cover" :src="article.aut_photo" />
          <div slot="title" class="user-name">{{ article.aut_name }}</div>
          <div slot="label" class="publish-date">{{ article.pubdate | relativeTime }}</div>

          <!-- 优化 -->
          <!-- :is-followed="article.is_followed"
          @update-is_followed="article.is_followed = $event"-->

          <follow-user
            class="follow-btn"
            v-model="article.is_followed"
            :author-id="article.aut_id"
          />
        </van-cell>

        <!-- 文章内容 -->
        <div class="article-content markdown-body" v-html="article.content" ref="article-content"></div>
        <van-divider>正文结束</van-divider>

        <!-- 文章评论列表 -->
        <comment-list
          :source="article.art_id"
          :list="commentList"
          @onload-success="totalCommentCount = $event.total_count"
          @reply-click="onReplyClick"
        />

        <!-- 底部区域 -->
        <div class="article-bottom">
          <van-button
            class="comment-btn"
            type="default"
            round
            size="small"
            @click="isPostShow = true"
          >写评论</van-button>
          <van-icon class="comment-icon" name="comment-o" :info="totalCommentCount" color="#777" />
          <collect-article
            class="btn-item"
            v-model="article.is_collected"
            :article-id="article.art_id"
          />
          <like-article class="btn-item" v-model="article.attitude" :article-id="article.art_id" />
          <van-icon name="share" color="#777"></van-icon>
        </div>

        <!-- 发布评论 -->
        <van-popup v-model="isPostShow" closeable position="bottom">
          <comment-post :target="article.art_id" @post-success="onPostSuccess" />
        </van-popup>
      </div>

      <!-- 加载失败：404 -->
      <div v-else-if="errStatus === 404" class="error-wrap">
        <van-icon name="failure" />
        <p class="text">该资源不存在或已删除！</p>
      </div>

      <!-- 加载失败：其它未知错误（例如网络原因或服务端异常） -->
      <div v-else class="error-wrap">
        <van-icon name="failure" />
        <p class="text">内容加载失败！</p>
        <van-button class="retry-btn" @click="loadArticle">点击重试</van-button>
      </div>
    </div>

    <!-- 评论回复 -->
    <!-- 弹出层懒渲染，只有在第一次展示时才渲染内容，之后的关闭和显示都是在切换内容的隐藏和显示 -->
    <van-popup v-model="isReplyShow" position="bottom" style="height: 95%">
      <!-- v-if 条件渲染 -->
      <comment-reply v-if="isReplyShow" :comment="currentComment" @close="isReplyShow = false" />
    </van-popup>
  </div>
</template>

<script>
import { getArticleById } from '@/api/article'
import { ImagePreview } from 'vant'
import FollowUser from '@/components/follow-user'
import CollectArticle from '@/components/collect-article'
import LikeArticle from '@/components/like-article'
import CommentList from './components/comment-list'
import CommentPost from './components/comment-post'
import CommentReply from './components/comment-reply'

export default {
  name: 'ArticleIndex',
  components: {
    FollowUser,
    CollectArticle,
    LikeArticle,
    CommentList,
    CommentPost,
    CommentReply
  },
  // 依赖注入
  provide: function() {
    return {
      articleId: this.articleId
    }
  },
  props: {
    articleId: {
      type: [Number, String, Object],
      required: true
    }
  },
  data() {
    return {
      article: {}, // 文章详情
      loading: true, // 加载中的 loading 状态
      errStatus: 0, // 失败状态码
      isFollowLoading: false,
      totalCommentCount: 0,
      isPostShow: false, // 控制发布评论的显示状态
      commentList: [], // 评论列表
      isReplyShow: false,
      currentComment: {} // 当前点击回复的评论项
    }
  },
  created() {
    this.loadArticle()
  },
  methods: {
    async loadArticle() {
      this.loading = true
      try {
        const { data } = await getArticleById(this.articleId)
        // 数据驱动视图有延迟
        this.article = data.data
        // 初始化图片点击预览
        setTimeout(() => {
          this.previewImage()
        }, 0)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.errStatus = 404
        }
        console.log('获取数据失败', err)
      }
      // 无论是否请求成功都关闭 loading
      this.loading = false
    },
    previewImage() {
      // 得到所有的 img 节点
      const articleContent = this.$refs['article-content']
      const imgs = articleContent.querySelectorAll('img')
      const images = []
      imgs.forEach((img, index) => {
        images.push(img.src)
        img.onclick = () => {
          ImagePreview({
            // 预览的图片地址数组
            images,
            // 起始位置
            startPosition: index
          })
        }
      })
    },
    onPostSuccess(data) {
      // 关闭弹出层
      this.isPostShow = false
      // 将发布内容显示到列表顶部
      this.commentList.unshift(data.new_obj)
    },
    onReplyClick(comment) {
      this.currentComment = comment
      // 显示弹出层
      this.isReplyShow = true
    }
  }
}
</script>

<style scoped lang="less">
@import './github-markdown.css';

.article-container {
  .main-wrap {
    position: fixed;
    left: 0;
    right: 0;
    top: 92px;
    bottom: 88px;
    overflow-y: scroll;
    background-color: #fff;
  }
  .article-detail {
    .article-title {
      font-size: 40px;
      padding: 50px 32px;
      margin: 0;
      color: #3a3a3a;
    }

    .user-info {
      padding: 0 32px;
      .avatar {
        width: 70px;
        height: 70px;
        margin-right: 17px;
      }
      .van-cell__label {
        margin-top: 0;
      }
      .user-name {
        font-size: 24px;
        color: #3a3a3a;
      }
      .publish-date {
        font-size: 23px;
        color: #b7b7b7;
      }
      .follow-btn {
        width: 170px;
        height: 58px;
        line-height: 58px !important;
      }
    }

    .article-content {
      padding: 55px 32px;
      /deep/ p {
        text-align: justify;
      }
    }
  }

  .loading-wrap {
    padding: 200px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }

  .error-wrap {
    padding: 200px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    .van-icon {
      font-size: 122px;
      color: #b4b4b4;
    }
    .text {
      font-size: 30px;
      color: #666666;
      margin: 33px 0 46px;
    }
    .retry-btn {
      width: 280px;
      height: 70px;
      line-height: 70px;
      border: 1px solid #c3c3c3;
      font-size: 30px;
      color: #666666;
    }
  }

  .article-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-sizing: border-box;
    height: 88px;
    border-top: 1px solid #d8d8d8;
    background-color: #fff;
    .comment-btn {
      width: 282px;
      height: 46px;
      border: 2px solid #eeeeee;
      font-size: 30px;
      line-height: 46px;
      color: #a7a7a7;
    }
    /deep/ .van-icon {
      font-size: 40px;
    }
    .comment-icon {
      top: 2px;
      color: #777;
      .van-info {
        font-size: 16px;
        background-color: #e22829;
      }
    }
    .btn-item {
      border: none;
      padding: 0;
      height: 40px;
      line-height: 40px;
      color: #777777;
    }
    .collect-btn--collected {
      color: #ffa500;
    }
    .like-btn--liked {
      color: #e5645f;
    }
  }
}
</style>
