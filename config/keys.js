const axios = require('axios');
const path = require('path');
console.log(path.dirname(require.main.filename))

const lastDirArr = path.dirname(require.main.filename).split('/');
let lastDir = '';
if(lastDirArr[lastDirArr.length-1])
	lastDir = lastDirArr[lastDirArr.length-1];

module.exports = {
  mongoURI:
  "mongodb://samani:19neerg*eert87@10.19.1.8:27017/dashboard_db",
  //"mongodb://AS11:27017/dashboard_db",
  secretOrKey: "secret", //todo
  EuroVal: "",
  appDir: path.dirname(require.main.filename),
  lastDir: lastDir + '/',
  mapBoxConfig: {
    avgPerMeterConsumption: 1,
    avgPerSecond: 1,
    mapBoxToken: "pk.eyJ1IjoiYmVoc2FtYW5tYXBuYSIsImEiOiJjazBwMG9mbnQwZXdzM3BuenhhZXFtYjR2In0.BLhJoFQnep8wbMS5oa65sQ"
  }
};

module.exports.reset = async function(){
  let resAPI = '';//await axios.get('http://api.navasan.tech/latest/?api_key=aRsjf1lHzhgPsRA3BBaTX1ggZL1FlixG&item=eur')
    //console.log(resAPI.data.eur.value); 
    
    // let resAPINew = await axios.get('https://api.accessban.com/v1/data/sana/json')
    // const eur = resAPINew.data.sana.data.find(dt => dt.slug === 'sana_buy_eur');
    // const usd = resAPINew.data.sana.data.find(dt => dt.slug === 'sana_buy_usd');
    // console.log(/*resAPINew.data.sana.data,*/ eur.p, usd.p);

    
    // const EuroVal = Math.round(( eur.p)/10);//eur.p; //resAPI.data.eur.value;
    // const UsdVal = Math.round(( usd.p)/10);

    // const EuroChanged = await EuroChangedModel
    // .find()
    // .exec();

    // if(EuroChanged && EuroChanged.length > 0 && EuroChanged[0].lastValue !== undefined){

    //   if(parseInt(EuroVal/*resAPI.data.eur.value*/) !== EuroChanged[0].lastValue){
        
    //     await EuroChangedModel
    //     .updateOne(
    //       {
    //         id: EuroChanged._id
    //       },{
    //         lastValue: EuroVal,/*resAPI.data.eur.value*/
    //         lastValueUsd: UsdVal
    //       }
    //     )
    //     .exec();

    //     module.exports.EuroChanged = true;
    //   }else{
    //     module.exports.EuroChanged = false;
    //   }

    // }

    // module.exports.EuroVal = EuroVal/*resAPI.data.eur.value*/;
    // module.exports.UsdVal = UsdVal;
    
}

module.exports.resetEuroChanged = async function(changeStatus){
  console.log(typeof(changeStatus))
  if(typeof(changeStatus) === 'boolean')
    module.exports.EuroChanged = changeStatus;
}

module.exports.mapBoxConfig = {
  avgPerMeterConsumption: 1,
  avgPerSecond: 1,
  mapBoxToken: "pk.eyJ1IjoiYmVoc2FtYW5tYXBuYSIsImEiOiJjazBwMG9mbnQwZXdzM3BuenhhZXFtYjR2In0.BLhJoFQnep8wbMS5oa65sQ"
}
