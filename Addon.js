const request = require('request-promise');
const crypto = require('crypto');
const axios = require('axios')
const vega = require('vega');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

var account = require('./account');
var spec = require('./graph_info/default_chart.spec.json');

async function getClickRatios(keyword, date, device='', gender=''){
    console.log('device : ', device)
    var request_body = {
        "startDate": date[0],
        "endDate": date[1],
        "timeUnit": "month",
        "keywordGroups": [
            {
            "groupName": "KW",
            "keywords":[ keyword ]
            }
        ],
        "device":device,
        "gender":gender
    }

    client_id = 'd_vuzn1yAG_j0aeFSCW0';
    client_secret = '3LNguW4s7I';

    var option = {
        method: 'POST',
        uri: 'https://openapi.naver.com/v1/datalab/search',
        body: JSON.stringify(request_body),
        headers: {
            'X-Naver-Client-Id': client_id,
            'X-Naver-Client-Secret': client_secret,
            'Content-Type': 'application/json'
        }
    }
    var msg = await request(option);
    var json = JSON.parse(msg);
    return json;
}

async function getClickCnt(keyword, date){
    client_id = 'd_vuzn1yAG_j0aeFSCW0';
        client_secret = '3LNguW4s7I';

        const path      = '/keywordstool'
        const timestamp = new Date().getTime()
        const msg       = `${timestamp}.GET.${path}`
        const signature = crypto.createHmac('SHA256', account.secretKey).update(msg).digest('base64')
        //const formatted = keywords.map(e => e.keyword).join(',')
        const option = {
            method: 'get',
            url   : `https://api.naver.com${path}`,
            params: {
                'format'      : 'json',
                'hintKeywords': keyword
            },
            headers: {
                'X-Timestamp': timestamp,
                'X-Customer' : account.customerId,
                'X-API-KEY'  : account.accessLicense,
                'X-Signature': signature
            }
        }

        //var data = await request(option);
        return await axios(option);
}

function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function getDir(keyword, date, target){
    if (target==='directory_file')
        return path.join('chart_image', keyword);
    if (target==='image_file')
    return path.join('chart_image', keyword, date[2] + '.png');
}

//================================================================================

module.exports = {
    async getClickRatios(keyword, date, device='', gender=''){
        console.log('device : ', device)
        var request_body = {
            "startDate": date[0],
            "endDate": date[1],
            "timeUnit": "month",
            "keywordGroups": [
                {
                "groupName": "KW",
                "keywords":[ keyword ]
                }
            ],
            "device":device,
            "gender":gender
        }

        client_id = 'd_vuzn1yAG_j0aeFSCW0';
        client_secret = '3LNguW4s7I';

        var option = {
            method: 'POST',
            uri: 'https://openapi.naver.com/v1/datalab/search',
            body: JSON.stringify(request_body),
            headers: {
                'X-Naver-Client-Id': client_id,
                'X-Naver-Client-Secret': client_secret,
                'Content-Type': 'application/json'
            }
        }
        var msg = await request(option);
        var json = JSON.parse(msg);
        return json;
    },


    async getClickCnt(keyword, date){
        client_id = 'd_vuzn1yAG_j0aeFSCW0';
        client_secret = '3LNguW4s7I';

        const path      = '/keywordstool'
        const timestamp = new Date().getTime()
        const msg       = `${timestamp}.GET.${path}`
        const signature = crypto.createHmac('SHA256', account.secretKey).update(msg).digest('base64')
        //const formatted = keywords.map(e => e.keyword).join(',')
        const option = {
            method: 'get',
            url   : `https://api.naver.com${path}`,
            params: {
                'format'      : 'json',
                'hintKeywords': keyword
            },
            headers: {
                'X-Timestamp': timestamp,
                'X-Customer' : account.customerId,
                'X-API-KEY'  : account.accessLicense,
                'X-Signature': signature
            }
        }

        //var data = await request(option);
        return await axios(option);
    },

    async getTrend(keyword, date){
        var click_ratio_json = await getClickRatios(keyword, date);
        var info = await getClickCnt(keyword, date);
        var data = info.data.keywordList[0];
        click_info = [data.monthlyPcQcCnt, data.monthlyMobileQcCnt];
        click_info[0] = click_info[0]=='< 10'?0:click_info[0];
        click_info[1] = click_info[1]=='< 10'?0:click_info[1];
        click_total = click_info[0] + click_info[1];

        console.log('click_ratio : ', click_ratio_json.results[0].data);
        console.log('click totla : ', click_total);

        var click_per_ratio = click_total / int(click_ratio_json.results[0].data[12]['ratio']);

        var click_trend = [];
        for(var i=0; i<12; i++)
            click_trend.push(Math.ceil(click_ratio_json.results[0].data[i]['ratio'] * click_per_ratio));
        
        return click_trend;
    },

    async getTrendp(keyword, date, device){
        
        var click_ratio_json;
        if(device==='total')
            click_ratio_json = await getClickRatios(keyword, date);
        else if(device==='pc')
            click_ratio_json = await getClickRatios(keyword, date, 'pc');
        else if(device==='mobile')
            click_ratio_json = await getClickRatios(keyword, date, 'mo');

        console.log('fin')
        var info = await getClickCnt(keyword, date);
        var data = info.data.keywordList[0];
        click_info = [data.monthlyPcQcCnt, data.monthlyMobileQcCnt];
        click_info[0] = click_info[0]=='< 10'?0:click_info[0];
        click_info[1] = click_info[1]=='< 10'?0:click_info[1];

        console.log('click info : ', click_info);
        if(device==='total')   
            click_total = click_info[0] + click_info[1];
        else if(device=='pc')
            click_total = click_info[0];
        else if(device=='mobile')
            click_total = click_info[1];

        console.log('click_ratio : ', device, click_ratio_json.results[0].data);
        console.log('click_total : ', device, click_total); 

        var click_per_ratio = click_total / click_ratio_json.results[0].data[12]['ratio'];
        console.log('click_per_ratio : ' , click_per_ratio);
        var click_trend = [];
        for(var i=0; i<12; i++)
            click_trend.push(Math.ceil(click_ratio_json.results[0].data[i]['ratio'] * click_per_ratio));
        
        console.log("=========================")
        return click_trend;
    },

    async veg2png(keyword, date){
        return new Promise(function(resolve, reject){
        var view = new vega.View(vega.parse(spec), {renderer:'none'}).initialize();
        view.toCanvas()
            .then(function (canvas) {
                console.log('Writing PNG to file...')
                const directory_file_dir =  getDir(keyword, date, target='directory_file');
                const image_file_dir = getDir(keyword, date, target='image_file');
                mkdirp(directory_file_dir, err => {
                    fs.writeFileSync(image_file_dir, canvas.toBuffer());
                    resolve();
                })
            })
            .catch(function (err) {
                console.log("Error writing PNG to file:");
                console.error(err);
            });
        })
    },

    getDate(term='1y'){
        var today = new Date();
        var before = new Date();
        
        before.setYear(today.getFullYear() - 1);
        var today_f = today.getFullYear() + '-' + pad(today.getMonth()+1,2) + '-' + pad(today.getDate(),2);
        var before_f = before.getFullYear() + '-' + pad(before.getMonth()+1,2) + '-' + pad(before.getDate(),2);

        var today2_f = today.getFullYear() + '-' + pad(today.getMonth()+1,2) + '-' + '01';
        return [before_f, today_f, today2_f];
    },

    getDir(keyword, date, target){
        if (target==='directory_file')
            return path.join('chart_image', keyword);
        if (target==='image_file')
            return path.join('chart_image', keyword, date[2] + '.png');
    },

    setChart(trends){
        console.log("setting Charing!");
        spec.data[0].values = [];
        for(var i=0; i<12; i++){ // if dic (pc and mobile and all)
            for(var j=0; j<trends.length; j++){
                var graph_data = {"x": i, "y": trends[j][i], "c":j};
                spec.data[0].values.push(graph_data);
            }
        }
        console.log('spec value : ', spec.data[0].values);
        fs.writeFileSync('./default_chart.spec.json',JSON.stringify(spec));
        console.log("write complie!!");
    }   
}