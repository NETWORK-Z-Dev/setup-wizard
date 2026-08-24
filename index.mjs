import Logger from "@hackthedev/terminal-logger";
import FrontendLibs from "@hackthedev/frontend-libs";
import crypto from "crypto"
import path from "path"

import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export default class SetupWizard {
    constructor({
        app = null,
        express = null,
        server = null,
        onCompleted = null,
    } = {}){
        if(!app) throw new Error("Express App instance needed!")
        if(!express) throw new Error("Express instance needed!")
        if(!server) throw new Error("Express server needed!")

        this.app = app;
        this.express = express;
        this.server = server;

        // current step
        this.index = 0;
        this.steps = new Map();
        this.values = {}

        // callbacks
        this.onCompleted = onCompleted

        this.webEndpointId = crypto.randomUUID();
        this.registerWebEndpoint();
        this.installLibs();
    }

    async installLibs(){
        try{
            let libDir = path.join(__dirname, "public", "js", "libs");
            console.log(libDir)
            const results = await FrontendLibs.installMultiple([
                { package: '@hackthedev/icons@latest', path: libDir },
                { package: '@hackthedev/element-loader@latest', path: libDir },
                { package: '@hackthedev/chat-tools@latest', path: libDir },
            ]);

            results.forEach((r) => {
                if(r?.success || r?.skipped){
                    Logger.debug(r?.message)
                }
                else{
                    Logger.error(r?.message)
                }
            });
        }
        catch(exc){
            Logger.error(exc);
        }
    }

    addStep(step = {}){
        if(!step?.id) throw new Error("Missing step identifier (id)");
        if(!step?.title) throw new Error("Missing Step title");
        if(!step?.description) Logger.warn(`Step ${step?.id} is missing a description. Its recommended!`)

        // avoid duplicates
        if(this.steps.has(step.id)){
            return Logger.warn(`Step ${step.id} already exists! Skipped...`)
        }

        this.steps.set(step.id, step)
    }

    registerWebEndpoint(){
        this.app.post(`/wizard/${this.webEndpointId}/step/:stepId/test`, this.express.json(), async(req, res, next) => {
            let stepId = req?.params?.stepId ?? null;
            let data = req.body ?? null;

            if(!stepId) return res.status(404).json({ error: "Step not found"})
            if(!this.steps.has(stepId)) return res.status(404).json({ error: "Step not found"})

            let step = this.steps.get(stepId);
            if(step?.test && typeof step?.test === "function"){
                let stepTestError = await step.test(data)

                if(stepTestError?.error) {
                    return res.status(200).json({ error: stepTestError.error });
                }
            }

            res.status(200).json({ error: null});
        })

        this.app.get(`/wizard/${this.webEndpointId}/steps`, this.express.json(), async(req, res, next) => {
            res.status(200).json({steps: Object.fromEntries(this.steps)})
        })
        
        this.app.use(
            `/wizard/${this.webEndpointId}`,
            this.express.static(
                path.join(__dirname, "public")
            )
        );

        Logger.success("Setup Page is available at:")
        Logger.success(`http://localhost:${this.server.address().port}/wizard/${this.webEndpointId}`)
        Logger.warn("Copy the url to continue the setup process.")
    }
}