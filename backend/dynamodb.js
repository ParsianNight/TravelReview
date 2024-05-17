const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
region:'us-east-1'
});

const dynamodb = new AWS.DynamoDB();


  
const createReviewsTableParams = {
    TableName: 'reviews',
    KeySchema: [
      { AttributeName: 'reviewId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'reviewId', AttributeType: 'S' },
      { AttributeName: 'country', AttributeType: 'S' },
      { AttributeName: 'city', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CountryIndex',
        KeySchema: [
          { AttributeName: 'country', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'CityIndex',
        KeySchema: [
          { AttributeName: 'city', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ]
};


const createNewTableParams = {
    TableName: 'users', // New table name
    KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' } // Primary key: email
    ],
    AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' } // Attribute definition for email
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
dynamodb.createTable(createNewTableParams, (err, data) => {
    if (err) {
        console.error("Error creating new table:", err);
    } else {
        console.log("New table created successfully:", data);
    }
});
  
// Create the reviews table
// dynamodb.createTable(createReviewsTableParams, function(err, data) {
//     if (err) {
//       console.error('Unable to create reviews table. Error JSON:', JSON.stringify(err, null, 2));
//     } else {
//       console.log('Created reviews table. Table description JSON:', JSON.stringify(data, null, 2));
//     }
// });

module.exports = dynamodb;