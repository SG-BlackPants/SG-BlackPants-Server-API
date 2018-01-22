# SG-BlackPants-Server-API

## System Overview
this is univScanner API Server

## Getting Started
### mongodb 3.4 설치 및 실행
## Install MongoDB
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-3.4.list
sudo apt-get update
sudo apt-get install mongodb-org
```

## Configure MongoDB Replica Settings
Open the file /etc/mongod.conf and add the following values
```
replication:
  oplogSizeMB: 5120
  replSetName: rs0
  secondaryIndexPrefetch: all
```

Setting the following commands
```
mongod
mongo
rs.initiate({"_id" : "rs0","version" : 1,"members" : [{"_id" : 0,"host" : "localhost:27017"}]})
```

## Start MongoDB
```
sudo systemctl enable mongod
sudo systemctl start mongod
```

### jdk 1.8 설치
## Install JDK 1.8
```
wget --no-cookies --no-check-certificate --header "Cookie: oraclelicense=accept-securebackup-cookie" \ http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jdk-8u161-linux-x64.tar.gz
sudo mv jdk-8u161-linux-x64.tar.gz /opt/
sudo tar -xzf jdk-8u161-linux-x64.tar.gz
sudo rm -rf jdk-8u161-linux-x64.tar.gz
```

## Configure JDK
```
sudo update-alternatives  --install /usr/bin/java java /opt/jdk1.8.0_161/bin/java 1000
sudo update-alternatives --install /usr/bin/javac javac /opt/jdk1.8.0_161/bin/javac 1000
sudo update-alternatives --install /usr/bin/javadoc javadoc /opt/jdk1.8.0_161/bin/javadoc 1000
sudo update-alternatives --install /usr/bin/javap javap /opt/jdk1.8.0_161/bin/javap 1000
sudo update-alternatives  --config java
```

### elasticsearch 5.4 설치 및 실행
## Install Elasticsearch
```
sudo apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" > sudo /etc/apt/sources.list.d/elastic-5.x.list
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get update
sudo apt-get install elasticsearch
```

## Configure Elasticsearch
Open the file /etc/elasticsearch/elasticsearch.yml to adjust the following values
```
#Set the name of your Elasticsearch Cluster
cluster.name: statusengine

#Set the name of the current node
node.name: elastic01

#Path where Elasticsearch should store data
path.data: /var/lib/elasticsearch

#Path where Elasticsearch should store log files
path.logs: /var/log/elasticsearch

#You need at least one master node inside
#of your Elasticsearch Cluster
node.master: true

#You need at least one node inside
#of your Elasticsearch Cluster, that holds your data
node.data: true
```

## Start Elasticsearch
```
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
```

### pythone 3.6.3 설치
## Install Python
```
sudo add-apt-repository ppa:jonathonf/python-3.6
sudo apt-get update
sudo apt-get install python3.6
sudo update-alternatives –config python3
```

## Install pip
```
sudo apt-get install python3-pip
sudo python3 -m pip install --upgrade pip
```

### mongo-connector 설치 및 실행
## Install Mongo-Connector
```
sudo python3 -m pip install mongo-connector
```

## Register Service
```
cd /usr/local/lib/python3.6/dist-packages/mongo_connector
git clone https://github.com/mongodb-labs/mongo-connector.git
```

## Start Mongo-Connector
```
mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager
```

### Node 설치
## Install Nodejs
```
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Start univScanner API-Server
```
cd ~
git clone https://github.com/SG-BlackPants/SG-BlackPants-Server-API.git
sudo npm install
sudo npm install -g forever
forever start -l ~/SG-BlackPants-Server-API/logfile.log  -a app.js
```
