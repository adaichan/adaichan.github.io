---
title: 常用正则汇总
date: 2021-10-10 00:00:00
author: adaichan
img: /medias/featureimages/50.jpg
coverImg:
cover: false
top: false
toc: true
mathjax: false
password:
summary: 
tags:
- PS
categories:
- 工具
---

### 一、使用插件

像excel.js、xlsx.js、js-export-excel这类插件都可以轻松实现

```js
npm install js-export-excel // 或者
yarn add js-export-excel
```

示例：

```js
import ExportJsonExcel from 'js-export-excel'
// 模拟数据
const tableItemConfig = [ { label: '序号', prop: 'index' },
    { label: '物料编码', prop: 'materialCode' },
    { label: '物料名称', prop: 'materialName' },
    { label: '规格型号', prop: 'specification', width: 150 },]
const arrayData = [{materialCode:10086,materialName:'篮球',specification:'20*20*20'}]
// 使用
const option: Record<string, any> = {}
option.fileName = '文件名'
option.datas = [
    {
        sheetData: arrayData, // 数组数据
        sheetName: '表格名',
        sheetFilter: tableItemConfig.map(i => i.prop), // 字段prop
        sheetHeader: tableItemConfig.map(i => i.label), // 字段中文
        columnWidths: tableItemConfig.map(i => (i.width ? Math.round(i.width / 15) : 5)), // 列宽
    },
]
const toExcel = new ExportJsonExcel(option)
toExcel.saveExcel()
```

### 二、接口返回

接口加工好返回，用a标签下载就行

```js
const downloadFile = (data: any, fileName: any, fileSuffix: any) => {
  let fileTypeMime = '' // 文件 mime 类型，移动端必传，否则下载不成功；pc端可传可不传
  switch (
    fileSuffix // 获取后缀对应的 mime
  ) {
    case 'png':
      fileTypeMime = 'image/png'
      break
    case 'doc':
      fileTypeMime = 'application/msword'
      break
    case 'docx':
      fileTypeMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      break
    case 'jpg':
    case 'jpeg':
      fileTypeMime = 'image/jpeg'
      break
    case 'gif':
      fileTypeMime = 'image/gif'
      break
    case 'svg':
      fileTypeMime = 'image/svg+xml'
      break
    case 'tif':
    case 'tiff':
      fileTypeMime = 'image/tiff'
      break
    case 'txt':
      fileTypeMime = 'text/plain'
      break
    case 'ppt':
      fileTypeMime = 'application/vnd.ms-powerpoint'
      break
    case 'pptx':
      fileTypeMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      break
    case 'xls':
      fileTypeMime = 'application/vnd.ms-excel'
      break
    case 'xlsx':
      fileTypeMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    case 'zip':
      fileTypeMime = 'application/zip'
      break
    case '7z':
      fileTypeMime = 'application/x-7z-compressed'
      break
  }

  const blob = window.URL.createObjectURL(
    new Blob([data], {
      type: fileTypeMime,
    })
  )
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = blob
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link) //下载完成移除元素
  window.URL.revokeObjectURL(blob) //释放掉 blob 对象
}

//临时表数据下载
export function downloadFiles(configCode: string, query: any) {
  return request({
    url: `/wms/wms-account/${configCode}/download`,
    method: 'get',
    params: query,
    responseType: 'blob',
  }).then((res) => {
    const fileName = window.decodeURI(
      res.headers['content-disposition'].substring(
        res.headers['content-disposition'].indexOf('filename=') + 9
      )
    )
    const fileSuffix = fileName.substring(fileName.indexOf('.'), fileName.length)
    downloadFile(res.data, fileName, fileSuffix)
  })
}
```

### 三、WebWorker

​	其实第一种办法简单方便，试了下我三年前的联想轻薄本10w条数据用脚本开销1.5s-3s完全可以接受。如果数据量确实很大而且需要进一步处理比如日期或其他字段的format会增加开销可以试下WebWorker。