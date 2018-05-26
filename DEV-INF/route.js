var request = require('request')
var fs = require('fs')
var path = require('path')
var fs = require('fs');
var opn = require('opn')
var mkdirp = require('mkdirp');
var domain = 'http://h5.test.sale.lemobar.cn'
var url

var baseDir = ''
var dir = path.join(process.cwd(),'./images');

var type = ''
var date = ''
var start = 0
var end = 0

//创建目录
mkdirp(dir, function (err) {
	if (err) {
		console.log(err);
	}
});

module.exports = function(app){
	//此处暴露 express 服务器 app 可做反代等操作

	app.all('/api/*',function(req,res,next){
		if (req.url.indexOf('queryServicingDemo') > -1){
			type = '/故障申报'
		} else if (req.url.indexOf('queryPatrolPlaceDemo') > -1){
			type = '/巡场签到'
		} else if (req.url.indexOf('queryCheckFixDemo') > -1) {
			type = '/巡场登记'
		}
		baseDir = path.join(dir, type)
		date = req.url.split('?time=')[1]

		url = domain + req.url
		var r = request({url: url})
		req.pipe(r).pipe(res)
	})

	app.all('/getImg',function(req,res,next){
		request(url, function (err, res, body) {
			//console.log(body)
			//mkdirp.sync(dir)
			var body = JSON.parse(body)
			if (body.code == 1) {
				body.data.map(function (val) {
					//console.log(val.pic_url1)
					for(var n=1;n<10;n++){
						if(val['pic_url'+n] != 'null'){
							//console.log(baseDir)
							//console.log(val.area + n + '.jpg')
							if (type == '/巡场签到'){
								var nowDir = path.join(baseDir, '/' + val.area + date)
							}else{
								var nowDir = path.join(baseDir, '/' + val.area + date, '/' + val.device_id)
							}
							start += 1
							//var nowDir = path.join(baseDir,'/'+val.area+date,'/'+val.device_id)
							download(val['pic_url' + n], nowDir, n+'.jpg')
						}
					}
				})
			}
		})
		res.send('success')
	})


}

var download = function (url, dir, filename) {
	request.head(url, function (err, res, body) {
		mkdirp(dir, function (err) {
			if (err) {
				console.log(err);
			}
			
			request(url).pipe(fs.createWriteStream(dir + "/" + filename).on('finish',function(){
				end += 1
				console.log(start,end)
				if(end == start){
					console.log('图片下载完成！')
					opn(baseDir)
					// fs.open(baseDir, 'r', (err, fd) => {
					// 	if (err) throw err;
					// 	fs.close(fd, (err) => {
					// 		if (err) throw err;
					// 	});
					// });
					end = 0
					start = 0
				}
			}));
		});
		
	});
};