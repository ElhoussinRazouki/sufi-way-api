import { Request, Response } from "express";
import { APP_TYPES, appBuildService } from "../services/builder.service";






export const buildAppController = async (req: Request, res: Response)=>{
    const user: any = req.user;
    const action = req.query.action;
    const { id, type, theme, name, package_name } = req.body;
    const icon = "https://play-lh.googleusercontent.com/hxgkSVS4p4MdvLmZudElO6ab2C-A87C51qWLe9z2dOmypRXgbZyX_3sgoeUeqiQusQ=w100-h100-rw";


    if(!action){
        return res.status(400).json({
            message: "action required!"
        })
    }

    switch(action){
        case "initial-app":
            if(!type || !theme || !name || !package_name)return res.status(400).json({ message: "missing fields!, type, theme, name, package_name are required." });
            return appBuildService.Builder.create(user.id, { type, theme, name, packageName: package_name, icon }).then((appBuild)=>{
                res.json({ message: "the app initialized successfully !" , data: { app: appBuild }});
            }).catch((err)=>{
                console.error(err);
                res.status(400).json({ message: "error : "+err.message })
            });
        case "set-theme":
            if(!id || !theme) return res.status(400).json({
                message: "both id and theme are required !"
            })
            return appBuildService.Builder.update.appBuild(user.id, id, { theme }).then((updatedBuildApp)=>{
                res.json({
                    message: "the app build theme updated successfully.",
                    data: {
                        app: updatedBuildApp
                    }
                })
            }).catch((error)=>{
                res.status(400).json({
                    message: "Error: "+error.message
                });
            });
        case "set-metadata":
            if(!id || !name || !package_name)return res.status(400).json({ 
                message: "missing fields id, name, package_name are required!"
            })
            if(!icon)return res.status(400).json({ 
                message: "the icon is required!"
            })
            return appBuildService.Builder.update.appBuild(user.id, id, { name, packageName: package_name, icon }).then((updatedBuildApp)=>{
                res.json({
                    message: "the app build name updated successfully.",
                    data: {
                        app: updatedBuildApp
                    }
                })
            }).catch((error)=>{
                res.status(400).json({
                    message: "Error: "+error.message
                })
            });
        case "set-content":
            if(!type)return res.status(400).json({ message: "missing field!, the type is required." });
            if(type.toLowerCase() === APP_TYPES.wallpaper){
                if(!id)return res.status(400).json({ message: "missing field!. the app id is required." })
                const { categories, carousel, colorSchema } = req.body;
                if(!categories && !carousel && !colorSchema)return res.status(400).json({ message: "missing fields!. categories, carousel, colorSchema at least one of them need to be provided." });

                return appBuildService.Builder.update.wallpaper(user.id, id, { categories, carousel, colorSchema } ).then((updatedApp)=>{
                    res.json({ message: 'app updated successfully.', data: { app: updatedApp } });
                }).catch((err)=>{
                    res.status(400).json({ message: "Error: "+err.message });
                })
            }
            break;
        case "set-advertisements":
            if(!type)return res.status(400).json({ message: "missing field!, the type is required." });
            if(type.toLowerCase() == APP_TYPES.wallpaper){
                if(!id)return res.status(400).json({ message: "missing field!. the app id is required." });
                const { advertisements } = req.body;
                if(!advertisements || !advertisements?.length)return res.status(400).json({ message: "missing field!. advertisements is required and should be non empty array." });

                return appBuildService.Builder.update.wallpaper(user.id, id, { advertisements }).then((updatedApp)=>{
                    res.json({ message: 'app updated successfully.', data: { app: updatedApp } });
                }).catch((err)=>{
                    res.status(400).json({ message: "Error: "+err.message });
                });
            }
        default:
            console.log("unhandled action : "+ action);
            return res.status(400).json({ message: "unhandled action" });

    }
}

export const deleteAppController = async (req: Request, res: Response)=>{
    const user: any = req.user;
    const appId = req.params?.id;

    if(!appId){
        res.status(400).json({
            message: "missing field!, app id is required."
        })
    }
    
    return appBuildService.Builder.delete(user.id, appId).then((newList)=>{
        res.json({
            message: "app removed successfully.",
            data: {
                apps: newList
            }
        })
    }).catch((err)=>{
        console.error(err)
        res.status(400).json({
            message: "Error : "+err.message
        })
    })
}

export const getBuiltAppsController = async (req: Request, res: Response)=>{
    const user: any = req.user;
    appBuildService.Builder.list(user.id).then((appsList)=>{
        res.json({
            data: {
                apps: appsList
            }
        })
    }).catch((err)=>{
        console.log(err)
        res.status(400).json({
            message: "Error: "+err.message 
        })
    })
}   


// templates 
export const createTemplateController = async (req: Request, res: Response)=>{
    const user: any = req.user;
    const { name, summary } = req.body;

    if(!name || !summary){
        return res.json({
            message: "missing fields! name, summary are required."
        })
    }

    appBuildService.Templates.create(name, summary).then((createdTemplate)=>{
        res.json({
            message: "template created successfully.",
            data: {
                template: createdTemplate,
            }
        })
    }).catch((err)=>{
        console.error(err);
        res.status(400).json({
            message: "Error: "+err.message
        })
    });
}

export const getTemplatesController = async (req: Request, res: Response)=>{
    const user: any = req.user;

    appBuildService.Templates.list().then((list)=>{
        res.json({
            data: {
                templates: list
            }
        })
    }).catch((err)=>{
        res.status(400).json({
            message: "Error: "+err.message
        })
    })
}

export const deleteTemplateController = async (req: Request, res: Response)=>{
    const user: any = req.user;
    const templateId = req.params?.id;

    if(!templateId){
        throw new Error("the id of the template is required!");
    }

    appBuildService.Templates.delete(templateId).then(()=>{
        res.json({
            message: "the template removed successfully!"
        })
    }).catch((err)=>{
        res.status(400).json({
                message: "Error: "+err.message
        })
    })
    
}

export const updateTemplateController = async (req: Request, res: Response)=>{
    const user: any = req.user;

    const { templateId, name, summary } = req.body;
    if(!templateId){
        return res.status(400).json({
            message: "missing field!, templateId is required"
        })
    }
    if(!name && !summary){
        return res.status(400).json({
            message: "at least one of the attribute should be provided!"
        })
    }

    appBuildService.Templates.update(templateId, { name, summary }).then((updatedTemplate)=>{
        res.json({
            message: "template updated successfully.",
            data: {
                template: updatedTemplate
            }
        })
    }).catch((err)=>{
        res.status(400).json({
            message: "Error : "+err.message
        })
    })
}
