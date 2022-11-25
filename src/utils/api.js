/* 接口配置 api.js */
import wepy from 'wepy'

const qs = require('qs');
const debug = false
const urlPrefixLocal = './data/'
// const urlPrefixRemote = 'http://192.168.88.166:5337' // 本地
// const urlPrefixRemote = 'http://localhost:1337' // 本地
const urlPrefixRemote = 'https://agaid.microripples.cn' 
// const urlPrefixRemote = 'http://192.168.88.166:5337' // 远程
const attachmentPath = urlPrefixRemote + '/attachment/'
const methods = { GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE' }
// +-------------------------------------
// | 接口Api配置
// +--------------------------------------
// | ['本地测试接口','远程接口','请求类型：1-GET,2-POST', '是否需要token，默认true']
// +--------------------------------------
const urlConfig = {
    login:                  ['', '/customers/login', methods.POST, false],   // 登录{code}
    upload:                 ['', '/upload', methods.POST],

    articles_list:          ['', '/articles', methods.GET],
    articles_info:          ['', '/articles/${0}', methods.GET],
    articles_save:          ['', '/articles', methods.POST],
    articles_update:        ['', '/articles/${0}', methods.PUT],
    articles_count:         ['', '/articles/count', methods.GET],

    atnews_list:            ['', '/atnews', methods.GET],
    atnews_info:            ['', '/atnews/${0}', methods.GET],
    atnews_update:          ['', '/atnews/${0}', methods.PUT],

    chats_list:             ['', '/chats', methods.GET],
    chats_save:             ['', '/chats', methods.POST],
    chats_delete:           ['', '/chats/${0}', methods.DELETE],

    category_list:          ['', '/categories', methods.GET],

    customers_update:       ['', '/customers/${0}', methods.PUT],

    carousels_list:         ['', '/carousels', methods.GET],

    consults_list:          ['', '/consults', methods.GET],
    consults_save:          ['', '/consults', methods.POST],

    collects_list:          ['', '/collects', methods.GET],
    collects_my:            ['', '/collects/me', methods.GET],
    collects_save:          ['', '/collects', methods.POST],
    collects_update:        ['', '/collects/${0}', methods.PUT],
    collects_delete:        ['', '/collects/${0}', methods.DELETE],

    professor_list:         ['', '/professors', methods.GET],
    professor_collect:      ['', '/professors/bycollect', methods.GET],
    professor_info:         ['', '/professors/${0}', methods.GET],
    professor_update:       ['', '/professors/${0}', methods.PUT],
    professor_save:         ['', '/professors', methods.POST],

    users_update:           ['', '/users/${0}', methods.PUT],
}

// +-------------------------------------
// | 获取接口URL
// +--------------------------------------
// | val  对应api的key
// +--------------------------------------
const getUrl = params => {
  if (!params) {
    toast('缺少key', 'none')
    return null
  }
  let val = null
  let isarray = params.constructor === Array
  if (isarray) {
    val = JSON.parse(JSON.stringify(params))
  } else {
    val = params
  }
  let key = isarray ? val.shift() : val,
    url = urlConfig[key]
  if (!url) {
    toast('没有 ' + key + ' 相关的 url 配置', 'none')
    return null
  }
  var url_local = urlPrefixLocal + url[0],
    // restful api 存在 url 需要拼接的情况，所以为了解决 'url/url/url/${0}' 这样的配置，使用了 mix() 方法
    url_remot = isarray ? mix(url[1], val) : url[1]
  // 如果没有配置远程 url，则采用本地 url，适用于有的数据在非 debug 模式下也采用本地 url 的情况
  var _url = url_remot
  if (!url_remot.startsWith('http')) {
    _url = debug || !url_remot ? url_local : urlPrefixRemote + url_remot
  }
  var isNeedAuth = url[3] === false ? false : true
  return [_url, url[2], isNeedAuth]
}
// +-------------------------------------
// | 接口错误信息提示
// +--------------------------------------
// | resolve  请求结果
// +--------------------------------------
const toast = (msg, type) => {
  isLoading = true
  wx.showToast({
    title: msg,
    icon: type,
    duration: 4000
  })
}

const msgModal = (_msg, _title = '') => {
  wx.showModal({
    title: _title,
    content: _msg,
    showCancel: false,
    success (res) {
    }
  })
}
// +-------------------------------------
// | urlConfig占位符${0}替换
// +--------------------------------------
// | str  对应api的key
// | group  要替换的值
// +--------------------------------------
const mix = (str, group) => {
  return str.replace(/\$\{[^{}]+\}/gm, function (m, n) {
    n = m.slice(2, -1)
    return (group[n] != void 1) ? group[n] : ''
  })
}


// 日期格式化 yyyy-MM-dd
const getUploadDate = () => {
    let date = new Date()
    let year = date.getFullYear()
    let month = addDatePrefix(date.getMonth() + 1)
    let day = addDatePrefix(date.getDate())

    return `${year}${month}${day}`
}
    // 给日、月添加前缀0
const addDatePrefix = (d) => {
    return `0${d}`.slice(-2)
}

// +-------------------------------------
// | request请求封装
// +--------------------------------------
// | urlPara  对应api的key
// | types 传递方式(1,GET,2,POST)
// | data  传递数据对象
// +--------------------------------------
var isLoading = false
var requestLimitConfig = {}
const commonAjax = (urlPara, data, types, loading) => {
  // 获取公共配置
  var app = getApp()
  // 公共参数
  // var d = {}
  // 获取api url及配置
  var key = urlPara.constructor === Array ? urlPara[0] : urlPara
  var _url = getUrl(urlPara)
  if (!_url) { return null }
  var url = _url[0]
  if (!types) { types = _url[1] }
  var isNeedAuth = _url[2]
  // 合并对象(公共参数加传入参数合并对象)
  // var datas = mergeObj(d, data)
  var datas = data
  // datas = JSON.stringify(datas);
  // ES6的Promise
  if (!isLoading && loading === true) {
    isLoading = true
    wx.showLoading({
      title: '加载中',
      mask: true
    })
  }
  var promise = new Promise(function (resolve, reject, defaults) {
    if (requestLimitConfig[_url] !== true) {
      requestLimitConfig[_url] = true
      // 封装reuqest
      wx.request({
        url: url,
        data: datas,
        method: types,
        header:  {
          'content-type': 'application/json; charset=utf-8',
          'Authorization': (isNeedAuth ? 'Bearer ' + wx.getStorageSync('agaid-weapp-token') : '')
        },
        success: function(res) {
          if (res.data.sessionId) {
            wx.setStorageSync('sessionId', res.data.sessionId)
          }
          // 第三方接口不做处理
          // if (isThird) {
          //   typeof resolve === 'function' && resolve(res)
          // } else {
            commonAjaxResolve(res, resolve, reject)
          // }
        },
        fail: reject,
        complete: function() {
          requestLimitConfig[_url] = false
          setTimeout(function() {
            let isAllFinished = true
            for(var key in requestLimitConfig) {
              if (requestLimitConfig[_url] === true) {
                isAllFinished = false
              }
            }
            if (isAllFinished && isLoading === true) {
              isLoading = false
              setTimeout(() => {
                wx.hideLoading()
              }, 100)
              requestLimitConfig = {}
            }

          }, 100)
          // if (isLoading === true) {
          //     isLoading = false
          //     wx.hideLoading()
          // }
          defaults && defaults()
        }
      })
    }
  })
  return promise
}

// +-------------------------------------
// | request请求封装 - 结果处理
// +--------------------------------------
// | res  request返回结果
// | callback 回调
// +--------------------------------------
const commonAjaxResolve = (res, callback, failCallback) => {
  var app = getApp()
  if (res.data || res.data.id || res.data.length > 0) {
    callback && callback(res)
  }  else {
    wx.hideLoading()
    isLoading = false
    setTimeout(() => {
      toast(res.data.msg, 'none')
    }, 0)
    failCallback && failCallback(res)
  }
  // if (res.data.code === 200 || res.data.code === 0 || res.data.code > 5000) { // 成功或未注册或特殊提示
  //   // typeof callback === 'function' && callback(res)
  //   callback && callback(res)
  // } else if (res.data.code === 100) { // 超时
  //   wx.reLaunch({
  //     url: '/pages/index'
  //   })
  // } else if (res.data.code === 403 || res.data.code === 401) {
  //   wx.reLaunch({
  //     url: '/pages/login'
  //   })
  // } else {
  //   wx.hideLoading()
  //   isLoading = false
  //   setTimeout(() => {
  //     toast(res.data.msg, 'none')
  //   }, 0)
  //   failCallback && failCallback(res)
  // }
}

// +-------------------------------------
// | object 对象合并
// +--------------------------------------
// | o1     对象一
// | o2     对象二
// +--------------------------------------
const mergeObj = (o1, o2) => {
  for (var key in o2) {
    o1[key] = o2[key]
  }
  return o1
}

// +-------------------------------------
// | request请求封装 - 配置获取get/post
// +--------------------------------------
// | urlPara  对应api的key
// | data  传递数据对象
// +--------------------------------------
const $request = (urlPara, data, needLoading) => {
  if (!data) { data = {} }
  if (needLoading !== false) {
    needLoading = true
  }
  return commonAjax(urlPara, data, false, needLoading)
}

// +-------------------------------------
// | request请求封装 - get
// +--------------------------------------
// | urlPara  对应api的key
// | data  传递数据对象
// +--------------------------------------
const $get = (urlPara, data) => {
  return commonAjax(urlPara, data, 1)
}

// +-------------------------------------
// | request请求封装 - post
// +--------------------------------------
// | urlPara  对应api的key
// | data  传递数据对象
// +--------------------------------------
const $post = (urlPara, data) => {
  return commonAjax(urlPara, data, 2)
}

// +-------------------------------------
// | 图片、视频上传
// +--------------------------------------
// | config： {max: 5}：max：最多可选张数，callback 回调
// +--------------------------------------
const uploadMedia = (config, callback) => {
    var that = this;
    if (!config.max) {
        config.max =  6
    }
    if (!config.mediaType) {
        config.mediaType = ['image', 'video']
    }
    let up_path = 'customer/' + getUploadDate()
    wx.chooseMedia({
        count: config.max,  //最多可以选择的图片总数
        mediaType: config.mediaType,  // 文件类型
        sizeType:  ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        maxDuration: 30,            // 拍摄视频最长拍摄时间，单位秒。时间范围为 3s 至 30s 之间
        success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var tempFiles = res.tempFiles;
            var type = res.type;    // 文件类型，有效值有 image 、video
            //启动上传等待中...
            wx.showToast({
                title: '正在上传...',
                icon: 'loading',
                mask: true,
                duration: 10000
            })
            var uploadCount = 0;
            var _url = getUrl('upload');
            if (!_url) {
                return null
            }
            var url = _url[0];
            var _header = {
                'content-type': 'multipart/form-data',
                'Authorization': 'Bearer ' + wx.getStorageSync('agaid-weapp-token')
            };
            var _mediaList = [];
            for (var i = 0, h = tempFiles.length; i < h; i++) {
                var file = tempFiles[i];
                wx.uploadFile({
                    url: url,
                    filePath: file.tempFilePath,
                    name: 'files',
                    header: _header,
                    formData: { fileInfo: JSON.stringify({alternativeText: 'wechat', caption: 'wechat'}), path: up_path},
                    success: function (ret) {
                        var data = JSON.parse(ret.data);
                        uploadCount++;
                        if (_mediaList == null) {
                            _mediaList = [];
                        }
                        if (data && data.length > 0) {
                            let media = data[0]
                            media['type'] = file.fileType
                            _mediaList.push(media);
                        }

                        //如果是最后一张,则隐藏等待中
                        if (uploadCount >= tempFiles.length) {
                            wx.hideToast();
                            typeof callback == "function" && callback(_mediaList)
                        }
                    },
                    fail: function (res) {
                        wx.hideToast();
                        wx.showModal({
                            title: '出错了~',
                            content: '上传失败',
                            showCancel: false,
                            success: function (res) { }
                        })
                    }
                });
            }
        }
    });
}
// 上传封面图
const uploadMediaCover = (_mediaList, coverFiles, callback) => {
    var uploadCount = 0;
    var _header = {
        'content-type': 'multipart/form-data',
        'Cookie': 'JSESSIONID=' + wx.getStorageSync('sessionId'),
        'token': wx.getStorageSync('covid-weapp-token')
    };
    for (var i = 0, h = coverFiles.length; i < h; i++) {
        var file = coverFiles[i];
        var _url = getUrl(['upload_cover', file.parent]);
        if (!_url) {
            return null
        }
        var url = _url[0];
        wx.uploadFile({
            url: url,
            filePath: file.thumbTempFilePath,
            name: 'files',
            header: _header,
            success: function (ret) {
                var data = JSON.parse(ret.data);
                uploadCount++;
                if (data && data.length > 0) {
                    var cur = _mediaList.findIndex(val => {return val.id == file.parent})
                    if (cur > -1) {
                        _mediaList[cur]['cover'] = data[0].url
                    }
                }

                //如果是最后一张,则隐藏等待中
                if (uploadCount >= coverFiles.length) {
                    console.log(_mediaList)
                    wx.hideToast();
                    typeof callback == "function" && callback(_mediaList)
                }
            },
            fail: function (res) {
                wx.hideToast();
                wx.showModal({
                    title: '出错了~',
                    content: '上传图片失败',
                    showCancel: false,
                    success: function (res) { }
                })
            }
        });
    }
}

module.exports = {
  mergeObj: mergeObj,
  $request: $request,
  $get: $get,
  $post: $post,
  getUrl: getUrl,
  toast: toast,
  msgModal: msgModal,
  attachmentPath: attachmentPath,
  uploadMedia: uploadMedia
}
