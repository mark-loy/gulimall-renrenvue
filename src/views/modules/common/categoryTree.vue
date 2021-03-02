<template>
  <div>
    <el-tree
      :data="cateTree"
      :props="defaultProps"
      :expand-on-click-node="false"
      node-key="catId"
      ref="cateTreeRef"
      @node-click="cateNodeClick"
    >
    </el-tree>
  </div>
</template>

<script>
import categoryApi from '@/api/product/category'

export default {
  data() {
    return {
      cateTree: [],
      defaultProps: {
        label: 'name',
        children: 'children'
      }
    }
  },
  created() {
    this.getCateTree()
  },
  methods: {
    /* 获取分类树形结构数据 */
    getCateTree() {
      categoryApi.getCateTree().then(res => {
        this.cateTree = res.data.categories
      })
    },
    /* 点击node时回调 */
    cateNodeClick(data, node) {
      // 判断tree节点点击的层级
      if (node.level === 3) {
        // 通知父组件
        this.$emit('cateNodeClick', data, node)
      }
    }
  }
}
</script>

<style scoped></style>
