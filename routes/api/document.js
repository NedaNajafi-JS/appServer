
const Document = require('../../models/document');
const express = require('express');
const router = express();


router.get('/get', async (req, res) => {

	let resp = await Document.find(
    )
    .sort({order:1})
    .lean()
    .exec();

    if(resp) {
        let array=[];
        //let childs=[];
        let obj ={};
        await Promise.all(resp.map(async (resp1) => {    
            if(resp1.pishrane !== undefined){
                obj ={};
                obj.category_name = "پیشرانه برقی";
                //childs=[];
                for(var l=0; l<resp1.pishrane.length; l++){
                    if(resp1.pishrane[l].pdf !== undefined)
                        resp1.pishrane[l].pdf = resp1.pishrane[l].pdf.slice(6);
                }
                obj.childs = resp1.pishrane;
                array.push(obj);
            }
            if(resp1.charger !== undefined){
                obj ={};
                obj.category_name = "شارژر";
                for(var l=0; l<resp1.charger.length; l++){
                    if(resp1.charger[l].pdf !== undefined)
                    resp1.charger[l].pdf = resp1.charger[l].pdf.slice(6);
                }
                obj.childs = resp1.charger;
                array.push(obj);
            }
            if(resp1.others !== undefined){
                obj ={};
                obj.category_name = "EVone";
                for(var l=0; l<resp1.others.length; l++){
                    if(resp1.others[l].pdf !== undefined)
                    resp1.others[l].pdf = resp1.others[l].pdf.slice(6);
                }
                obj.childs = resp1.others;
                array.push(obj);
            }
            if(resp1.video !== undefined){
                obj ={};
                obj.category_name = "فیلم‌ها";
                for(var l=0; l<resp1.video.length; l++){
                    if(resp1.video[l].video !== undefined)
                    resp1.video[l].video = resp1.video[l].video.slice(6);
                }
                obj.childs = resp1.video;
                array.push(obj);
            }
        }));

		return res.status(200).send(array)
	}
});

module.exports = router;