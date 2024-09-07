import express from 'express';
import cors from 'cors';
import { environment } from './utils/loadEnvironment';
import { authRouter } from './routes/auth.route';
import mongoose from 'mongoose';
import passport from 'passport';
import { userRouter } from './routes/user.route';
import { authMiddleWare } from './middlewares/auth.middleware';
import { attachmentRouter } from './routes/upload.route';
import { multimediaRouter } from './routes/multimedia.route';
import path from 'path';
import { notesRouter } from './routes/note.route';



// initial the express server
const app = express();
app.get('/', (req, res) => {
    res.send('welcome to the api');
});

// middlewares 
app.use(cors());

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", authRouter);
app.use('/attachments', express.static(path.join(__dirname, '../attachments')));
app.use(authMiddleWare);
app.use("/user", userRouter);
app.use("/notes", notesRouter);
app.use("/attachment", attachmentRouter);
app.use("/multimedia", multimediaRouter);





mongoose.connect(environment.MONGODB_URI as string).then((value)=>{
    console.log('🎉 connection established successfully with mongo db');
    app.listen(environment.PORT, () => {
        console.log(`🚀 Server is running on port: ${environment.PORT}`);
    });
})