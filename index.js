const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivmjea7.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      const appoinmentCollection = client.db("doctorPortal").collection("appoinmentService")
      const bookingCollection = client.db('doctorPortal') .collection('bookingData')
      const userCollection = client.db('doctorPortal') .collection('userData')

      // app.use('/', userRoute)

      app.post('/userData', async (req,res) => {
        const user = req.body
        const result = await userCollection.insertOne(user)
        res.send(result)
      })
      app.get('/userData', async (req,res) => {
        const query = {}
        const result = await userCollection.find(query).toArray()
        res.send(result)
      })

      app.get('/userData/admin/:email', async (req,res) => {
        const email = req.params.email;
        const query={email}
        const result = await userCollection.findOne(query)
        console.log(result)
        res.send({isAdmin: result?.role === 'admin'})
      })

      app.put('/userData/admin/:id', async(req,res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const options ={upsert:true};
        const updatedDoc = {
          $set: {
            role:'admin'
          }
        }
        const result = await userCollection.updateOne(filter, updatedDoc, options)
        // console.log(result)
        res.send(result)
      })
      
      app.get('/bookingData', async (req,res) => {
        let query = {}
        if(req.query.email){
          query = {
            email: req.query.email
          }
        }
        const result = await bookingCollection.find(query).toArray()
        res.send(result)
      })
      
      app.post('/bookingData', async (req,res) => {
        const bookingsData = req.body
        // console.log(bookingsData)
        const query ={
          googleEmail: bookingsData.googleEmail,
          appointmentDate: bookingsData.appointmentDate,
          treatmentName : bookingsData.treatmentName,
          email : bookingsData.email
        }
        const bookedData = await bookingCollection.find(query).toArray()
        if(bookedData.length){
          const errMessage = `You have already booking on ${bookingsData.appointmentDate}`
          return res.send({acknowledged: false , errMessage})
        }
        // console.log(bookingsData)
        const result = await bookingCollection.insertOne(bookingsData)
        res.send(result)
      })

      app.delete('/bookingData/:id', async(req,res) => {
        const id = req.params.id;
        // console.log(typeof(id))
        // console.log(id)
        const query = {_id: new ObjectId(id)}
        // console.log(query)
        const result = await bookingCollection.deleteOne(query)
        console.log(result)
        
        res.send(result)
      })

      app.get('/appoinmentService', async (req,res) => {
        const date = req.query.date;
        // console.log(date)
        const query = {};
        const appoinmentResults = await appoinmentCollection.find(query).toArray()
        // const result =  cursor;
        const bookingQuery = {appointmentDate: date}
        const alreadyBooked = await bookingCollection.find(bookingQuery).toArray()

        appoinmentResults.forEach(result => {
            const appoinmentBooked = alreadyBooked.filter(book => book.treatmentName === result.name)
            const bookedSlots = appoinmentBooked.map(book => book.slot)
            const remainingSlots = result.slots.filter(slot => !bookedSlots.includes(slot))
            result.slots = remainingSlots
            // console.log(appoinmentBooked,bookedSlots)
        })
        res.send(appoinmentResults)
      })

    } 
    finally {
    }
  }
  run().catch(console.log);



app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})