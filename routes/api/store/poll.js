/**
 * use express module
 * require contact schema
 * require email page
 */
const Sales = require('../../../models/store/pollSales');
const SalesService = require('../../../models/store/pollSalesService');
const userAdmin = require('../../../models/userAdmin');
const poll = require('../../../models/store/poll');
const complaint = require('../../../models/complaint');
const contact = require('../../../models/contact');
const repair = require('../../../models/services/repair'); 
const warranty_form = require('../../../models/services/warranty_form');
const agency_form = require('../../../models/services/agency_form');
const smartsocket_profile = require('../../../models/services/smartsocket_profile')
const express = require('express');
const keys = require('../../../config/keys');
const jwt = require('jsonwebtoken');
const router = express();
const isEmpty = require("../../../validation/is-empty");

router.post('/insert', async (req,res)=>{
 
    const info = {};
    info.question = req.body.question;
    let obj={};
    obj.text=req.body.text
    info.answers = obj;

    new Sales(info).save()
    .then(faq => { 
        res.status(200).send("ذخیره با موفقیت انجام شد")
    })
    .catch(err => res.json(err));
});
 
router.post('/insertService', async (req,res)=>{
 
    const info = {};
    info.question = req.body.question;
    let obj={};
    obj.text=req.body.text
    info.answers = obj;

    new SalesService(info).save()
    .then(faq => { 
        res.status(200).send("ذخیره با موفقیت انجام شد")
    })
    .catch(err => res.json(err));
});

router.post('/insertPoll', async (req,res)=>{
    let errors = {};
    if (isEmpty(req.body.name)) {
      errors.name = "وارد کردن نام الزامی است";
    }
    if (isEmpty(req.body.city)) {
        errors.city = "وارد کردن شهر الزامی است";
    }
    if(!isEmpty(errors))
    {
        return res.status(400).json(errors);
    }
    let Counter = 1;
    let Count = await poll.findOne()
    .select({counter: 1})
    .sort({_id:-1})
    .lean()
    .exec();

    if(Count){
        Counter = parseInt(Count.counter) + parseInt(Counter);
    }
    const sales = {};
    if(req.body.sales!=undefined) {
        
        sales.name = req.body.name;
        sales.formName = "sales";
        sales.city = req.body.city;
        if (!isEmpty(req.body.phone))
            sales.phone = req.body.phone;
        sales.polls = req.body.sales;
        sales.unread = true;
        sales.counter=Counter;
        if (!isEmpty(req.body.salessuggestions))
            sales.suggestions = req.body.salessuggestions;
    }
    const salesService = {};
    if(req.body.salesservice!=undefined) {
       
        salesService.name = req.body.name;
        salesService.formName = "salesService";
        salesService.city = req.body.city;
        if (!isEmpty(req.body.phone))
            salesService.phone = req.body.phone;
        salesService.polls = req.body.salesservice;
        salesService.unread = true;
        salesService.counter=Counter;
        if (!isEmpty(req.body.servicesuggestions))
            salesService.suggestions = req.body.servicesuggestions;
    }

    if(req.body.sales.length!=0)
        await new poll(sales).save();
    if(req.body.salesservice.length!=0)
        await new poll(salesService).save();
    // .then(faq => { 
    res.status(200).send("ذخیره با موفقیت انجام شد")
    /*})
    .catch(err => res.json(err));*/
});

router.get('/getSales', (req, res) => {
    Sales.find()
    .then(async (resp) => {
        res.status(200).send(resp)
    })
    .catch(err => res.status(404).json(err));
});

router.get('/getSalesService', (req, res) => {
    SalesService.find()
    .then(async (resp) => {
        res.status(200).send(resp)
    })
    .catch(err => res.status(404).json(err));
});
 
router.get('/getPoll', (req, res) => {
    poll.find()
    .then(async (resp) => {
        res.status(200).send(resp)
    })
    .catch(err => res.status(404).json(err));
});

router.post('/getResultSales', async (req, res) => {

    let token = '';
    let user = '';
    if(req.body.params){
        token = req.body.params.Authorization;
        const decoded = jwt.verify(token, keys.secretOrKey);

            user = await userAdmin.findOne(
            {
                _id: decoded.id,
                role: "poll"
            }
        )
        .exec();
    }

   if(user) {
        const polls = await poll.find({
            formName:"sales"
        })
        .exec();

        let result=[];
        if(polls) {
            let length1 = 0, length2 = 0, length3 = 0,  length4 = 0, length5 = 0, length6 = 0, length7 = 0,
                length8 = 0, length9 = 0, length10 = 0, length11 = 0, length12 = 0, length13 = 0, length14 = 0,

                response1One=0, response2One=0, response3One=0, response4One=0, response5One=0, response6One=0, response7One=0,
                response8One=0, response9One=0, response10One=0, response11One=0, response12One=0, response13One=0, response14One=0,

                response1Two=0, response2Two=0, response3Two=0, response4Two=0, response5Two=0, response6Two=0, response7Two=0, 
                response8Two=0, response9Two=0, response10Two=0, response11Two=0, response12Two=0, response13Two=0, response14Two=0,

                response1Tree=0, response2Tree=0, response3Tree=0, response4Tree=0, response5Tree=0, response6Tree=0, response7Tree=0,
                response8Tree=0, response9Tree=0, response10Tree=0, response11Tree=0, response12Tree=0, response13Tree=0, response14Tree=0,

                response1Four=0, response2Four=0, response3Four=0, response4Four=0, response5Four=0, response6Four=0, response7Four=0,
                response8Four=0, response9Four=0, response10Four=0, response11Four=0, response12Four=0, response13Four=0, response14Four=0,

                response1Five=0, response2Five=0, response3Five=0, response4Five=0, response5Five=0, response6Five=0, response7Five=0,
                response8Five=0, response9Five=0, response10Five=0, response11Five=0, response12Five=0, response13Five=0, response14Five=0,
                
                response1six=0;

            await Promise.all(polls.map(async(sales) => {
                await Promise.all(sales.polls.map(async(sale) => {
                    if(sale.number == 1) {
                        if(sale.selectedQuestion) {
                            length1++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response1One++
                                        else if(answer.number==2)
                                            response1Two++
                                        else if(answer.number==3)
                                            response1Tree++
                                        else if(answer.number==4)
                                            response1Four++
                                        else if(answer.number==5)
                                            response1Five++
                                        else if(answer.number==6)
                                            response1six++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 2) {
                        if(sale.selectedQuestion) {
                            length2++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response2One++
                                        else if(answer.number==2)
                                            response2Two++
                                        else if(answer.number==3)
                                            response2Tree++
                                        else if(answer.number==4)
                                            response2Four++
                                        else if(answer.number==5)
                                            response2Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 3) {
                        if(sale.selectedQuestion) {
                            length3++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response3One++
                                        else if(answer.number==2)
                                            response3Two++
                                        else if(answer.number==3)
                                            response3Tree++
                                        else if(answer.number==4)
                                            response3Four++
                                        else if(answer.number==5)
                                            response3Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 4) {
                        if(sale.selectedQuestion) {
                            length4++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response4One++
                                        else if(answer.number==2)
                                            response4Two++
                                        else if(answer.number==3)
                                            response4Tree++
                                        else if(answer.number==4)
                                            response4Four++
                                        else if(answer.number==5)
                                            response4Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 5) {
                        if(sale.selectedQuestion) {
                            length5++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response5One++
                                        else if(answer.number==2)
                                            response5Two++
                                        else if(answer.number==3)
                                            response5Tree++
                                        else if(answer.number==4)
                                            response5Four++
                                        else if(answer.number==5)
                                            response5Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 6) {
                        if(sale.selectedQuestion) {
                            length6++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response6One++
                                        else if(answer.number==2)
                                            response6Two++
                                        else if(answer.number==3)
                                            response6Tree++
                                        else if(answer.number==4)
                                            response6Four++
                                        else if(answer.number==5)
                                            response6Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 7) {
                        if(sale.selectedQuestion) {
                            length7++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response7One++
                                        else if(answer.number==2)
                                            response7Two++
                                        else if(answer.number==3)
                                            response7Tree++
                                        else if(answer.number==4)
                                            response7Four++
                                        else if(answer.number==5)
                                            response7Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 8) {
                        if(sale.selectedQuestion) {
                            length8++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response8One++
                                        else if(answer.number==2)
                                            response8Two++
                                        else if(answer.number==3)
                                            response8Tree++
                                        else if(answer.number==4)
                                            response8Four++
                                        else if(answer.number==5)
                                            response8Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 9) {
                        if(sale.selectedQuestion) {
                            length9++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response9One++
                                        else if(answer.number==2)
                                            response9Two++
                                        else if(answer.number==3)
                                            response9Tree++
                                        else if(answer.number==4)
                                            response9Four++
                                        else if(answer.number==5)
                                            response9Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 10) {
                        if(sale.selectedQuestion) {
                            length10++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response10One++
                                        else if(answer.number==2)
                                            response10Two++
                                        else if(answer.number==3)
                                            response10Tree++
                                        else if(answer.number==4)
                                            response10Four++
                                        else if(answer.number==5)
                                            response10Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 11) {
                        if(sale.selectedQuestion) {
                            length11++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response11One++
                                        else if(answer.number==2)
                                            response11Two++
                                        else if(answer.number==3)
                                            response11Tree++
                                        else if(answer.number==4)
                                            response11Four++
                                        else if(answer.number==5)
                                            response11Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 12) {
                        if(sale.selectedQuestion) {
                            length12++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response12One++
                                        else if(answer.number==2)
                                            response12Two++
                                        else if(answer.number==3)
                                            response12Tree++
                                        else if(answer.number==4)
                                            response12Four++
                                        else if(answer.number==5)
                                            response12Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 13) {
                        if(sale.selectedQuestion) {
                            length13++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response13One++
                                        else if(answer.number==2)
                                            response13Two++
                                        else if(answer.number==3)
                                            response13Tree++
                                        else if(answer.number==4)
                                            response13Four++
                                        else if(answer.number==5)
                                            response13Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 14) {
                        if(sale.selectedQuestion) {
                            length14++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response14One++
                                        else if(answer.number==2)
                                            response14Two++
                                        else if(answer.number==3)
                                            response14Tree++
                                        else if(answer.number==4)
                                            response14Four++
                                        else if(answer.number==5)
                                            response14Five++
                                    }
                            }))
                        }
                    }
                }))
            }));
            const salesform = await Sales.find().exec();

            let obj={};
            await Promise.all(salesform.map(async(form) => {
                obj={};
                if(form.number==1){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length1;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response1One/length1)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response1Two/length1)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response1Tree/length1)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response1Four/length1)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response1Five/length1)*100});
                        if(answer.number==6)
                            array.push({answer:answer.text,percentage:(response1six/length1)*100});
                    };
                    if(length1==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==2){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length2;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response2One/length2)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response2Two/length2)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response2Tree/length2)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response2Four/length2)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response2Five/length2)*100});
                    }
                    if(length2==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==3){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length3;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response3One/length3)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response3Two/length3)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response3Tree/length3)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response3Four/length3)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response3Five/length3)*100});
                    }
                    if(length3==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==4){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length4;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response4One/length4)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response4Two/length4)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response4Tree/length4)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response4Four/length4)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response4Five/length4)*100});
                    };
                    if(length4==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==5){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length5;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response5One/length5)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response5Two/length5)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response5Tree/length5)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response5Four/length5)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response5Five/length5)*100});
                    }
                    if(length5==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==6){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length6;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response6One/length6)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response6Two/length6)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response6Tree/length6)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response6Four/length6)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response6Five/length6)*100});
                    }
                    if(length6==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==7){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length7;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response7One/length7)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response7Two/length7)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response7Tree/length7)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response7Four/length7)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response7Five/length7)*100});
                    }
                    if(length7==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==8){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length8;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response8One/length8)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response8Two/length8)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response8Tree/length8)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response8Four/length8)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response8Five/length8)*100});
                    }
                    if(length8==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==9){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length9;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response9One/length9)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response9Two/length9)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response9Tree/length9)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response9Four/length9)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response9Five/length9)*100});
                    }
                    if(length9==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==10){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length10;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response10One/length10)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response10Two/length10)*100});
                    }
                    if(length10==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==11){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length11;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response11One/length11)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response11Two/length11)*100});
                    }
                    if(length11==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==12){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length12;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response12One/length12)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response12Two/length12)*100});
                    }
                    if(length12==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==13){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length13;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response13One/length13)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response13Two/length13)*100});
                    }
                    if(length13==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
                else if(form.number==14){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length14;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response14One/length14)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response14Two/length14)*100});
                    }
                    if(length14==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    result.push(obj);
                }
            }));
        }

        const polls_service = await poll.find({
            formName:"salesService"
        })
        .exec();

        
        let resultService=[];
        if(polls_service) {
            let length1 = 0, length2 = 0, length3 = 0,  length4 = 0, length5 = 0, length6 = 0, length7 = 0,
                length8 = 0, length9 = 0, length10 = 0, length11 = 0, length12 = 0, length13 = 0, length14 = 0,
                length15 = 0, length16 = 0, length17 = 0, length18 = 0,

                response1One=0, response2One=0, response3One=0, response4One=0, response5One=0, response6One=0, response7One=0,
                response8One=0, response9One=0, response10One=0, response11One=0, response12One=0, response13One=0, response14One=0,
                response15One=0, response16One=0, response17One=0, response18One=0,

                response1Two=0, response2Two=0, response3Two=0, response4Two=0, response5Two=0, response6Two=0, response7Two=0, 
                response8Two=0, response9Two=0, response10Two=0, response11Two=0, response12Two=0, response13Two=0, response14Two=0,
                response15Two=0, response16Two=0, response17Two=0, response18Two=0,

                response1Tree=0, response2Tree=0, response3Tree=0, response4Tree=0, response5Tree=0, response6Tree=0, response7Tree=0,
                response8Tree=0, response9Tree=0, response10Tree=0, response11Tree=0, response12Tree=0, response13Tree=0, response14Tree=0,
                response15Tree=0, response16Tree=0, response17Tree=0, response18Tree=0,

                response1Four=0, response2Four=0, response3Four=0, response4Four=0, response5Four=0, response6Four=0, response7Four=0,
                response8Four=0, response9Four=0, response10Four=0, response11Four=0, response12Four=0, response13Four=0, response14Four=0,
                response15Four=0, response16Four=0, response17Four=0, response18Four=0,

                response1Five=0, response2Five=0, response3Five=0, response4Five=0, response5Five=0, response6Five=0, response7Five=0,
                response8Five=0, response9Five=0, response10Five=0, response11Five=0, response12Five=0, response13Five=0, response14Five=0,
                response15Five=0, response16Five=0, response17Five=0, response18Five=0,
                
                response1six=0;

            await Promise.all(polls_service.map(async(sales) => {
                await Promise.all(sales.polls.map(async(sale) => {
                    if(sale.number == 1) {
                        if(sale.selectedQuestion) {
                            length1++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response1One++
                                        else if(answer.number==2)
                                            response1Two++
                                        else if(answer.number==3)
                                            response1Tree++
                                        else if(answer.number==4)
                                            response1Four++
                                        else if(answer.number==5)
                                            response1Five++
                                        else if(answer.number==6)
                                        response1six++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 2) {
                        if(sale.selectedQuestion) {
                            length2++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response2One++
                                        else if(answer.number==2)
                                            response2Two++
                                        else if(answer.number==3)
                                            response2Tree++
                                        else if(answer.number==4)
                                            response2Four++
                                        else if(answer.number==5)
                                            response2Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 3) {
                        if(sale.selectedQuestion) {
                            length3++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response3One++
                                        else if(answer.number==2)
                                            response3Two++
                                        else if(answer.number==3)
                                            response3Tree++
                                        else if(answer.number==4)
                                            response3Four++
                                        else if(answer.number==5)
                                            response3Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 4) {
                        if(sale.selectedQuestion) {
                            length4++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response4One++
                                        else if(answer.number==2)
                                            response4Two++
                                        else if(answer.number==3)
                                            response4Tree++
                                        else if(answer.number==4)
                                            response4Four++
                                        else if(answer.number==5)
                                            response4Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 5) {
                        if(sale.selectedQuestion) {
                            length5++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response5One++
                                        else if(answer.number==2)
                                            response5Two++
                                        else if(answer.number==3)
                                            response5Tree++
                                        else if(answer.number==4)
                                            response5Four++
                                        else if(answer.number==5)
                                            response5Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 6) {
                        if(sale.selectedQuestion) {
                            length6++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response6One++
                                        else if(answer.number==2)
                                            response6Two++
                                        else if(answer.number==3)
                                            response6Tree++
                                        else if(answer.number==4)
                                            response6Four++
                                        else if(answer.number==5)
                                            response6Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 7) {
                        if(sale.selectedQuestion) {
                            length7++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response7One++
                                        else if(answer.number==2)
                                            response7Two++
                                        else if(answer.number==3)
                                            response7Tree++
                                        else if(answer.number==4)
                                            response7Four++
                                        else if(answer.number==5)
                                            response7Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 8) {
                        if(sale.selectedQuestion) {
                            length8++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response8One++
                                        else if(answer.number==2)
                                            response8Two++
                                        else if(answer.number==3)
                                            response8Tree++
                                        else if(answer.number==4)
                                            response8Four++
                                        else if(answer.number==5)
                                            response8Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 9) {
                        if(sale.selectedQuestion) {
                            length9++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response9One++
                                        else if(answer.number==2)
                                            response9Two++
                                        else if(answer.number==3)
                                            response9Tree++
                                        else if(answer.number==4)
                                            response9Four++
                                        else if(answer.number==5)
                                            response9Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 10) {
                        if(sale.selectedQuestion) {
                            length10++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response10One++
                                        else if(answer.number==2)
                                            response10Two++
                                        else if(answer.number==3)
                                            response10Tree++
                                        else if(answer.number==4)
                                            response10Four++
                                        else if(answer.number==5)
                                            response10Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 11) {
                        if(sale.selectedQuestion) {
                            length11++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response11One++
                                        else if(answer.number==2)
                                            response11Two++
                                        else if(answer.number==3)
                                            response11Tree++
                                        else if(answer.number==4)
                                            response11Four++
                                        else if(answer.number==5)
                                            response11Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 12) {
                        if(sale.selectedQuestion) {
                            length12++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response12One++
                                        else if(answer.number==2)
                                            response12Two++
                                        else if(answer.number==3)
                                            response12Tree++
                                        else if(answer.number==4)
                                            response12Four++
                                        else if(answer.number==5)
                                            response12Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 13) {
                        if(sale.selectedQuestion) {
                            length13++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response13One++
                                        else if(answer.number==2)
                                            response13Two++
                                        else if(answer.number==3)
                                            response13Tree++
                                        else if(answer.number==4)
                                            response13Four++
                                        else if(answer.number==5)
                                            response13Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 14) {
                        if(sale.selectedQuestion) {
                            length14++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response14One++
                                        else if(answer.number==2)
                                            response14Two++
                                        else if(answer.number==3)
                                            response14Tree++
                                        else if(answer.number==4)
                                            response14Four++
                                        else if(answer.number==5)
                                            response14Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 15) {
                        if(sale.selectedQuestion) {
                            length15++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response15One++
                                        else if(answer.number==2)
                                            response15Two++
                                        else if(answer.number==3)
                                            response15Tree++
                                        else if(answer.number==4)
                                            response15Four++
                                        else if(answer.number==5)
                                            response15Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 16) {
                        if(sale.selectedQuestion) {
                            length16++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response16One++
                                        else if(answer.number==2)
                                            response16Two++
                                        else if(answer.number==3)
                                            response16Tree++
                                        else if(answer.number==4)
                                            response16Four++
                                        else if(answer.number==5)
                                            response16Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 17) {
                        if(sale.selectedQuestion) {
                            length17++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response17One++
                                        else if(answer.number==2)
                                            response17Two++
                                        else if(answer.number==3)
                                            response17Tree++
                                        else if(answer.number==4)
                                            response17Four++
                                        else if(answer.number==5)
                                            response17Five++
                                    }
                            }))
                        }
                    }
                    else if(sale.number == 18) {
                        if(sale.selectedQuestion) {
                            length18++;
                            await Promise.all(sale.answers.map(async(answer) => {
                                    if(answer.selected) {
                                        if(answer.number==1)
                                            response18One++
                                        else if(answer.number==2)
                                            response18Two++
                                        else if(answer.number==3)
                                            response18Tree++
                                        else if(answer.number==4)
                                            response18Four++
                                        else if(answer.number==5)
                                            response18Five++
                                    }
                            }))
                        }
                    }
                }))
            }));

            const salesserviceform = await SalesService.find().exec();

            let obj={};
            await Promise.all(salesserviceform.map(async(form) => {
                obj={};
                if(form.number==1){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length1;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response1One/length1)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response1Two/length1)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response1Tree/length1)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response1Four/length1)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response1Five/length1)*100});
                        if(answer.number==6)
                            array.push({answer:answer.text,percentage:(response1six/length1)*100});
                    }
                    if(length1==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==2){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length2;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response2One/length2)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response2Two/length2)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response2Tree/length2)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response2Four/length2)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response2Five/length2)*100});
                    }
                    if(length2==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==3){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length3;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response3One/length3)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response3Two/length3)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response3Tree/length3)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response3Four/length3)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response3Five/length3)*100});
                    }
                    if(length3==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==4){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length4;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response4One/length4)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response4Two/length4)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response4Tree/length4)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response4Four/length4)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response4Five/length4)*100});
                    }
                    if(length4==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==5){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length5;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response5One/length5)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response5Two/length5)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response5Tree/length5)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response5Four/length5)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response5Five/length5)*100});
                    }
                    if(length5==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==6){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length6;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response6One/length6)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response6Two/length6)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response6Tree/length6)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response6Four/length6)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response6Five/length6)*100});
                    }
                    if(length6==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==7){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length7;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response7One/length7)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response7Two/length7)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response7Tree/length7)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response7Four/length7)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response7Five/length7)*100});
                    }
                    if(length7==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==8){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length8;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response8One/length8)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response8Two/length8)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response8Tree/length8)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response8Four/length8)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response8Five/length8)*100});
                    }
                    if(length8==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==9){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length9;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response9One/length9)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response9Two/length9)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response9Tree/length9)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response9Four/length9)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response9Five/length9)*100});
                    }
                    if(length9==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==10){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length10;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response10One/length10)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response10Two/length10)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response10Tree/length10)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response10Four/length10)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response10Five/length10)*100});
                    }
                    if(length10==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==11){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length11;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response11One/length11)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response11Two/length11)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response11Tree/length11)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response11Four/length11)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response11Five/length11)*100});
                    }
                    if(length11==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==12){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length12;
                    obj.severalAnswer=true;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response12One/length12)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response12Two/length12)*100});
                        if(answer.number==3)
                            array.push({answer:answer.text,percentage:(response12Tree/length12)*100});
                        if(answer.number==4)
                            array.push({answer:answer.text,percentage:(response12Four/length12)*100});
                        if(answer.number==5)
                            array.push({answer:answer.text,percentage:(response12Five/length12)*100});
                    }
                    if(length12==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==13){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length13;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response13One/length13)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response13Two/length13)*100});
                    }
                    if(length13==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==14){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length14;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response14One/length14)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response14Two/length14)*100});
                    }
                    if(length14==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==15){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length15;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response15One/length15)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response15Two/length15)*100});
                    }
                    if(length15==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==16){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length16;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response16One/length16)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response16Two/length16)*100});
                    }
                    if(length16==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==17){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length17;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response17One/length17)*100});
                        if(answer.number==2)
                            array.push({answer:answer.text,percentage:(response17Two/length17)*100});
                    }
                    if(length17==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
                else if(form.number==18){
                    obj.question={number:form.number,question:form.question};
                    obj.lengthAnswers=length18;
                    obj.severalAnswer=false;
                    let array=[];
                    for(var i=0; i<form.answers.length; i++){
                        let answer =form.answers[i];
                        if(answer.number==1)                
                            array.push({answer:answer.text,percentage:(response18One/length18)*100});
                        if(answer.number==2)
                        array.push({answer:answer.text,percentage:(response18Two/length18)*100});
                    }
                    if(length18==0)
                        array.push({answer:"نظری ندارم",percentage:100});
                    obj.answers=array;
                    resultService.push(obj);
                }
            }));
        }
        let Count = await poll.findOne()
        .select({counter: 1})
        .sort({_id:-1})
        .lean()
        .exec();

        res.status(200).send({"sales":result, "salesService":resultService, "Count":Count.counter})
    }
    else{
        return res.status(400).json('شما دسترسی انجام عملیات را ندارید');
    }
});

router.get('/getUnread',async (req, res) => {

    let Unread_complaint = await complaint.find({
        unread:true
    })
    .exec();

    let Count = await poll.findOne()
    .select({counter: 1})
    .sort({_id:-1})
    .lean()
    .exec();

    let unread_install = await repair.find({
        unread:true,
        type:2
    })
    .exec();

    let unread_repair = await repair.find({
        unread:true,
        type:1
    })
    .exec();

    let unread_warranty = await warranty_form.find({
        unread:true
    })
    .exec();

    let unread_contact = await contact.find({
        unread:true
    })
    .exec();

    let unread_agency = await agency_form.find({
        unread:true
    })
    .exec();

    let unread_smartsocket = await smartsocket_profile.find({
        unread:true
    })
    .exec();
    

    res.status(200).send({"unread_complaint":Unread_complaint.length, "count_poll":Count.counter,
                          "unread_install":unread_install.length,"unread_repair":unread_repair.length,
                          "unread_warranty":unread_warranty.length,"unread_contact":unread_contact.length,
                          "unread_agency":unread_agency.length, "unread_smartsocket":unread_smartsocket.length});
                          
});

module.exports = router;