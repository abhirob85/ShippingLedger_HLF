# Shipping-Ledger

-This is  Shipment project that improve transparency, trust etc 
-Please download Hyperledger Fabric environment from official website 
-Please download Docker
-Please download Composer runtime and dependent packages
-Oraganigaztion VPN might block TCP connection to broker.hivemq.com . It is recomended to use home network

# For instalation 
-composer network install --card PeerAdmin@hlfv1 --archiveFile --  D:/Project/PersonalProject/VSCodeWorkSpace/BlockChainFulfilment/dist/fulfilment-bna@0.0.1.bna

# To start Blockchain Network 
-composer network start --networkName fulfilment-bna --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card -PeerAdmin@hlfv1 --file networkadmin.card

# For installing Rest Server 
-npm install -g composer-rest-server

# Start Rest Server 
-composer-rest-server 
-and follow the instructions
