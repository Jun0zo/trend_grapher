var request = require('request-promise');
var express = require('express');
var fs = require('fs');
const asyncify = require('express-asyncify')
const app     = asyncify(express());
const path    = require('path');
const Addon = require('./Addon');
const port = 3333

app.use(express.static(path.join(__dirname, 'public')));

app.get('/keytool', async(req, res) => {
    keyword = req.query.kw;
    //var trend = Addon.getTrendp(keyword, date);
    var date = Addon.getDate(); // [before, today, today(날짜가 1)];
    console.log(date);
    var dir = Addon.getDir(keyword, date, target="image_file");
    var exists = fs.existsSync(dir);
    if(!exists){  // if file is not exist
        console.log("making graph!!")
        var trend_pc = await Addon.getTrendp(keyword, date, device='pc')
        var trend_mobile = await Addon.getTrendp(keyword, date, device='mobile');
        var trend_all = await Addon.getTrendp(keyword, date, device='total');
        var trends = [trend_pc, trend_mobile, trend_all]
        console.log('trends : ', trends );
        Addon.setChart(trends);
        Addon.veg2png(keyword, date).then(function(){
            console.log("after veg2png");
            
            //Addon.setChart(trend_all);
            fs.readFile(dir, function(err, data){
                if(err) {
                    res.status(404).end();
                    console.log(err);
                }
                else{
                    res.set('Content-Type', 'image/png');
                    console.log('img data : ', data);
                    res.send(data);
                }
            });
        });
    }else{  //file is exist 
        console.log("graph already exist!!");
        fs.readFile(dir, function(err, data){
            if(err) {
                res.status(404).end();
                console.log(err);
            }
            else{
                res.set('Content-Type', 'image/png');
                console.log(data);
                res.send(data);
            }
        });
    }
});

var server = app.listen(port, function(){
    console.log("Running...!!");
})