var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
    apikey: '2B776E4A523075526E366F3847324564494C47466D2B5146642F36484F4B306F36466F68393436464373633D'
});

module.exports.sendsmsEN = function sendsmsEN(number,code,patterncode){
api.Send({
        message: "This is a test message from Meco, Mapna, Iran. Please contact Mr.AAbesi after you recieved this message.",
        sender: "0018018949161",
        receptor: number
    },
        function(response, status) {
        console.log("sendsmsEN response", response);
        console.log("sendsmsEN status", status);
    });
}

module.exports.api = api;