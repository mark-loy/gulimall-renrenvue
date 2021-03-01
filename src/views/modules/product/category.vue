<template>
  <div class="category">
    <el-button size="small" type="danger " @click="deleteBatchCate"
      >批量删除</el-button
    >
    <el-button size="small" v-if="isDrop" type="primary" @click="updateBatchCate"
      >保存</el-button
    >
    <el-switch v-model="isDrop" active-text="开启拖拽" inactive-text="关闭拖拽">
    </el-switch>
    <el-tree
      :data="cateTree"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox
      node-key="catId"
      :default-expanded-keys="expandCates"
      :draggable="isDrop"
      :allow-drop="allowDrop"
      @node-drop="dropEnd"
      @check-change="checkChange"
      ref="cateTreeRef"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            v-if="node.level < 3"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            添加
          </el-button>
          <el-button type="text" size="mini" @click="() => update(data)">
            修改
          </el-button>
          <el-button
            v-if="node.childNodes.length === 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <!-- 添加、修改分类对话框 -->
    <el-dialog
      :title="dialogText + '分类'"
      :visible.sync="dialogFormVisible"
      width="40%"
    >
      <el-form :model="cateForm" ref="cateFormRef" label-width="120px">
        <el-form-item label="分类名称" >
          <el-input v-model="cateForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="cateForm.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="cateForm.productUnit" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="cateForm.sort" :min="0" ></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetCateForm">取 消</el-button>
        <el-button type="primary" @click="submitCateForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import categoryApi from '@/api/product/category'

export default {
  data() {
    return {
      /* 分类树形数据 */
      cateTree: [],
      /* 树形组件参数配置 */
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      /* tree组件默认展开的分类id */
      expandCates: [],
      /* 对话框标题 */
      dialogText: '添加',
      /* 控制分类对话框显示、隐藏 */
      dialogFormVisible: false,
      /* 分类表单 */
      cateForm: {
        /* 分类id */
        catId: '',
        /* 分类名称 */
        name: '',
        /* 分级父级id */
        parentCid: 0,
        /* 层级 */
        catLevel: 1,
        /* 分类状态 */
        showStatus: 1,
        /* 排序 */
        sort: 0,
        /* 图标 */
        icon: '',
        /* 计量单位 */
        productUnit: '',
        /* 商品数量 */
        productCount: 0
      },
      /* 当前拖拽分类最终层级 */
      currentCateLevel: 0,
      /* 分类拖拽更新表单数组 */
      dropCatesForm: [],
      /* 批量删除分类的id数组 */
      deleteCatesId: [],
      /* 批量删除分类的name数组 */
      deleteCatesName: [],
      /* 控制是否拖拽 */
      isDrop: false
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
    /* 添加子分类对话框 */
    append(data) {
      // 打开分类表单对话框
      this.dialogFormVisible = true
      // 添加对话框
      this.dialogText = '添加'
      this.cateForm.parentCid = data.catId
      this.cateForm.catLevel = data.catLevel * 1 + 1
    },
    /* 修改子分类对话框 */
    update(data) {
      // 打开分类表单对话框
      this.dialogFormVisible = true
      // 添加对话框
      this.dialogText = '修改'
      // 获取分类数据
      this.getCateById(data.catId)
    },
    /* 移除分类 */
    remove(node, data) {
      this.$confirm(`是否删除【${data.name}】分类`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          categoryApi.removeBatchCate([data.catId]).then(res => {
            if (res.data.code === 0) {
              // 提示
              this.$message.success('删除分类成功')
              // 刷新数据
              this.getCateTree()
            } else {
              // 错误提示
              this.$message.success(res.data.msg)
            }
            // 设置默认展开的分类
            this.expandCates = [data.parentCid]
          })
        })
        .catch(() => {
          console.log('取消删除')
        })
    },
    /* 提交分类表单 */
    submitCateForm() {
      // 判断分类表单
      if (this.cateForm.catId) {
        // 修改
        this.updateCate()
      } else {
        // 添加
        this.saveCate()
      }
    },
    /* 保存子分类 */
    saveCate() {
      categoryApi.addCate(this.cateForm).then(res => {
        if (res.data.code === 0) {
          // 提示
          this.$message.success('添加分类成功')
          // 刷新数据
          this.getCateTree()
        } else {
          // 错误提示
          this.$message.success(res.data.msg)
        }
        // 设置默认展开的分类
        this.expandCates = [this.cateForm.parentCid]
        this.resetCateForm()
      })
    },
    /* 根据id获取分类 */
    getCateById(catId) {
      categoryApi.getCateById(catId).then(res => {
        // 设置分类表单
        this.cateForm = res.data.category
      })
    },
    /* 修改子分类 */
    updateCate() {
      categoryApi.updateCate(this.cateForm).then(res => {
        if (res.data.code === 0) {
          // 提示
          this.$message.success('修改分类成功')
          // 刷新数据
          this.getCateTree()
        } else {
          // 错误提示
          this.$message.success(res.data.msg)
        }
        // 设置默认展开的分类
        this.expandCates = [this.cateForm.catId]
        this.resetCateForm()
      })
    },
    /* 重置分类表单 */
    resetCateForm() {
      // 关闭对话框
      this.dialogFormVisible = false
      // 重置表单
      this.cateForm = {
        catId: '',
        name: '',
        parentCid: 0,
        catLevel: 1,
        showStatus: 1,
        sort: 0,
        icon: '',
        productUnit: '',
        productCount: 0
      }
    },
    /* tree组件元素是否允许拖拽 */
    allowDrop(draggingNode, dropNode, type) {
      // 判断当前拖拽分类是否存在子分类
      if (draggingNode.childNodes.length === 0) {
        // 没有子分类，设置当前分类层级
        this.currentCateLevel = 1
      } else {
        // 存在子分类，设置子分类层级，遍历子分类
        this.getChildCateLevel(draggingNode.childNodes, draggingNode.level)
      }
      // 计算出目标层级
      let targetLevel
      // 判断层级类型
      if (type === 'inner') {
        // 放在了目标层级内部
        targetLevel = dropNode.level
      } else {
        // 放在了目标层级前后
        targetLevel = dropNode.level - 1
      }
      // 将当前拖拽层级 + 目标层级 > 3 ==> 则不能拖拽
      if (this.currentCateLevel + targetLevel > 3) {
        return false
      }
      return true
    },
    /* 获取子分类最终层级 */
    getChildCateLevel(childNodes, level) {
      childNodes.forEach(item => {
        // 判断子分类是否存在子分类
        if (item.childNodes.length === 0) {
          // 计算当前拖拽分类层级
          this.currentCateLevel = item.level - level + 1
        } else {
          // 递归查询子分类层级
          this.getChildCateLevel(item.childNodes, level)
        }
      })
    },
    /* 拖拽完成时，回调 */
    dropEnd(currentNode, targetNode, type, event) {
      // 判断拖拽类型
      if (type === 'inner') {
        // 遍历目标node子分类
        for (let i = 0; i < targetNode.childNodes.length; i++) {
          const node = targetNode.childNodes[i]
          // 判断目标node与currentNode是否相等
          if (node.data.catId === currentNode.data.catId) {
            // 判断当前node是否存在子分类
            if (currentNode.childNodes.length !== 0) {
              // 存在子分类，则需要修改子分类的层级
              this.setChildCateLevel(
                currentNode.childNodes,
                targetNode.level + 1
              )
            }
            // 设置当前分类node数据
            const catId = currentNode.data.catId
            const sort = i
            const parentCid = targetNode.data.catId
            const catLevel = targetNode.level + 1
            this.dropCatesForm.push({ catId, sort, parentCid, catLevel })
          } else {
            // 设置目标node数据
            const catId = node.data.catId
            const sort = i
            this.dropCatesForm.push({ catId, sort })
          }
        }
        this.expandCates.push(targetNode.data.catId)
      } else {
        // 遍历目标node父级分类的子分类
        for (let i = 0; i < targetNode.parent.childNodes.length; i++) {
          const node = targetNode.parent.childNodes[i]
          // 判断目标node与currentNode是否相等
          if (node.catId === currentNode.catId) {
            // 判断分类是否存在子分类
            if (currentNode.childNodes.length !== 0) {
              // 存在子分类
              this.setChildCateLevel(currentNode.childNodes, targetNode.level)
            }
            // 设置当前分类node数据
            const catId = node.data.catId
            const sort = i
            const parentCid = targetNode.parent.data.catId
            const catLevel = targetNode.parent.level + 1
            this.dropCatesForm.push({ catId, sort, parentCid, catLevel })
          } else {
            // 设置兄弟分类的sort
            const catId = node.catId
            const sort = i
            this.dropCatesForm.push({ catId, sort })
          }
        }

        this.expandCates.push(targetNode.parent.data.catId)
      }
      this.expandCates.push(currentNode.data.parentCid)
      console.log(this.dropCatesForm)
    },
    /* 递归：设置子分类的层级 */
    setChildCateLevel(childNodes, parentLevel) {
      if (childNodes.length === 0) {
        return
      } else {
        // 遍历子分类
        childNodes.forEach(node => {
          const catId = node.data.catId
          const catLevel = parentLevel + 1
          this.dropCatesForm.push({ catId, catLevel })
          this.setChildCateLevel(node.childNodes, catLevel)
        })
      }
    },
    /* 批量修改分类 */
    updateBatchCate() {
      if (this.dropCatesForm.length > 0) {
        categoryApi.updateBatchCategory(this.dropCatesForm).then(res => {
          if (res.data.code === 0) {
            // 提示
            this.$message.success('拖拽修改分类成功')
            // 重新获取分类数据
            this.getCateTree()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      } else {
        this.$message.warning('请先拖拽分类')
      }
    },
    /* 节点选中状态发生变化时的回调 */
    checkChange() {
      const checkedCates = this.$refs.cateTreeRef.getCheckedNodes()
      let ids = []
      let names = []
      // 遍历
      checkedCates.forEach(cate => {
        ids.push(cate.catId)
        names.push(cate.name)
      })
      console.log(this.deleteCatesId)
      this.deleteCatesId = ids
      this.deleteCatesName = names
    },
    /* 批量删除被选中的节点分类 */
    deleteBatchCate() {
      if (this.deleteCatesId.length !== 0) {
        // 对批量删除分类的数据去重
        const catIds = Array.from(new Set(this.deleteCatesId))
        const names = Array.from(new Set(this.deleteCatesName))
        this.$confirm(`是否删除【${names}】?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            categoryApi.removeBatchCate(catIds).then(res => {
              if (res.data.code === 0) {
                this.$message.success('批量删除分类成功')
                // 刷新数据
                this.getCateTree()
              } else {
                this.$message.error(res.data.msg)
              }
            })
          })
          .catch(() => {
            console.log('取消删除')
          })
      } else {
        this.$message.warning('请先选择要删除的分类')
      }
    }
  }
}
</script>

<style scoped>
.category {
  width: 40%;
}

.el-tree {
  margin-top: 15px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
