import express from 'express';
import cors from 'cors';
import { environment } from './utils/loadEnvironment';
import { authRouter } from './routes/auth.route';
import mongoose from 'mongoose';
import passport from 'passport';
import { userRouter } from './routes/user.route';
import { authMiddleWare, authMiddleWareAdmin } from './middlewares/auth.middleware';
import { attachmentRouter } from './routes/upload.route';
import { multimediaRouter } from './routes/multimedia.route';
import path from 'path';
import { notesRouter } from './routes/note.route';
import { authorsRouter } from './routes/authors.route';
import { todoRouter } from './routes/todo.route';
import { newsRouter } from './routes/news.route';
import { FQRouter } from './routes/fq.route';
import { GeneralSettingsRouter } from './routes/general.settings.route';
import { commonRouter } from './routes/common.route';
import { favoritesRouter } from './routes/favorites.route';
import { adkarAdiaRouter } from './routes/adkar-adia.route';
import { sheikhsRouter } from './routes/sheikhs.route';
import { zawyaRouter } from './routes/zawya.route';



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
app.use("/", commonRouter)
app.use("/user", userRouter);
app.use("/notes", notesRouter);
app.use("/favorites", favoritesRouter);
app.use("/frequent-questions", FQRouter);
app.use("/attachment", attachmentRouter);
app.use("/multimedia", multimediaRouter);
app.use("/authors", authMiddleWareAdmin, authorsRouter);
app.use("/sheikhs", sheikhsRouter);
app.use("/zawya", zawyaRouter);
app.use("/news", newsRouter);
app.use("/adkar-adia", adkarAdiaRouter);
app.use("/todo", todoRouter);
app.use("/general-settings", authMiddleWareAdmin, GeneralSettingsRouter);






mongoose.connect(environment.MONGODB_URI as string).then((value)=>{
    console.log('🎉 connection established successfully with mongo db');
    app.listen(environment.PORT, () => {
        console.log(`🚀 Server is running on port: ${environment.PORT}`);
    });
})