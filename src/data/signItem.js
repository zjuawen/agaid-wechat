// options
// -- type: 1-选择；2-带输入框；
let _questions = [{
	title: '报名信息',
	items: [
		{
			code: 'A01',
			title: '姓名',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A02',
			title: '性别',
			type: 'radio',
			value: '',
			options: [
				{name: '男', value: '男', type: 1},
				{name: '女', value: '女', type: 1}
			]
		},
		{
			code: 'A03',
			title: '出生年月',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A04',
			title: '民族',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A05',
			title: '文化程度',
			type: 'radio',
			value: '',
			options: [
				{name: '小学', value: '小学', type: 1},
				{name: '初中', value: '初中', type: 1},
				{name: '高中/中专', value: '高中/中专', type: 1},
				{name: '大专', value: '大专', type: 1},
				{name: '大学及以上', value: '大学及以上', type: 1}
			]
		},
		{
			code: 'A06',
			title: '政治面貌',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A07',
			title: '身份证',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A08',
			title: '手机号',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: '',  inpType: 'number'}
			]
		},
		{
			code: 'A09',
			title: '户籍所在地',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A10',
			title: '单位名称',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
		{
			code: 'A11',
			title: '人员类型',
			type: 'radio',
			value: '',
			options: [
				{name: '种植大户', value: '种植大户', type: 1},
				{name: '规模养殖场经营者', value: '规模养殖场经营者', type: 1},
				{name: '家庭农场经营者', value: '家庭农场经营者', type: 1},
				{name: '农民合作社骨干', value: '农民合作社骨干', type: 1},
				{name: '其他', value: '其他', type: 1}
			]
		},
		{
			code: 'A12',
			title: '是否参加过高素质农业培训班',
			header: {
				title: '学习培训经历：'
			},
			type: 'radio',
			options: [
				{name: '参加过', value: '参加过', type: 3, options: [
					{value: '', prefix: '  最近一次参加', suffix: '', width: 300, placeholder: '时间'},
					{value: '', prefix: '，培训时间', suffix: '', width: 300, placeholder: '天'},
					{value: '', prefix: '，培训班名称', suffix: '', width: 360},
					{value: '', prefix: '，培训组织层级', suffix: '', width: 360, placeholder: '省级、市级、县级'}
				]},
				{name: '未参加过', value: '未参加过', type: 1},
			]
		},
		{
			code: 'A13',
			title: '参加培训意向类型',
			type: 'input',
			options: [
				{value: '', prefix: '', suffix: ''}
			]
		},
	]
}]

module.exports = {
    qsdata: _questions
}