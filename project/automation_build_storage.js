const express = require('express');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const app = express();
const axiosInstance = axios.create({
  auth: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD
  }
});
async function connectToMongoDB() {
  const uri = 'mongodb://localhost:27017/';
  const dbName = 'jenkins';

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // API 1
    const apiUrl1 = 'http://172.16.0.15:8080/jenkins/view/R13_1_POC_GW/api/json';
    const treeParam = 'tree=jobs[name,builds[number,result,timestamp,duration,cause,artifacts]]';
    const response1 = await axiosInstance.get(`${apiUrl1}?${treeParam}`);
    const jobs1 = response1.data.jobs;
    const dataToInsert1 = jobs1.map(job => ({
      name: job.name,
      builds: job.builds.map(build => ({
        number: build.number,
        result: build.result,
        timestamp: build.timestamp,
        duration: build.duration,
        cause: build.cause,
        artifacts: build.artifacts
      }))
    }));
    const collection1 = db.collection('view_1');
    await collection1.insertMany(dataToInsert1);
    console.log(`Inserted ${dataToInsert1.length} documents into view_1`);

    // API 2
    const apiUrl2 = 'http://172.16.0.15:8080/jenkins/view/R13.0_POC/api/json';
    
    const response2 = await axiosInstance.get(`${apiUrl2}?${treeParam}`);
    const jobs2 = response2.data.jobs;
    const dataToInsert2 = jobs2.map(job => ({
      name: job.name,
      builds: job.builds.map(build => ({
        number: build.number,
        result: build.result,
        timestamp: build.timestamp,
        duration: build.duration,
        cause: build.cause,
        artifacts: build.artifacts
      }))
    }));
    const collection2 = db.collection('view_2');
    await collection2.insertMany(dataToInsert2);
    console.log(`Inserted ${dataToInsert2.length} documents into view_2`);

    // API 3
    const apiUrl3 = 'http://10.225.29.51:8080/jenkins/view/POC_CI2_AUF_Dashboard/api/json';
    
    const response3= await axiosInstance.get(`${apiUrl3}?${treeParam}`);
    const jobs3 = response3.data.jobs;
    const dataToInsert3 = jobs3.map(job => ({
      name: job.name,
      builds: job.builds.map(build => ({
        number: build.number,
        result: build.result,
        timestamp: build.timestamp,
        duration: build.duration,
        cause: build.cause,
        artifacts: build.artifacts
      }))
    }));
    const collection3 = db.collection('view_3');
    await collection3.insertMany(dataToInsert2);
    console.log(`Inserted ${dataToInsert3.length} documents into view_3`);

        // API 3
        const apiUrl4 = 'http://10.225.29.51:8080/jenkins/view/GW_CI2_AUF_Dashboard/api/json';
    
        const response4= await axiosInstance.get(`${apiUrl4}?${treeParam}`);
        const jobs4 = response4.data.jobs;
        const dataToInsert4 = jobs4.map(job => ({
          name: job.name,
          builds: job.builds.map(build => ({
            number: build.number,
            result: build.result,
            timestamp: build.timestamp,
            duration: build.duration,
            cause: build.cause,
            artifacts: build.artifacts
          }))
        }));
        const collection4 = db.collection('view_4');
        await collection4.insertMany(dataToInsert2);
        console.log(`Inserted ${dataToInsert4.length} documents into view_4`);

      

    await client.close();
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

app.get('/sync', async (req, res) => {
  await connectToMongoDB();
  res.send('Data synced successfully!');
});

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});