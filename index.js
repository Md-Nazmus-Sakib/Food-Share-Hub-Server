const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wear
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.91makds.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const featuredFoodsCollection = client.db("Food-Share-Hub").collection("featured-foods");
        const bookFoodsCollection = client.db("Food-Share-Hub").collection("bookings-food");

        //To Get Featured food Data by filtering Quantity and Limit 6 data
        app.get('/feature-food', async (req, res) => {
            const result = await featuredFoodsCollection.find().sort({ Food_Quantity: -1 }).limit(6).toArray();
            res.send(result)
        })
        // To get all available food by sorting expired-date
        app.get('/food', async (req, res) => {
            let query = {}
            const userEmail = req.query?.email;
            // console.log(userEmail)
            if (userEmail) {
                query = { Donator_Email: userEmail }
            }
            const result = await featuredFoodsCollection.find(query).sort({ Expired_Date: 1 }).toArray();
            res.send(result)
        })
        //To get individual food by id 
        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await featuredFoodsCollection.findOne(query);
            res.send(result)
        })

        app.post('/food', async (req, res) => {
            const addFood = req.body;
            const result = await featuredFoodsCollection.insertOne(addFood);
            res.send(result)

        })
        //Delete a food
        app.delete('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await featuredFoodsCollection.deleteOne(query);
            res.send(result)
        })

        //My booking section-----------------------------------

        //post my booking to store db

        app.post('/bookings-food', async (req, res) => {
            const bookedFood = req.body;
            const result = await bookFoodsCollection.insertOne(bookedFood)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Food Share Hub is Running')
})

app.listen(port, () => {
    console.log(`Food Share Hub is Running on port: ${port}`)
})
