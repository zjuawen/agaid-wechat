import wepy from 'wepy'
import api from '../utils/api'

export default class baseMixin extends wepy.mixin {
    data = {
        pageLoading: null,
        pageLoadinger: null,
        queryConfig: {
            key: '',
            loading: false,
            finished: false,
            refreshing: false,
            base: {
                page: 0,
                limit: 10
            },
            list: [],
        },
        collectLoading: false,
        pointType: {
            'POINT_REGISTER': 1,
            'POINT_INFO': 2,
            'POINT_SIGN_DAY': 3,
            'POINT_SIGN_SEVEN': 4,
            'POINT_VIDEO': 5,
            'POINT_QUESTION': 6,
            'POINT_SIGN': 7
        },

        playTime: 0, // 观看总时间，ms
        playInterval: {},
        playProgress: 3000,
        playIntervalDur: 100
    }

    methods = {
        // 微信授权获取手机号
        getPhoneNumber(e) {
            let _this = this
            let data = e.currentTarget.dataset
            let _main = data.main
            let _sub = data.sub

            api.$request(['get_mobile', e.detail.code]).then(({data}) => {
                if (data.code === 0) {
                    _this[_main][_sub] = data.phoneNumber
                    let wxuser = wepy.$instance.globalData.wxuser
                    wxuser.phoneNumber = data.phoneNumber
                    _this.handleUpdateWxuser(wxuser)
                    _this.$apply()
                }
            })
        },
        videoBindPlay() {
            this.playInterval = setInterval(() => {
                this.playTime += this.playIntervalDur
                
                if (this.playTime > this.playProgress) {
                    this.playTime = this.playTime - this.playProgress
                    this.handleUpdatePlay()
                }
            }, this.playIntervalDur)
        },
        videoBindPause() {
            clearInterval(this.playInterval)
        },
        emptyFunc() {
            
        }
    }


    onUnload() {
        console.log('onUnload', this.playTime)
    }

    // 更新微信用户信息
    handleUpdateWxuser(wxuser) {
        api.$request('bind', wxuser).then(({data}) => {})
    }

    handleCheckWords(_openid, _content, callback) {
        let checkForm = {
            openid: _openid,
            content: _content
        }
        api.$request('check_word', checkForm , true, false).then(({data}) => {
            if (data.errcode==0) {
                if (data.result.suggest == 'pass') {
                    callback && callback()
                } else {
                    api.toast('提交的内容不合规，请重新填写', 'none')
                }
            } else {
                api.toast('操作失败', 'none')
            }
        })
    }

    handleCheckFile(_openid, _url, _type, callback) {
        let checkForm = {
            openid: _openid,
            medias: _url,
            type: _type
        }
        api.$request('check_file', checkForm , true, false).then(({data}) => {
            if (data.errcode==0) {
                if (data.result.suggest == 'pass') {
                    callback && callback()
                } else {
                    api.toast('提交的内容不合规，请重新填写', 'none')
                }
            } else {
                api.toast('操作失败', 'none')
            }
        })
    }

    // 获取对象多层级对应key的值
    handleGetObjectValue(data, key) {
        let value = ''
        if ((typeof key).toLowerCase() == 'object' && key.constructor == Array) {
            key.forEach(item => {
                if (item.type == 2) {
                    value += item.key
                } else {
                    let keys = item.key.split('.')
                    let res = data
                    for(let i in keys){
                        res = res[keys[i]]
                    }
                    value += res
                }
            })
        } else {
            let keys = key.split('.')
            let res = data
            for(let i in keys){
                res = res[keys[i]]
            }
            value = res
        }
        return value
    }

    // 图片转base64
    handleBgBase64(path) {
        let bs = 'data:image/png;base64,' + wx.getFileSystemManager().readFileSync(path, 'base64');
        return bs
    }

    // 获取列表
    handleFetchList (reload, callback, beforeFnc) {
        if (this.queryConfig.loading) {
            return
        }
        this.queryConfig.loading = true
        if (reload) {
            this.queryConfig.base.page = 1
            this.queryConfig.finished = false
            this.queryConfig.list = []
        } else {
            this.queryConfig.base.page += 1
        }
        if (!this.queryParams) {
            this.queryParams = {}
        }
        this.$apply()
        let _params = Object.assign({_start: (this.queryConfig.base.page-1)*this.queryConfig.base.limit, _limit: this.queryConfig.base.limit, _sort: 'updated_at:DESC' }, this.queryParams)
        api.$request(this.queryConfig.key, _params, false, true).then(({data}) => {
            if (data && data.length > 0) {
                data.forEach(v => {
                    if (v.created_at) {
                        v.created_at = this.handleDateView(v.created_at)
                    }
                    if (v.updated_at) {
                        v.updated_at = this.handleDateView(v.updated_at)
                    }
                })
                this.queryConfig.list = this.queryConfig.list.concat(data)
                if (data.length < this.queryConfig.base.limit) {
                    this.queryConfig.finished = true
                }
                if (beforeFnc) {
                    this.queryConfig.list = beforeFnc(this, this.queryConfig.list)
                }
                callback && callback(this, this.queryConfig.list)
            } else {
                this.queryConfig.finished = true
            }
            this.$apply()
        }).catch((err) => {
            this.queryConfig.finished = true
            this.$apply()
        }).finally(() => {
            this.queryConfig.loading = false
            if(this.queryConfig.refreshing) {
                this.queryConfig.refreshing = false
            }
            this.$apply()            
        })
    }
    
    // 点赞收藏
    handleSetCollect(params, isCollect, callback) {
        let _this = this
        if (_this.collectLoading) {
            return
        }
        let collectCN = ['', '收藏', '关注', '点赞', '点赞', '收藏']
        if (isCollect) {
            _this.collectLoading = true
            api.$request('collects_save', params , true, false).then(({data}) => {
                if (data && data.id) {
                    wepy.$instance.globalData.collects.push(data)
                    callback && callback(data)
                    api.toast(collectCN[params.type]+'成功', 'success')
                } else {
                    api.toast(data.msg, 'none')
                }
            }).finally(() => {
                _this.collectLoading = false
            })
        } else {
            _this.collectLoading = true
            api.$request(['collects_delete', params.id], {} , true, false).then(({data}) => {
                if (data && data.id) {
                    let cidx = wepy.$instance.globalData.collects.findIndex(v => { return v.id==params.id })
                    wepy.$instance.globalData.collects = wepy.$instance.globalData.collects.splice(cidx, -1)
                    _this.$apply()
                    callback && callback(data)
                    api.toast('取消成功', 'success')
                } else {
                    api.toast(data.msg, 'none')
                }
            }).finally(() => {
                _this.collectLoading = false
            })
        }
    }

    handleSetPoint(params, callback) {
        // type: 1-注册;2-完善信息;3-每日签到;4-连续签到;5-观看视频15分钟;6-专家资讯;7-报名
        // let params = {
        //     userId: userId,
        //     type: type,
        //     action: action,
        //     desc: desc
        // }
        api.$request('integrals_add', params, true, false).then(({data}) => {
            callback && callback(data)
        })
    }

    handleExchange(params, callback) {
        api.$request('exchangegoods_exchange', params, true, false).then(({data}) => {
            if (data && data.code==0) {
                wepy.$instance.globalData.appuser.points = wepy.$instance.globalData.appuser.points - data.data.integral
                this.$apply()
            }
            callback && callback(data)
        })
    }

    handleUpdatePlay(callback) {
        api.$request('checkins_video', {time: Math.floor(this.playProgress/1000)}, false).then(({data}) => {
            if (data && data.code == 0) {
                if (data.msg) {
                    api.toast(data.msg, 'none')
                }
            }
            callback && callback(data)
        })
    }

    handleSetSearch(keyword) {
        let words = wx.getStorageSync('AGAID_SEARCH_HISTORY')
        if (!words) {
            words = []
        }
        if (keyword) {
            let idx = words.findIndex(v => { return v == keyword })
            if (idx > -1) {
                words.splice(idx, 1)
            }
            words.unshift(keyword)
        }
        if (words.length > 10) {
            words.spilce((words.length - 1), 1)
        }
        wx.setStorageSync('AGAID_SEARCH_HISTORY', words)
    }

    handleSetHistory(type, data) {
        let history = wx.getStorageSync('AGAID_HISTORY')
        if (!history) {
            history = []
        }
        let curData = JSON.parse(JSON.stringify(data))
        if (curData && curData.id) {
            let idx = history.findIndex(v => { return (v.type==type&&v.data.id == curData.id)})
            if (idx > -1) {
                history.splice(idx, 1)
            }
            let hitem = {
                type: type,
                data: curData
            }
            history.unshift(hitem)
        }
        if (history.length > 30) {
            history.spilce((history.length - 1), 1)
        }
        wx.setStorageSync('AGAID_HISTORY', history)
    }

    // 同步获取字典
    handleFetchDictItems(types) {
        if (!types) {
            return []
        }
        let isarray = types.constructor === Array
        let key = isarray ? types : [types]

        api.$request('get_dict', { type_in: key }, true, false).then(({data}) => {
            if (data) {
                return data.list
            }
            return []
        })
    }

    // 字典列表转对象使用
    handleTranslateDictToObj(item) {
        let dictItems = {}
        item.forEach(val => {
            dictItems[val.type + '_' + val.code] = val.value
        })
        return dictItems
    }

    treeDataTranslate (data, id = 'id', pid = 'parentId', childrenStr = 'children') {
      var res = []
      var temp = {}
      for (var i = 0; i < data.length; i++) {
        temp[data[i][id]] = data[i]
      }
      for (var k = 0; k < data.length; k++) {
        if (temp[data[k][pid]] && temp[data[k][pid]][id] != 0 && data[k][id] !== data[k][pid]) {
          if (!temp[data[k][pid]][childrenStr]) {
            temp[data[k][pid]][childrenStr] = []
          }
          // if (!temp[data[k][pid]]['_level']) {
          //   temp[data[k][pid]]['_level'] = 1
          // }
          // data[k]['_level'] = temp[data[k][pid]]._level + 1
          temp[data[k][pid]][childrenStr].push(data[k])
        } else {
          res.push(data[k])
        }
      }
      res = this.setTreeLevel(res, childrenStr, 1)
      return res
    }

    setTreeLevel(items, childrenStr, level) {
      items.forEach(v => {
        v['_level'] = level
        if (v[childrenStr] && v[childrenStr].length > 0) {
          this.setTreeLevel(v[childrenStr], childrenStr, level + 1)
        }
      })
      return items
    }

    // 树转array
    handleTreeToList(data, childId) {
        let area = []
        data.forEach(v => {
            let children = v[childId] || []
            delete v[childId]
            area.push(v)
            if (children && children.length > 0) {
                let clds = this.handleTreeToList(children, childId)
                area.push(...clds)
            }
        })

        return area
    }

    // 更新单条数据
    handleUpdateRowInfo(main_key, query_key, data_key, row) {
        let cid = this.queryConfig.list[row][main_key]
        api.$request([query_key, cid]).then(({data}) => {
            if (data && data.code === 0) {
                this.queryConfig.list[row] = data[data_key]
                this.$apply()
            }
        })
    }

    // 页面跳转
    handlePageJump (_path, _params, type = 'query') {
        let _paramsObj = _params || {}
        let _base = { t: new Date().getTime() }
        let curParams = Object.assign(_paramsObj, _base)
        this.$navigate(_path, curParams)
    }

    // 返回上一页
    pageBack (isDelay, reload, params = null) {
        if (reload) {
            wx.setStorageSync('packBackReload', true)
            wx.setStorageSync('packBackReloadParams', params)
        } else {
            wx.setStorageSync('packBackReload', false)
        }
        if (isDelay) {
            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        } else {
            wx.navigateBack()
        }
    }

    // 返回上一页刷新
    handleCheckPageBackReload (callback) {
        var isReload =  wx.getStorageSync('packBackReload')
        if (isReload === true) {
            var params = wx.getStorageSync('packBackReloadParams')
            wx.setStorageSync('packBackReload', false)
            wx.setStorageSync('packBackReloadParams', null)
            callback && callback(params);
        }
    }

    // 预览图片或视频
    handlePreviewMedia(files, index) {
        if (files && files.length > 0) {
            let _source = []
            files.forEach(val => {
                let _type = this.handleGetMediaType(val.mime)
                _source.push({
                    url: val.url,
                    type: _type
                })
            })
            wx.previewMedia({
                sources: _source,
                current: index
            })
        }
    }

    handleGetMediaType(mime) {
        let str = mime.split('/')
        if (str && str.length > 0) {
            return str[0]
        }
        return 'none'
    }

    // 时间显示
    handleDateView(tsString) {
      if (!tsString) {
        return ''
      }
      return this.handleFormatDate(new Date(tsString).toLocaleString("cn", {hour12: false}), 'full');
    }

    // 获取日期星期
    handleFormatWeek(d) {
        if (!d) {
            return '';
        }
        let date = new Date(d);
        let day = date.getDay();
        let weeks = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六");
        let currentWeek = weeks[day];
        return currentWeek;
    }

    // 日期格式化 yyyy-MM-dd
    handleFormatDate(d, type) {
        if (!d) {
            return ''
        }
        let date = null
        if (d instanceof Date) {
            date = d
        } else {
            d = d.replace(/-/g, '/')
            date = new Date(d)
        }
        let year = date.getFullYear()
        let month = this.addDatePrefix(date.getMonth() + 1)
        let day = this.addDatePrefix(date.getDate())
        let hour = this.addDatePrefix(date.getHours())
        let minute = this.addDatePrefix(date.getMinutes())
        let second = this.addDatePrefix(date.getSeconds())

        if (type == 'month') {
          return `${month}-${day}`
        } else if (type == 'year-month-cn') {
          return `${year}年${month}月`
        } else if (type == 'full-cn') {
          return `${year}年${month}月${day}日`
        } else if (type == 'date') {
          return `${year}-${month}-${day}`
        } else if (type == 'time') {
          return `${hour}:${minute}:${second}`
        } else if (type == 'minute') {
          return `${hour}:${minute}`
        } else if (type == 'month-minute') {
          return `${month}-${day} ${hour}:${minute}`
        } else if (type == 'all-cn') {
          return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
        } else if (type == 'no-second'){
          return `${year}-${month}-${day} ${hour}:${minute}`
        } else {
          return `${year}-${month}-${day} ${hour}:${minute}:${second}`
        }
    }

    // 身份证验证
    handleCheckIdNumber(str) {
        var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (pattern.test(str)) {
            return true;
        }else{
            return false;
        }
    }

    // 手机号验证
    handleCheckPhone(str) {
        var pattern = /^[1][3-8]+\d{9}$/;
        if (pattern.test(str)) {
            return true;
        }else{
            return false;
        }
    }

    // 给日、月添加前缀0
    addDatePrefix (d) {
        return `0${d}`.slice(-2)
    }

    handleGetPathParams (path, name) {
        if (path.indexOf('?') > -1) {
            path = path.split('?')[1]
        }
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
        let r = path.match(reg)
        let strValue = ''
        if (r != null) {
            strValue = unescape(r[2])
        }
        return strValue
    }
    
    validMobile (val) {
        var res = true

        var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        var res = reg.test(val);

        return res;
    }
}
