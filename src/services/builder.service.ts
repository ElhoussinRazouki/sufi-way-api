import { AppsBuild } from "../models/builder/apps.schema"
import { WallpaperApps } from "../models/builder/apps/wallpaper.schema";
import { Templates } from "../models/builder/templates.schema";
import { userBuildAnApp, userCanBuildApp } from "./user.service";

export const APP_TYPES = {
    wallpaper: "wallpaper",
    guide: "guide"
}


// builder
const initialApp = async (userId: string, data: { type?: string, theme?: string, name?: string, packageName?: string, icon?: string })=>{
    
    if(!userId){
        throw new Error("userId required for initializing a new app build.")
    }
    await userCanBuildApp(userId);

    switch(data?.type?.toLowerCase()){
        case APP_TYPES.wallpaper :
            const result = await WallpaperApps.create({userId, ...data});
            await userBuildAnApp(userId);
            return result;
        default:
            throw new Error("invalid application type!.");
    }
}

const deleteAppBuild = async (userId: string, appId: string)=>{
    if(!userId || !appId){
        throw new Error("both appId and userId are required!");
    }
    const result = await AppsBuild.updateOne({ _id: appId, userId: userId, removed_at: { $exists: false } }, { removed_at: new Date() });
    if(!result.acknowledged){
        throw new Error("failed on deleting the app!")
    }
    if(result.acknowledged && !result.modifiedCount){
        throw new Error("no app with the provided id is found!");
    }

    return await getBuiltApps(userId);
}

const getBuiltApps = async (userId: string)=>{
    if(!userId){
        throw new Error("missing field!, userId is required.")
    }

    const result = await AppsBuild.find({ userId, removed_at: { $exists: false } }).limit(50).lean();
    return result;
}

const updateAppBuild = async (userId: string, appId: string, update: { type?: string, theme?: string, name?: string, packageName?: string, icon?: string })=>{
    if(!userId || !appId){
        throw new Error("both userId and appId are required!");
    }

    const result = await AppsBuild.findOneAndUpdate({ _id: appId, userId, removed_at: { $exists: false } }, { $set: { ...update, updated_at: new Date() } }, { new: true }).lean();

    if(!result){
        throw new Error("the update failed! app not found");
    }

    return result;
}



// templates
const createNewTemplate = async (name: string, summary: string)=>{
    if(!name || !summary){
        throw new Error("missing field!, name, summary is required.")
    }

    try {
        const result = await Templates.create({
            name,
            summary
        });
        return result;
    
    } catch (error: any) {
        if(error.message?.includes("E11000")){
            throw new Error("this name is already been assigned to another template!");
        }
        throw error
    }

}

const getTemplates = async ()=>{

    const result = Templates.find().limit(25).lean();
    return result;

}

const deleteTemplate = async (templateId: string)=>{
    if(!templateId){
        throw new Error("missing field, template id is required!");
    }

    const result = await Templates.deleteOne({ _id: templateId });
    if(!result.acknowledged){
        throw new Error("failed to remove the template, try again!");
    }

    if(result.acknowledged && !result.deletedCount){
        throw new Error("no template with the provided id is found!");
    }
}

const updateTemplate = async (templateId: string, update: { name?: string, summary?: string })=>{
    if(!templateId){
        throw new Error("missing field, template id is required");
    }

    const result = await Templates.findOneAndUpdate({ _id: templateId }, { ...update, updated_at: new Date() }, { new: true }).lean();

    if(!result)throw new Error("the update failed! template not found"); 

    return result;
}

// app types
const updateWallpaperApp = async (userId: string, appId: string, update: { categories?: { category: string, icon: string, images: string[] }[], carousel?: string[], colorSchema?: { primary: string, secondary: string, neutral: string }, advertisements?: { appId: string, label: string, native: string }[] })=>{
    
    if(!userId || !appId)throw new Error("missing fields!, both appId and userId are required.");

    if(update?.advertisements?.length){
        update.advertisements.map((advertisement)=>{
            if(!advertisement.appId || !advertisement.label || !advertisement.native){
                throw new Error("missing fields!, label and native are required.");
            }
        })
    }

    if(update?.categories?.length){
        update.categories.map((category)=>{
            if(!category.category || !category.icon || !category.images?.length){
                throw new Error("missing fields!, each category should have a name, icon and a non empty array of images.");
            }
        })
    }

    if(update.colorSchema && (!update.colorSchema.primary || !update.colorSchema.secondary || !update.colorSchema?.neutral)){
        throw new Error("the colorSchema should be at least have primary, secondary, neutral colors !")
    }


    let result = await WallpaperApps.findOneAndUpdate({ userId, _id: appId, removed_at: { $exists: false } }, { ...update }, { new: true }).lean();

    if(!result) throw new Error("the update failed! app not found");

    return result;
}


export const appBuildService = {
    Builder: {
        create: initialApp,
        list: getBuiltApps,
        update: {
            appBuild: updateAppBuild,
            wallpaper: updateWallpaperApp,
        },
        delete: deleteAppBuild
    },
    Templates: {
        create: createNewTemplate,
        list: getTemplates,
        update: updateTemplate,
        delete: deleteTemplate
    }
}