









const cheerio = require('cheerio');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const htmlFile = './Ctest.html';
const dbName = 'First';
const collectionName = 'example';

async function parseHtmlAndInsertIntoMongo() {
  try {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const $ = cheerio.load(html);

    const tableData = [];
    $('table.final').find('tr').each((index, element) => {
      if (index!== 0) { 
        const row = {};
        $(element).find('td').each((index, element) => {
          row[`Column${index + 1}`] = $(element).text();
        });
        tableData.push(row);
      }
    });

    const dataObject = {
      totalTCs: tableData[0]['Column2'],
      passedTCs: tableData[1]['Column2'],
      failedTCs: tableData[2]['Column2'],
      totalTimeTaken: tableData[3]['Column2'],
    };

    const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne(dataObject);

    console.log(`Inserted 1 document into MongoDB`);
    client.close();
  } catch (err) {
    console.error(err);
  }
}

parseHtmlAndInsertIntoMongo();