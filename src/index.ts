import express, { application } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const app = express();
const port = 5000;

// Connect to mongodb

mongoose.connect(`mongodb://mongotodo:27017/ToDoDB`, {}).then(() => {console.log('Connected To MongoDB');})

//

// Define schemas and models

const todoSchema = new mongoose.Schema({
    title: String,
    content: String
})

const ToDo = mongoose.model('ToDo', todoSchema);

//

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
            content: req.body.content
        })

        const savedToDo = await newToDo.save();

        res.status(201).json(savedToDo);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

app.put('/api/updatetodo/:id', async(req: Request, res: Response) => {
    
    try {

        const updatedTodo = await ToDo.findByIdAndUpdate(
            req.params._id,
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

        res.status(204).send();

    } catch (error) {
        
        console.error(error);

        res.status(500).json({ error: 'Internal server error!' });

    }
    
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})