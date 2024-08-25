const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser= require('cookie-parser');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

// middleware
app.use(cors( {
    origin:[
      'http://localhost:5173',
     
    ],
    credentials:true
  } ))

app.use(express.json())
app.use(cookieParser());



// mongoDb

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.5qhzsjb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;


// 
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  
  
  //  middleware for JWT
  const logger = (req,res,next)=>{
  
    console.log('log:log info',req.method , req.url );
    next();
  }
  
  // 
  const verifyToken = (req,res,next)=>{
  
    const token = req?.cookies?.token;
  
    console.log( 'token in the miidlleware' ,token);
  
    // no token
    if(!token){
  
      return res.status(401).send( {message: 'Invalid Authirization'} )
    }
    // if token available
  
    jwt.verify(token, process.env.Access_Token_Secret, (err,decoded)=>{
      
  
      if(err){
  
        return res.status(401).send( {message: 'Invalid Authirization'} )
      }
  
      req.user = decoded;
      next();
  
  
    } )
  
    // next();
  }
  
  // cookie option
  const cookieOption={
    
    httpOnly:true,
    secure:process.env.NODE_ENV === "production" ? true : false ,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict" ,
  
  
  }







async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
     
    // server
    const database = client.db("db_user");
    const creatingCollection = database.collection("creating");


// JWT RELATED API
  // jwt related 
  app.post('/jwt',logger, async(req,res)=>{

    const user = req.body;
    console.log('token for user',user);

    const token = jwt.sign(user, process.env.Access_Token, {expiresIn:'1h'} );

    res.cookie('token',token , cookieOption)
    .send({success:true});

  } )


  // cookie =>logOut
  app.post('/logout',async(req,res)=>{

    const user = req.body;
    console.log('logging out' ,user);
    
    res.clearCookie( 'token', {...cookieOption , maxAge: 0 } ).send({success:true} )


  } )





    // feature card api .. CRUD STARTS HERE
      
    // post
    app.post("/creating", async(req,res)=>{

     
        const user = req.body;
        console.log('creating user', user );


        const result = await creatingCollection.insertOne(user);
        res.send(result);

    } )

    // get
    app.get("/creating", async(req,res)=>{
         
        
           
        const cursor = creatingCollection.find();
        const result = await cursor.toArray();
        res.send(result);



    } )
  

    // delete
    // delete
    // delete


    // delete
    app.delete("/creating/:id", async(req,res)=>{

        const id = req.params.id;
        console.log('deleted',id);

        const query = { _id: new ObjectId(id) };
        const result = await creatingCollection.deleteOne(query);

        res.send(result);


    }  )

    // update.. 1.get . 2 .put
      
    app.get('/creating/:id', async(req,res)=>{

        const id = req.params.id;
      
        // console.log(id);
      
      
        const query = { _id: new ObjectId(id) };
      
        const result = await creatingCollection.findOne(query);
      
        res.send(result);
      
      
      
          }  )

        // update . part : 2 => PUT 

          app.put('/creating/:id',async(req,res)=>{

            const id = req.params.id;
          
            const user = req.body;
          
            console.log(id,user);
          
            const query = { _id: new ObjectId(id) };
          
            const options = { upsert: true };
          
            const updateDoc = {
              $set: {
              
            name:user.name,
            subject:user.subject,
            marks:user.marks,
            photo:user.photo
          
          
          
              },
            };
                   
            const result = await creatingCollection.updateOne(query, updateDoc, options);
          
            res.send(result);
        
          
              } )
          
          
          
      
      
         



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res)=>{

    res.send("Learn Together Running");
} )

app.listen(port , ()=>{

    console.log(`Learn Together Server Running On : ${port} `)
} )