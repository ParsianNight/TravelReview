require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client , DeleteObjectCommand  } = require('@aws-sdk/client-s3');


const allowedOrigin = process.env.ALLOWED_ORIGIN;

try {
    

const app = express();
const port = 3000;

app.use(cors({
    origin: allowedOrigin,
    credentials: true
  }));

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const docClient = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());




const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
  });

  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: 'original-uni-bucket', 
       acl: 'public-read',
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      },
    }),
  });

  
  app.get('/api/health', async (req, res) => {
    res.status(200).send("health");
});

  app.post('/api/review', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        
        const file = req.file;
        console.log(file);
      
        let image_url = file.key;
        console.log(image_url)

       
        const { country, city, rating, comment, email } = req.body;
        const reviewId = uuid();

        const reviewParams = {
            TableName: 'reviews',
            Item: {
                reviewId,
                country,
                city,
                rating,
                comment,
                email,
                image: image_url
            }
        };

        await docClient.put(reviewParams).promise();

        res.status(201).json({ message: 'Review created successfully', reviewParams });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to upload file and create review' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const params = {
            TableName: 'reviews'
        };

        const data = await docClient.scan(params).promise();

        res.status(200).json(data.Items);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
app.get('/api/reviews/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const params = {
            TableName: 'reviews',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };

        const data = await docClient.scan(params).promise();

        res.status(200).json(data.Items);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
app.delete('/api/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        const getParams = {
            TableName: 'reviews',
            Key: {
                reviewId: reviewId
            }
        };

        const { Item: review } = await docClient.get(getParams).promise();

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const s3Params = {
            Bucket: 'project-images-unis',
            Key: review.image 
        };

        // Delete the image from S3 bucket
        await s3Client.send(new DeleteObjectCommand(s3Params));

        // Delete the record from DynamoDB
        const deleteParams = {
            TableName: 'reviews',
            Key: {
                reviewId: reviewId
            }
        };

        await docClient.delete(deleteParams).promise();

        res.status(200).json({ message: 'Review and associated image deleted successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to delete review and associated image' });
    }
});
app.put('/api/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { country, city, rating, comment } = req.body;

    try {
        let updateExpression = 'SET ';
        const expressionAttributeValues = {};
        const expressionAttributeNames = {}; // Add this line

        if (country) {
            updateExpression += '#country = :country, '; // Update to use expression attribute name
            expressionAttributeValues[':country'] = country;
            expressionAttributeNames['#country'] = 'country'; // Define expression attribute name
        }
        if (city) {
            updateExpression += '#city = :city, '; // Update to use expression attribute name
            expressionAttributeValues[':city'] = city;
            expressionAttributeNames['#city'] = 'city'; // Define expression attribute name
        }
        if (rating) {
            updateExpression += '#rating = :rating, '; // Update to use expression attribute name
            expressionAttributeValues[':rating'] = rating;
            expressionAttributeNames['#rating'] = 'rating'; // Define expression attribute name
        }
        if (comment) {
            updateExpression += '#comment = :comment, '; // Update to use expression attribute name
            expressionAttributeValues[':comment'] = comment;
            expressionAttributeNames['#comment'] = 'comment'; // Define expression attribute name
        }

        // Remove the trailing comma and space from the updateExpression
        updateExpression = updateExpression.slice(0, -2);

        // Check if there are any attributes to update
        if (Object.keys(expressionAttributeValues).length === 0) {
            return res.status(400).json({ error: 'No attributes provided for update' });
        }

        const params = {
            TableName: 'reviews',
            Key: {
                reviewId: reviewId
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames, // Add this line
            ReturnValues: 'ALL_NEW'
        };

        const data = await docClient.update(params).promise();

        res.status(200).json(data.Attributes);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to update review' });
    }
});


app.post('/api/users', (req, res) => {
    
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        const user = {
            username: username,
            email: email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const params = {
            TableName: 'users',
            Item: user,
            ConditionExpression: 'attribute_not_exists(email)' // Ensure email is unique
        };

        docClient.put(params, (err, data) => {
            if (err) {
                if (err.code === 'ConditionalCheckFailedException') {
                    return res.status(409).json({ message: "Email already exists" });
                }
                console.error("Error inserting user into DynamoDB:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            console.log("User inserted successfully:", data);
            res.status(201).json({ message: "User created successfully", username: username });
        });
    });
});


// API endpoint for user login
app.post('/api/login', (req, res) => {
    // Extract credentials from request body
    const { email, password } = req.body;

    // Define parameters for DynamoDB GetItem operation
    const params = {
        TableName: 'users',
        Key: {
            email: email
        }
    };

    // Retrieve user from DynamoDB
    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Error retrieving user from DynamoDB:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // Check if user exists
        if (!data.Item) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare hashed password with input password
        bcrypt.compare(password, data.Item.password, (err, result) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            // If passwords match, login successful
            if (result) {
                res.status(200).json({ message: "Login successful",  email });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        });
    });
});
app.put('/api/update-username', (req, res) => {
    // Extract email and new username from request body
    const { email, newUsername } = req.body;

    // Define parameters for updating the item in DynamoDB
    const params = {
        TableName: 'users', // Table name
        Key: {
            'email': email // Primary key: email
        },
        UpdateExpression: 'SET username = :username', // Update username attribute
        ExpressionAttributeValues: {
            ':username': newUsername // New username value
        },
        
    };

    // Update item in DynamoDB using Document Client
    docClient.update(params, (err, data) => {
        if (err) {
            console.error('Error updating username:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Username updated successfully:', data);
            res.status(200).json({ message: 'Username updated successfully', user: data.Attributes });
        }
    });
});
app.get('/api/user/:email', (req, res) => {
    // Extract email from request parameters
    const { email } = req.params;

    // Define parameters for querying the DynamoDB table
    const params = {
        TableName: 'users', // Table name
        KeyConditionExpression: 'email = :email', // Query by email attribute
        ExpressionAttributeValues: {
            ':email': email // Email value to query
        }
    };

    // Query DynamoDB using Document Client
    docClient.query(params, (err, data) => {
        if (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (data.Items.length === 0) {
                res.status(404).json({ message: 'User not found' });
            } else {
                console.log('User details retrieved successfully:', data.Items[0]);
                res.status(200).json({ user: data.Items[0] });
            }
        }
    });
});app.delete('/api/user/:email', (req, res) => {
    // Extract email from request parameters
    const { email } = req.params;

    // Define parameters for deleting the item from the DynamoDB table
    const params = {
        TableName: 'users', // Table name
        Key: {
            email: email // Primary key of the item to delete
        }
    };

    // Delete item from DynamoDB using Document Client
    docClient.delete(params, (err, data) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('User deleted successfully');
            res.status(200).json({ message: 'User deleted successfully' });
        }
    });
});

const s3 = new AWS.S3();

app.get('/api/images', (req, res) => {
    const params = {
        Bucket: 'project-images-unis', 
    };

    s3.listObjectsV2(params, (err, data) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).json({ error: 'Failed to fetch images' });
        } else {
            
            const imageNames = data.Contents.map(item => item.Key);
            res.json(imageNames);
        }
    });
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://cloudProject-load-balancer-1545386799.us-east-1.elb.amazonaws.com:${port}`);
});


module.exports = {
    docClient: docClient,
    dynamoDB: new AWS.DynamoDB() 
};


} catch (error) {
    console.loog("Error occured.")
}