const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
var moment = require('moment-jalaali')
moment.loadPersian();

const StationsSpecs = require('../../models/stations/StationsSpecs');
const chargeScheduleModel = require('../../models/chargeScheduling');
const ocpp_chargePointModel = require('../../models/chargepoints/ocpp_chargepoints');

router.post('/new', passport.authenticate('jwt', {
  session: false
}), async(req, res) => {

  const startTime = req.body.startTime;
  const endTime = req.body.endTime;

  if(startTime === undefined || endTime === undefined || 
    startTime.length <= 0 || endTime.length <= 0 ||
    req.body.cpID === undefined || req.body.cpID.length <= 0 ||
    req.body.connector === undefined || req.body.connector.length <= 0 ||
    req.body.vehicleType === undefined || req.body.vehicleType.length <= 0) {

    return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                  errorEN: 'Invalid input'});

  }else{

    const miladiStartDate = moment(startTime, 'jYYYY/jM/jD HH:mm').format('YYYY/M/D HH:mm');
		const miladiEndDate = moment(endTime, 'jYYYY/jM/jD HH:mm').format('YYYY/M/D HH:mm');

		let startmiladiDate = new Date(miladiStartDate);
    let endmiladiDate = new Date(miladiEndDate);
    let now = new Date();
    
    if(startmiladiDate >= endmiladiDate ||
      startmiladiDate <= now ||
      endmiladiDate <= now){

        return res.status(400).json({error: 'خطا در زمانبندی شروع شارژ برنامه‌ریزی شده', 
                                      errorEN: 'Timesection in invalid'});

      }else{

        const cp = await  ocpp_chargePointModel
        .findOne(
          {
            CPID: req.body.cpID,
            connector: {
              $elemMatch: {
                connectorName: req.body.connector
              }
            }
          }
        )
        .lean()
        .exec();

        if(cp !== undefined && cp !== null){

          if(cp.usageType !== 'private'){
           return res.status(400).json({error: 'امکان تنظیم زمانبندی شارژ، فقط برای شارژرهای خصوصی امکان‌پذیر می‌باشد', 
                                        errorEN: 'Charge schedule is only available for private chargers'});
          }

        }else{
          
          return res.status(400).json({error: 'شارژر نامعتبر است', 
                                        errorEN: 'Charger not found'});
        }

        let schedules = await chargeScheduleModel
        .find(
          {
            user: req.user.id,
            cpID: req.body.cpID,
            connector: req.body.connector,
            $or:[
              {
                $and:[
                  {endTime:{$gte: startmiladiDate/*startTime*/}},
                  {endTime:{$lte: endmiladiDate/*endTime*/}}
                ]
              },
              {
                $and:[
                  {startTime:{$gte: startmiladiDate/*startTime*/}},
                  {startTime:{$lte: endmiladiDate/*endTime*/}}
                ]
              },
              {
                $and:[
                  {startTime:{$lte:startmiladiDate/*startTime*/}},
                  {endTime:{$gte: endmiladiDate/*endTime*/}}
                ]
              }
            ]
            
          }
        )
        .lean()
        .exec();

        if(schedules !== undefined && schedules.length > 0){

          return res.status(400).json({error: 'امکان شروع شارژ خودکار در بازه زمانی انتخابی به دلیل وجود شارژ دیگر، وجود ندارد', 
                                        errorEN: 'There is another charge schedule in the selected period'});

        }else{

          let station = '';
          let stationId = '';
          let stationName = '';

          if(req.body.stationId !== undefined && req.body.stationId.length > 0){

            station = await StationsSpecs
            .findOne({
              stationId: req.body.stationId
            })
            .lean()
            .exec();

          }
          
          if(station !== undefined && station.length > 0){
        
            if(station.stationId !== undefined && station.stationId.length > 0){
              stationId = station.stationId;

            }

            if(station.stationName !== undefined && station.stationName.length > 0){
              stationName = station.stationName;

            }
          }
        
          let chargeSchedule = new chargeScheduleModel({
        
            stationId: stationId,
            stationName: stationName,
            user: req.user.id,
            vehicleType: req.body.vehicleType,
            cpID: req.body.cpID,
            connector: req.body.connector,
            startTime: startmiladiDate/*startTime*/,
            endTime: endmiladiDate/*endTime*/,
            doScheduleDate: Date.now(),
            status: 'waiting',
            repeatWeekly: typeof(req.body.repeatWeekly) === "boolean" ? req.body.repeatWeekly : false,
            repeatDaily: typeof(req.body.repeatDaily) === 'boolean' ? req.body.repeatDaily: false
        
          });
        
          await chargeSchedule.save();

          return res.status(200).json(chargeSchedule);

        }

      }

  }  

});

router.post('/edit', passport.authenticate('jwt', {
  session: false
}), async(req, res) => {
  
  let schedule = await chargeScheduleModel
  .findOne(
    {
      _id: req.body._id
    }
  )
  .exec();

  if(schedule !== undefined && schedule !== null){

    let startTime = '',
        endTime = '';
    let message = ''
    if(schedule.status === 'waiting'){

      if(req.body.startTime !== undefined && req.body.startTime !== null && 
        req.body.startTime !== ''){

          miladiStartDate = moment(req.body.startTime, 'jYYYY/jM/jD HH:mm').format('YYYY/M/D HH:mm');
          startTime = new Date(miladiStartDate);
      }

      if(req.body.endTime !== undefined && req.body.endTime !== null && req.body.endTime !== ''){

        miladiEndDate = moment(req.body.endTime, 'jYYYY/jM/jD HH:mm').format('YYYY/M/D HH:mm');
        endTime = new Date(miladiEndDate);

      }

    }else if(schedule.status === 'charging'){

      if(req.body.endTime !== undefined && req.body.endTime !== null && req.body.endTime !== ''){

        miladiEndDate = moment(req.body.endTime, 'jYYYY/jM/jD HH:mm').format('YYYY/M/D HH:mm');
        endTime = new Date(miladiEndDate);

      }

    }else{
      return res.status(400).json({error: 'به دلیل وضعیت شارژ زمانبندی شده، امکان ویرایش زمان شروع/پایان وجود ندارد', 
                                    errorEN: 'Due to schedule status, edit is not allowed'});
    }

    if(startTime !== ''){

      await chargeScheduleModel
      .findOneAndUpdate(
        {
          _id: req.body._id
        },
        {
          startTime: startTime
        }
      )
      .exec();

      message = 'زمان شروع اصلاح شد.'
    }

    if(endTime !== ''){

      await chargeScheduleModel
      .findOneAndUpdate(
        {
          _id: req.body._id
        },
        {
          endTime: endTime,
        }
      )
      .then()
      .catch(err => console.log(err));

      if(message !== '' && message.length > 0)
      {
        message += ' ';
        message += 'زمان پایان اصلاح شد';
      }else{
        message = 'زمان پایان اصلاح شد';
      }

    }
    
    //await schedule.save();
    return res.status(200).json(message);

  }else{
    return res.status(400).json({errore: 'شارژ زمانبندی شده‌ای با این مشخصات یافت نشد', 
                                  errorEN: 'Schedule not found'});
  }

});

router.get('/getChargingForUser', passport.authenticate('jwt', {
  session: false
}), async(req, res) => {

  let scheduled = await chargeScheduleModel
  .find(
    {
      user: req.user.id//,
      //status:{$in: ['charging']}
    }
  )
  .lean()
  .exec();

  if(scheduled && scheduled.length > 0){

    return res.status(200).json({error: '', scheduled});
  }else{
    return res.status(200).json({error: '', scheduled: []});
  }

});

router.post('/getChargingForCP', passport.authenticate('jwt', {
  session: false
}) , async (req, res) => {
  
  if(req.body.cpID === undefined || req.body.cpID.length <= 0){

    return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                  errorEN: "Invalid input", 
                                  activeSchedules: []});

  }else{

    const activeSchedules = await chargeScheduleModel
    .find(
      {
        cpID: req.body.cpID,
        status: { $in: ['charging']}
      }
    )
    .lean()
    .exec();
  
    if(activeSchedules !== undefined && activeSchedules.length > 0){
      return res.status(200).json({error: '', activeSchedules});

    }else{
      return res.status(200).json({error: '', activeSchedules: []});

    }

  }
  
});

router.post('/getByStatusForUser', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {

  if(req.body.status !== undefined && req.body.status.length > 0){

    const schedules = await chargeScheduleModel
    .find(
      {
        user: req.user.id,
        status: {$in: Array.isArray(req.body.status) === true ? req.body.status : [req.body.status]}
      }
    )
    .lean()
    .exec();
  
    if(schedules !== undefined &  schedules.length > 0){
      return res.status(200).json({error: '', schedules: schedules});
  
    }else{
      return res.status(200).json({error: '', schedules: []});
  
    }

  }else{
    return res.status(400).json({error: 'خطا در پارمترهای ورودی', 
                                  errorEN: 'Invalid input', 
                                  schedules: []});
    
  }

});

router.post('/getByStatusForCP', passport.authenticate('jwt', {
  session: false
}) , async (req, res) => {

  if(req.body.status !== undefined && req.body.status.length > 0 &&
      req.body.cpID !== undefined && req.body.cpID.length > 0){

    const schedules = await chargeScheduleModel
    .find(
      {
        cpID: req.body.cpID,
        status: {$in: Array.isArray(req.body.status) === true ? req.body.status : [req.body.status]}
      }
    )
    .exec();

    if(schedules !== undefined && schedules.length > 0){
      return res.status(200).json({error: '', schedules: schedules});
    }else{
      return res.status(200).json({error: '', schedules: []});
    }

  }else{
    return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                  errorEN: 'Invalid input', 
                                  schedules: []});

  }

});

router.post('/delete/scheduleId', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {

  if(!req.body._id){

    const userSchedules = await chargeScheduleModel
    .find(
      {
        user: req.user.id
      }
    )
    .lean()
    .exec();

    if(userSchedules !== undefined && userSchedules.length > 0){
      return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                    errorEN: 'Invalid input', 
                                    userSchedules: userSchedules});

    }else{
      return res.status(400).json({error: 'خطا در پارامترهای ورودی',
                                    errorEN: 'Invalid input', 
                                    userSchedules: []});

    }

  }else{

    await chargeScheduleModel
    .findOneAndDelete(
      {
        _id: req.body._id,
        user: req.user.id,
        status: {$in: ['waiting']}
      }
    )
    .exec();
  
    const userSchedules = await chargeScheduleModel
    .find(
      {
        user: req.user.id
      }
    )
    .lean()
    .exec();
  
    if(userSchedules !== undefined && userSchedules.length > 0){
      return res.status(200).json({error: '', userSchedules: userSchedules});

    }else{
      return res.status(200).json({error: '', userSchedules: []});

    }
  }
  
});

router.post('/delete/AllForUser', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {

  await chargeScheduleModel
  .deleteMany(
    {
      user: req.user.id,
      status:{$in: ['waiting']}
    }
  )
  .exec();

  const userSchedules = await chargeScheduleModel
  .find(
    {
      user: req.user.id
    }
  )
  .lean()
  .exec();

  let wrongSchedules = await chargeScheduleModel
  .find(
    {
      user: req.user.id,
      status: {$in: ['waiting']}
    }
  )
  .lean()
  .exec();

  if(wrongSchedules !== undefined && wrongSchedules.length > 0){
    return res.status(400).json({error: 'خطا در انجام عملیات', 
                                  errorEN: 'Operation failed'});
  }

  if(userSchedules !== undefined && userSchedules.length > 0){
    return res.status(200).json({error: '', userSchedules: userSchedules});

  }else{
    return res.status(200).json({error: '', userSchedules: []});

  }

});

router.post('/delete/AllForCPConnector', passport.authenticate('jwt', {
  session: false
}), async (req, res) => {

  if(req.body.cpID !== undefined && req.body.connector !== undefined){

    await chargeScheduleModel
    .deleteMany(
      {
        cpID: req.body.cpID,
        connector: req.body.connector,
        status:{$in: ['waiting']}
      }
    )
    .exec();

    const cpSchedules = await chargeScheduleModel
    .find(
      {
        cpID: req.body.cpID,
        connector: req.body.connector
      }
    )
    .lean()
    .exec();

    let wrongSchedules = await chargeScheduleModel
    .find(
      {
        cpID: req.body.cpID,
        connector: req.body.connector,
        status:{$in: ['waiting']}
      }
    )
    .lean()
    .exec();

    if(wrongSchedules !== undefined && wrongSchedules.length> 0){
      return res.status(400).json({error:'خطا در انجام عملیات', 
                                    errorEN: 'Operation failed'});
    }else{

      return res.status(200).json({error: '', cpSchedules: cpSchedules});
    }

  }else{
    return res.status(400).json({error: 'خطا در پارامترهای ورودی',
                                  errorEN: 'Invalid input', 
                                  cpSchedules: []});

  }
  
});

router.post('/connectors', async (req, res) => {

  if(req.body.cpID !== undefined && req.body.cpID.length > 0){

    ocpp_chargePointModel.findOne(
      {
        CPID: req.body.cpID
      }
    )
    .then((cpInfo) => {
      if(cpInfo){
  
        let connectors = [];
  
        let Car_DC_CHAdeMO_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-DC-CHAdeMO' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_DC_CCS1_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-DC-CCS1' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_DC_CCS2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-DC-CCS2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_DC_GBT_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-DC-GB/T' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_AC_Type1_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-AC-Type1' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_AC_Type2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-AC-Type2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");

        let Car_AC_gbt_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-AC-GB/T' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Car_DC_Chaoji_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Car-DC-Chaoji' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Bus_AC_GBTtype2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Bus-AC-GB/Ttype2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Bus_AC_Type2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Bus-AC-Type2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Bus_DC_CCS2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Bus-DC-CCS2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Motorcycle_AC_Default_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Motorcycle-AC-Default' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Motorcycle_AC_Type1_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Motorcycle-AC-Type1' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        let Motorcycle_AC_Type2_connectors = cpInfo.connector.filter(cp => cp.connectorName === 'Motorcycle-AC-Type2' && 
                                                                cp.status !== "Notexist" &&
                                                                cp.status !== "Unavailable" &&
                                                                cp.status !== "Faulted");
  
        if(Car_DC_CHAdeMO_connectors !== undefined && 
            Car_DC_CHAdeMO_connectors.length > 0 && 
            Car_DC_CHAdeMO_connectors[0] !== undefined){
  
          connectors.push(Car_DC_CHAdeMO_connectors[0]);
        }
  
        if(Car_DC_CCS1_connectors !== undefined && 
            Car_DC_CCS1_connectors.length > 0 &&
            Car_DC_CCS1_connectors[0] !== undefined){
  
          connectors.push(Car_DC_CCS1_connectors[0]);
        }
  
        if(Car_DC_CCS2_connectors !== undefined && 
            Car_DC_CCS2_connectors.length >0 &&
            Car_DC_CCS2_connectors[0] !== undefined){
  
          connectors.push(Car_DC_CCS2_connectors[0]);
        }
  
        if(Car_DC_GBT_connectors !== undefined && 
            Car_DC_GBT_connectors.length > 0 &&
            Car_DC_GBT_connectors[0] !== undefined){
  
          connectors.push(Car_DC_GBT_connectors[0]);
        }
  
        if(Car_AC_Type1_connectors !== undefined && 
            Car_AC_Type1_connectors.length > 0 &&
            Car_AC_Type1_connectors[0] !== undefined){
  
          connectors.push(Car_AC_Type1_connectors[0]);
        }
  
        if(Car_AC_Type2_connectors !== undefined && 
            Car_AC_Type2_connectors.length > 0 &&
            Car_AC_Type2_connectors[0] !== undefined){
  
          connectors.push(Car_AC_Type2_connectors[0]);
        }

        if(Car_AC_gbt_connectors !== undefined && 
          Car_AC_gbt_connectors.length > 0 &&
          Car_AC_gbt_connectors[0] !== undefined){

          connectors.push(Car_AC_gbt_connectors[0]);
        }
  
        if(Car_DC_Chaoji_connectors !== undefined && 
            Car_DC_Chaoji_connectors.length > 0 &&
            Car_DC_Chaoji_connectors[0] !== undefined){
  
          connectors.push(Car_DC_Chaoji_connectors[0]);
        }
  
        if(Bus_AC_GBTtype2_connectors !== undefined && 
            Bus_AC_GBTtype2_connectors.length > 0 &&
            Bus_AC_GBTtype2_connectors[0] !== undefined){
  
          connectors.push(Bus_AC_GBTtype2_connectors[0]);
        }
  
        if(Bus_AC_Type2_connectors !== undefined && 
            Bus_AC_Type2_connectors.length > 0 &&
            Bus_AC_Type2_connectors[0] !== undefined){
  
          connectors.push(Bus_AC_Type2_connectors[0]);
        }
  
        if(Bus_DC_CCS2_connectors !== undefined && 
            Bus_DC_CCS2_connectors.length > 0 &&
            Bus_DC_CCS2_connectors[0] !== undefined){
  
          connectors.push(Bus_DC_CCS2_connectors[0]);
        }
  
        if(Motorcycle_AC_Default_connectors !== undefined && 
            Motorcycle_AC_Default_connectors.length > 0 &&
            Motorcycle_AC_Default_connectors[0] !== undefined){
  
          connectors.push(Motorcycle_AC_Default_connectors[0]);
        }
  
        if(Motorcycle_AC_Type1_connectors !== undefined && 
            Motorcycle_AC_Type1_connectors.length > 0 && 
            Motorcycle_AC_Type1_connectors[0] !== undefined){
  
          connectors.push(Motorcycle_AC_Type1_connectors[0]);
        }
  
        if(Motorcycle_AC_Type2_connectors !== undefined && 
            Motorcycle_AC_Type2_connectors.length > 0 &&
            Motorcycle_AC_Type2_connectors[0] !== undefined){
  
          connectors.push(Motorcycle_AC_Type2_connectors[0]);
        }
  
        //console.log("connectors: " , connectors);
        
        return res.status(200).send(connectors);
        
      }else{
  
        return res.status(400).json({error: "شارژری با این مشخصات یافت نشد",
                                      errorEN: 'Charger not found'});
          
      }
    });

  }else{
    return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                  errorEN: "Invalid input"});
  }

});

router.post('/repeatWeekly', passport.authenticate('jwt', {
  session: false
}), async(req, res) => {

  if(typeof(req.body.repeatWeekly) === "boolean" && req.body._id !== undefined){
    
    await chargeScheduleModel
    .findOneAndUpdate(
      {
        _id: req.body._id
      },
      {
        repeatWeekly: req.body.repeatWeekly
      }
    )
    .exec();

    return res.status(200).json({message: 'تکرار/عدم تکرار هفتگی زمانبندی با موفقیت تنظیم شد',
                                  messageEN: 'Schedule weekly repeat is set successfully'});
    
  }else{
    return res.status(400).json({error: 'خطا در پارامترهای ورودی', 
                                  errorEN: "Invalid input"});
  }
});

router.post('/repeatDaily', passport.authenticate('jwt',{
  session: false
}), async(req, res) => {

  if(typeof(req.body.repeatDaily) ==='boolean' && req.body._id !== undefined){

    await chargeScheduleModel
    .findOneAndUpdate(
      {
        _id:req.body._id
      },
      {
        repeatDaily: req.body.repeatDaily
      }
    )
    .exec();

    return res.status(200).json({message: 'تکرار/عدم تکرار روزانه زمانبندی با موفقیت تنظیم شد',
                                  messageEN: 'Schedule daily repeat is set successfully'});
  }

})

module.exports = router;