/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Write your transction processor functions here
 */


/**
 * Initialize some of the Asset and Participants for Demo
 * @param {org.rocket.shipping.LoadSeeds} loadSeeds
 * @transaction
 */
function LoadSeeds(loadSeeds)
{
  var factory = getFactory();
  var NS = 'org.rocket.shipping';

  // Manufacturer 
  var manufacturer = factory.newResource(NS,'Manufacturer','abhi_manuf@gmail.com');
  var manufacturerAddress = factory.newConcept(NS,'Address');
  
  manufacturer.name = 'AbhishekManufacturer'
  manufacturer.accountBalance = 2000;
  manufacturer.address = "Austin USA";

  //Shipper
  var shipper = factory.newResource(NS,'Shipper','abhi_shipper@gmail.com');
  var shipperAddress = factory.newConcept(NS,'Address');
 
  shipper.name = 'AbhishekShipper'
  shipper.accountBalance = 2000;
  shipper.address = "Dallas USA";

   //Imorter
   var importer = factory.newResource(NS,'Importer','abhi_importer@gmail.com');
   var importerAddress = factory.newConcept(NS,'Address');
   
   importer.name = 'AbhishekImporter';
   importer.accountBalance = 2000;
   importer.address = "California USA";

   //TemperatureDevice
   var temperatureDevice = factory.newResource(NS,'TemperatureDevice','496ef16596bfe697');
   temperatureDevice.currentTemperature ='23';
   temperatureDevice.updatedOn = loadSeeds.timestamp;

   //LocationDevice
   var locationDevice = factory.newResource(NS,'LocationDevice','496ef16596bfe697');
   locationDevice.currentLatitude ='28.584670';
   locationDevice.currentLongitude ='77.352010';
   locationDevice.updatedOn = loadSeeds.timestamp;

   //Loader
   var loader = factory.newResource(NS,'Loader','DL02AB006');
   loader.temperatureDevice = temperatureDevice;
   loader.locationDevice = locationDevice;

   //Contract 
   var contract = factory.newResource(NS,'Contract','CON_001');
   contract.manufacturer = factory.newRelationship(NS,'Manufacturer','abhi_manuf@gmail.com');
   contract.shipper = factory.newRelationship(NS,'Shipper','abhi_shipper@gmail.com');
   contract.importer = factory.newRelationship(NS,'Importer','abhi_importer@gmail.com');
   var tommorow = loadSeeds.timestamp;
   console.log("tommorow "+tommorow);
   tommorow.setDate(tommorow.getDate()+1);
   console.log("tommorow1 "+tommorow);
   contract.arrivalDateTime = tommorow;
   contract.unitPrice = 2;
   contract.minimumTemperature = 3;
   contract.maximumTemperature = 20;
   contract.minimumTemperatureViolationFinePerUnit = .2;
   contract.maximumTemperatureViolationFinePerUnit = .1;
   contract.delayViolationFine = .15;

   //Shipment 
   var shipment = factory.newResource(NS,'Shipment','SHIP_001');
   shipment.productType = 'Fruit';
   shipment.ShipmentStatus ='Created';
   shipment.unitCount = 100;
   var temperatureRecord = getFactory().newConcept(NS,"TemperatureRecord");
   temperatureRecord.centigrade = 10;
   temperatureRecord.deviceId = "D45";

   shipment.temperatureRecords = [temperatureRecord];
  
   shipment.contract = factory.newRelationship(NS,'Contract','CON_001');
   shipment.loader = loader;
   return getParticipantRegistry(NS +'.Manufacturer').then(function(manufacturerRegistry){
      return manufacturerRegistry.addAll([manufacturer]);
   })
   .then(function(){
      return getParticipantRegistry(NS +'.Shipper');
   })
   .then(function(shipperRegistry){
      return shipperRegistry.addAll([shipper]);
   })
   .then(function(){
    return getParticipantRegistry(NS +'.Importer');
    })
   .then(function(importerRegistry){
    return importerRegistry.addAll([importer]);
    })
    .then(function(){
     return getAssetRegistry(NS +'.TemperatureDevice');
      })
    .then(function(temperatureDeviceRegistry){
      return temperatureDeviceRegistry.addAll([temperatureDevice]);
      })
   .then(function(){
      return getAssetRegistry(NS +'.LocationDevice');
       })
   .then(function(locationDeviceRegistry){
       return locationDeviceRegistry.addAll([locationDevice]);
          })
   .then(function(){
       return getAssetRegistry(NS +'.Loader');
          })
   .then(function(loaderRegistry){
      return loaderRegistry.addAll([loader]);
         })
    .then(function(){
    return getAssetRegistry(NS +'.Contract');
     })
     .then(function(contractRegistry){
        return contractRegistry.addAll([contract]);
     })
     .then(function(){
        return getAssetRegistry(NS +'.Shipment');
     })
     .then(function(shipmentRegistry){
      broadCastShipment(shipment);
        return shipmentRegistry.addAll([shipment]);
     })

}

function broadCastShipment(shipment)
{
   console.log('SHIPMENT BROADCAST'+ shipment);
   var shipmentNotification = getFactory().newEvent('org.rocket.shipping','ShipmentStatusCommunicator');
   shipmentNotification.shipment = shipment;
   shipmentNotification.ShipmentStatus = shipment.ShipmentStatus;
   emit(shipmentNotification);
}

function broadCastTracking(shipment)
{
   console.log('TrackingEvent BROADCAST'+ shipment);
   var trackingNotification = getFactory().newEvent('org.rocket.shipping','TrackingEvent');
   trackingNotification.shipment = shipment;
   trackingNotification.trackingRecords = shipment.trackingRecords;
   emit(trackingNotification);
}
/**
 * Submit News
 * @param{org.rocket.shipping.PostNews} postNews
 * @transaction
 */
function postNews(postNews)
{
var news = postNews.news;
console.log('news BROADCAST'+ news);
   var broadCastNewsNotification = getFactory().newEvent('org.rocket.shipping','BroadCastNews');
   broadCastNewsNotification.news = news;
   emit(broadCastNewsNotification);
}

/**
 * This function Apply Contract Logic 
 * @param{org.rocket.shipping.SubmitIOTData} submitIOTData
 * @transaction
 */
function submitIOTData(submitIOTData)
{
   var NS = 'org.rocket.shipping';
   var shipmentData;
   var myLoader;
   console.log("submitIOTData " + submitIOTData);
  var payload = JSON.parse(submitIOTData.payload);
  if(payload.Type == "Location")
  {
   console.log("payload Value"+ payload.Value.Latitude);
/////////////////// Temperature Body////

var trackingRecord = getFactory().newConcept(NS,"TrackingRecord");
trackingRecord.latitude = payload.Value.Latitude;
trackingRecord.longitude = payload.Value.Longitude;
trackingRecord.deviceId = payload.DeviceId;

 console.log("Getting Loader ");
 var tem ;
return getAssetRegistry(NS +'.LocationDevice')   
.then(function(locationDeviceRegistry){
return  locationDeviceRegistry.get(payload.DeviceId);

 })
 .then(function(locDevice){
   console.log("locationDevice  "+locDevice.DeviceId);

   return query('getLoadersbyLocationDevice',{locationDevice: 'resource:org.rocket.shipping.LocationDevice#'+locDevice.DeviceId});

 })
 .then(function(shipLoader){
   console.log("Loader  "+shipLoader);
   loaderID = shipLoader[0].LoaderId;
   
   return query('getShipmentbyLoader',{loader: 'resource:org.rocket.shipping.Loader#'+loaderID});
 })
 .then(function(shipmentval){
   console.log("shipment  "+shipmentval);
   shipmentData = shipmentval[0];
   return getAssetRegistry(NS +'.Shipment') 
   
 })
 .then(function(shipmentReg){ 
   console.log("into shipmentRegisrty "+ shipmentData.ShipmentId);

   if(shipmentData){
   if(shipmentData.trackingRecords)
   {
      console.log("pusing  trackingRecord ");
      shipmentData.trackingRecords.push(trackingRecord);
     
   }else{
      console.log("creating  trackingRecord ");
      console.log("trackingRecord "+ trackingRecord);
      shipmentData.trackingRecords = [trackingRecord];
      
   }
   if( shipmentData.ShipmentStatus == 'Arrived'){
      return "No Device Data need to push as shipment is arrived";
   }

   broadCastTracking(shipmentData);
   console.log("shipmentData" + shipmentData);
   console.log("shipmentData.temperatureRecords" + shipmentData.trackingReading);
   
   return shipmentReg.update(shipmentData);
   }
 }).catch(function(error){
   console.log("error  "+ error);
 })
////////////////////////////////

  }
  else if(payload.Type == "Temperature"){

   /////////////////// Temperature Body////

   var temperatureRecord = getFactory().newConcept(NS,"TemperatureRecord");
   temperatureRecord.centigrade = payload.Value;
   temperatureRecord.deviceId = payload.DeviceId;
   
    console.log("Getting Loader ");
    var tem ;
   return getAssetRegistry(NS +'.TemperatureDevice')   
  .then(function(temperatureDeviceRegistry){
   return  temperatureDeviceRegistry.get(payload.DeviceId);

    })
    .then(function(tempDevice){
      console.log("tem  "+tempDevice.DeviceId);
   
      return query('getLoadersbyTemperatureDevice',{temperatureDevice: 'resource:org.rocket.shipping.TemperatureDevice#'+tempDevice.DeviceId});

    })
    .then(function(shipLoader){
      console.log("Loader  "+shipLoader);
      loaderID = shipLoader[0].LoaderId;
      
      return query('getShipmentbyLoader',{loader: 'resource:org.rocket.shipping.Loader#'+loaderID});
    })
    .then(function(shipmentval){
      console.log("shipment  "+shipmentval);
      shipmentData = shipmentval[0];
      return getAssetRegistry(NS +'.Shipment') 
      
    })
    .then(function(shipmentReg){ 
      console.log("into shipmentRegisrty "+ shipmentData.ShipmentId);
   
      if(shipmentData){
      if(shipmentData.temperatureRecords)
      {
         console.log("pusing  temperatureReading ");
         shipmentData.temperatureRecords.push(temperatureRecord);
        
      }else{
         console.log("creating  temperatureReading ");
         console.log("create TemperatureRecord "+ temperatureRecord);
         shipmentData.temperatureRecords = [temperatureRecord];
     
      }
      if( shipmentData.ShipmentStatus == 'Arrived'){
         return "No Device Data need to push as shipment is arrived";
      }
      shipmentData.ShipmentStatus = 'InTransit';
      console.log("shipmentData" + shipmentData);
      console.log("shipmentData.temperatureRecords" + shipmentData.temperatureRecords);
      
      return shipmentReg.update(shipmentData);
      }
    }).catch(function(error){
      console.log("error  "+ error);
    })
  ////////////////////////////////
  }else
  {
   console.error("invalid type of message");
  }
}




/**
 * This function Apply Contract Logic 
 * @param{org.rocket.shipping.ShipmentReceived} shipmentReceived
 * @transaction
 */
function shipmentReceived(shipmentReceived)
{
 var NS = 'org.rocket.shipping';
 var shipment = shipmentReceived.shipment;
 var contract = shipment.contract;
 var manufacturer = contract.manufacturer;
 var shipper = contract.shipper;
 var importer = contract.importer;
 var money = contract.unitPrice * shipment.unitCount;
 var penalty = 0;
 console.log("shipment recived "+shipmentReceived.timestamp);
 console.log("shipment shipment.contract "+ contract.arrivalDateTime);
  shipment.ShipmentStatus = 'Arrived';
  var delay = (shipmentReceived.timestamp.getDate() - contract.arrivalDateTime.getDate());
  console.log("delay "+ delay);
   if(delay > 0)
  {
   penalty =  contract.delayViolationFine * delay;
   console.log("delay in days "+ delay+" penalty "+ penalty);
  }

     if(shipment.temperatureRecords && shipment.temperatureRecords.length > 0){
      var reading = shipment.temperatureRecords;
            var minCheck = true;
            var maxCheck = true;
            var minPan = 0.0;
            var maxPan = 0.0;
            var minTemp ;
            var maxTemp ;
            var fisrtCheck = true;
           reading.forEach(function(item){
            console.log("inside temperature check "+item.centigrade);
           if( item.centigrade < contract.minimumTemperature && (!minTemp || item.centigrade < minTemp ))
           {
            minTemp = item.centigrade ;
            minPan = (contract.minimumTemperature - item.centigrade)*contract.minimumTemperatureViolationFinePerUnit;
            console.log("Voilation min temperature reading.centigrade "+ item.centigrade + "consolidated penalty "+ minPan);
           }
           if(item.centigrade > contract.maximumTemperature && (!maxTemp || item.centigrade > maxTemp))
           {
            maxTemp = item.centigrade;
            maxPan = (item.centigrade - contract.maximumTemperature)*contract.maximumTemperatureViolationFinePerUnit;
            console.log("Voilation maximum temperature reading.centigrade "+ item.centigrade + "consolidated penalty "+ maxPan);
           }
            
          });
        }

         penalty = penalty + minPan + maxPan;
         console.log("Penalty is "+ penalty);
     
         money -= penalty*shipment.unitCount;

  if(money < 0)
  {
   money = 0;
  }
  manufacturer.accountBalance += money;
  importer.accountBalance -= money;
 

  return getParticipantRegistry(NS +'.Manufacturer').then(function(manufacturerRegistry){
   return manufacturerRegistry.update(manufacturer);
})
.then(function(){
 return getParticipantRegistry(NS +'.Importer');
 })
.then(function(importerRegistry){
 return importerRegistry.update(importer);
 })
 .then(function(){
 return getAssetRegistry(NS +'.Shipment');
  })
  .then(function(contractRegistry){
     return contractRegistry.update(shipment);
  })
  .then(function(){
     return getAssetRegistry(NS +'.Shipment');
  })
  .then(function(shipmentRegistry){
   broadCastShipment(shipment);
     return shipmentRegistry.update(shipment);
  })


}

