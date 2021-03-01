import http from '@/utils/httpRequest'

const api_pre = "/pms/category"

export default {
  /* 批量修改分类数据 */
  updateBatchCategory(dropCatesForm) {
    return http({
      method: 'put',
      url: http.adornUrl(`${api_pre}/update/batch`),
      data: http.adornData(dropCatesForm, false)
    })
  },
  /* 获取树形分类数据 */
  getCateTree() {
    return http({
      method: 'get',
      url: http.adornUrl(`${api_pre}/list/tree`),
    })
  },
  /* 批量删除分类 */
  removeBatchCate(cateIds) {
    return http({
      method: 'delete',
      url: http.adornUrl(`${api_pre}/delete`),
      data: http.adornData(cateIds, false)
    })
  },
  /* 添加分类 */
  addCate(cateForm) {
    return http({
      method: 'post',
      url: http.adornUrl(`${api_pre}/save`),
      data: http.adornData(cateForm)
    })
  },
  /* 修改分类 */
  updateCate(cateForm) {
    return http({
      method: 'put',
      url: http.adornUrl(`${api_pre}/update`),
      data: http.adornData(cateForm)
    })
  },
  /* 通过id获取分类信息 */
  getCateById(cateId) {
    return http({
      method: 'get',
      url: http.adornUrl(`${api_pre}/info/${cateId}`)
    })
  }
}
