/* 
const express = require('express')
const router = express.Router()
const userCollection = client.db('doctorPortal') .collection('userData')

router.post("/userData" , async (req,res) => {
    const user = req.body
    const result = await userCollection.insertOne(user)
    res.send(result)
  })

  module.exports = router */