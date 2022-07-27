const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
let envConfig = require('dotenv').config();

const http = require('http');
const socketio = require('socket.io');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const reserve = require('./routes/api/reserve');
const pay = require('./routes/api/pay');
const rpi = require('./routes/api/rpi');
const cms = require('./routes/api/cms');
const public = require('./routes/api/public');
//const updateFunctions = require('./updateFunctions');
const chargeSchedule = require('./routes/api/chargeSchedule');
const slider = require('./routes/api/slider');
const adminsAPIs = require('./routes/api/admin');

const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// let security = function(req, res, next){
//   if(!req.secure){
//     //return res.status(401).send("fault");
//   }
//   next();
// }

// app.use(security);

// DB Config
const db = require('./config/keys').mongoURI;

//let db_ ='';
//let dataCollection ='';
let ids = [];
// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log('MongoDB Connected');
    const client = mongoose.connection.client;
    db_ = client.db('dashboard_db');
    dataCollection = db_.collection('profiles');
    //const client = mongoose.connection.client;
    //db_ = client.db('dashboard_db');
    //dataCollection = db_.collection('profiles');

    // dataCollection.find().toArray((err, res) => {
    //     if(err){
    //       console.log(err);
    //     }else{
    //       res.map(doc=>{

    //         if(doc._id != null){

    //           ids.push(/*JSON.stringify(*/{"phone":doc.phone, "rfidSerial":doc.rfidserial, "name":doc.namee, "nationalCode":doc.nationalcode, "vehicleName": doc.vehicleName})/*)*/;
    //         }

    //       });

    //       //let infoes = Array.from(ids);
    //       console.log("infoes", ids);
    //     }
    //   });


  })
  .catch(err => console.log(err));


app.get('/rep', (req, res) => {
  res.send(ids).end();
})

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/reserve', reserve);
app.use('/api/pay', pay);
app.use('/api/rpi', rpi);
app.use('/api/cms', cms);
app.use('/api/public', public);
app.use('/api/slider', slider);
app.use('/api/admin', adminsAPIs);

const appconfig = require('./routes/api/appconfiguration');
const stationImage = require('./routes/api/stationImage');
app.use('/api/appconfiguration', appconfig);
app.use('/api/stationImage', stationImage);

const contact = require('./routes/api/contact');
const complaint = require('./routes/api/complaint');
const email = require('./routes/api/email');
const document = require('./routes/api/document');
const chargersStore = require('./routes/api/store/charger');
const modelsStore = require('./routes/api/store/model');
const reviewStore = require('./routes/api/store/review');
const questionStore = require('./routes/api/store/question');
const operationStore = require('./routes/api/store/operation');
const FAQStore = require('./routes/api/store/FAQ');
const LoginStore = require('./routes/api/store/login');
const adminStore = require('./routes/api/store/admin/product')
const pollStore = require('./routes/api/store/poll');
const pollLogin = require('./routes/api/store/pollLogin');
const adminLogin = require('./routes/api/store/admin/login');
const adminProduct = require('./routes/api/store/admin/product');
const agency = require('./routes/api/services/agency');
const agency_form = require('./routes/api/services/agency_form');
const store = require('./routes/api/services/store');
const salesServices = require('./routes/api/services/salesServices');
const tariff = require('./routes/api/services/tariff');
const spare = require('./routes/api/services/spare');
const repair = require('./routes/api/services/repair');
const warranty = require('./routes/api/services/warranty');
const warranty_form = require('./routes/api/services/warranty_form');
//const smartsocket_profile = require('./routes/api/services/smartsocket_profile');
//const userguide = require('./routes/api/services/userguide');
const services_slider = require('./routes/api/services/slider');
//const advertisement = require('./routes/api/services/advertisement');
const services_faq = require('./routes/api/services/FAQ');
//const notification = require('./routes/api/pushNotification');


const request_ = require('./routes/api/request');

app.use('/api/contact', contact);
app.use('/api/complaint', complaint);
app.use('/api/email', email);
app.use('/api/document', document);
app.use('/api/store/charger', chargersStore);
app.use('/api/store/model', modelsStore);
app.use('/api/store/review', reviewStore);
app.use('/api/store/question', questionStore);
app.use('/api/store/operation', operationStore);
app.use('/api/store/FAQ', FAQStore);
app.use('/api/store/login', LoginStore);
app.use('/api/store/admin/product', adminStore);
//app.use(express.static('static'));
app.use(express.static('public'));

var cron = require('node-cron');
app.use('/api/store/admin/login', adminLogin);
app.use('/api/store/admin/product', adminProduct);
app.use('/api/schedule', chargeSchedule);
app.use('/api/store/poll', pollStore);
app.use('/api/store/pollLogin', pollLogin);
app.use('/api/services/agency', agency);
app.use('/api/services/agency_form', agency_form);
app.use('/api/services/store', store);
app.use('/api/services/salesServices', salesServices);
app.use('/api/services/tariff', tariff);
app.use('/api/services/spare', spare);
app.use('/api/services/repair', repair);
app.use('/api/services/warranty', warranty);
app.use('/api/services/warranty_form', warranty_form);
//app.use('/api/services/smartsocket_profile', smartsocket_profile);
//app.use('/api/services/userguide', userguide);
app.use('/api/services/slider', services_slider);
//app.use('/api/services/advertisement', advertisement);
app.use('/api/services/FAQ', services_faq);
//app.use('/api/pushNotification', notification);
//app.use(express.static('static'));

app.use('/api/request', request_);

app.use(express.static(require('./config/keys').appDir + '/public'));
var cron = require('node-cron');

require('./config/keys').reset();
cron.schedule('0 35 11 * * *', () => {
  console.log('Getting euro everyday at 11 AM');
  require('./config/keys').reset();
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running on port ${port}`));