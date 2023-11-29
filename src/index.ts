import express, { application } from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import * as http from 'http';
import mongoose from 'mongoose';

const app = express();

// Setup socket.io
const socketIoOptions = {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
};

const server = http.createServer(app);
const io = new Server(server, socketIoOptions);
const port = 5000;

// Corzzzzz
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
  

// Connect to mongodb

mongoose.connect(`mongodb://mongotodo:27017/ToDoDB`, {}).then(() => {console.log('Connected To MongoDB');})

//

// Define schemas and models

const todoSchema = new mongoose.Schema({
    title: String,
    content: String,
    isComplete: Boolean,
    timeCreated: Number
})

const ToDo = mongoose.model('ToDo', todoSchema);

//

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('A user connected....');
})


app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Godbye cruel world, thy smothering me, I cannot withstand anymore........')
})

app.get('/api', (req: Request, res: Response) => {
    res.send('This is a test!!!!!!! You punched the API you big fart !!!')
})

app.get('/api/todos', async (req: Request, res: Response) => {
    
    // res.send('<h1>Fetch those ToDo\'zers</h1>');

    try {

        const allToDos = await ToDo.find();

        io.emit('Fetch Todos');

        res.status(201).json(allToDos);
        
    } catch (error) {
        
        console.error(error);

        res.status(500).json({ error: 'Internal server error...' });

    }

})

app.post('/api/createtodo', async (req: Request, res: Response) => {
    
    try {

        const newToDo = new ToDo({
            title: req.body.title,
            content: req.body.content,
            isComplete: req.body.isComplete,
            timeCreated: req.body.timeCreated
        })

        const savedToDo = await newToDo.save();

        io.emit('ToDo Created', savedToDo);

        res.status(201).json(savedToDo);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

app.put('/api/updatetodo/:id', async(req: Request, res: Response) => {

    console.log('Update endpoint reached......');
    
    try {

        const updatedTodo = await ToDo.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content
                },
            },
            { new: true }
        );
        
        if(!updatedTodo){
            return res.status(404).json({ error: 'Post not found!' });
        }

        io.emit('ToDo Updated', req.body);

        res.status(200).json(updatedTodo);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal server error !' });
        
    }

})

app.put('/api/completetodo/:id', async(req: Request, res: Response) => {

    console.log('Complete todo endpoint reached......');
    
    try {

        const updatedTodo = await ToDo.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    isComplete: req.body.isComplete
                },
            },
            { new: true }
        );
        
        if(!updatedTodo){
            return res.status(404).json({ error: 'Post not found!' });
        }

        io.emit('ToDo Complete', req.body);

        res.status(200).json(updatedTodo);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal server error !' });
        
    }

})

app.delete('/api/deletetodo/:id', async(req: Request, res: Response) => {

    try {

        console.log('This is _id: ', req.params.id)

        const deletedTodo = await ToDo.findByIdAndDelete(req.params.id)
        
        if(!deletedTodo){
            return res.status(404).json({ error: 'ToDo not found!' });
        }

        // Socket.IO emit
        io.emit('ToDo Deleted', deletedTodo);

        res.status(204).send();

    } catch (error) {
        
        console.error(error);

        res.status(500).json({ error: 'Internal server error!' });

    }
    
})

// http://localhost:3000/api/deletetodo/655e6c0503961e19d0dfadf8
// http://localhost:3000/api/updatetodo/655e6c0503961e19d0dfadf8


// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})