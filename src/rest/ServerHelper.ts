import {Request, Response} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightDataset, InsightDatasetKind, NotFoundError} from "../controller/IInsightFacade";

class ServerHelper {
	public insightFacade: InsightFacade;

	constructor() {
		console.log("ServerHelper initialized");
		this.insightFacade = new InsightFacade();
	}

	public serverAddDataset = (req: Request, res: Response): void => {
		try {
			if(typeof req.params.id === undefined || req.params.id === null) {
				res.status(400).json({error: "Undefined ID"});
			}
			if(typeof req.params.kind === undefined || req.params.kind === null) {
				res.status(400).json({error: "Undefined kind"});
			}
			if(typeof req.body === undefined || req.body === null) {
				res.status(400).json({error: "Undefined body"});
			}

			let kind: InsightDatasetKind = InsightDatasetKind.Courses;
			if(req.params.kind === "courses") {
				kind = InsightDatasetKind.Courses;
			} else if (req.params.kind === "rooms") {
				kind = InsightDatasetKind.Rooms;
			} else {
				res.status(400).json("Invalid dataset kind");
			}

			let translatedZip: string = Buffer.from(req.body).toString("base64");
			this.insightFacade.addDataset(req.params.id, translatedZip, kind).then((result: string[]) => {
				res.status(200).json(result);
			}).catch((err: any) => {
				res.status(400).json({error: "Error Happened."});
			});
		} catch (err: any) {
			res.status(400).json({error: "error after"});
		}

	};

	public serverDelDataset = (req: Request, res: Response): void => {
		try{
			if(typeof req.params.id === undefined || req.params.id === null) {
				res.status(400).json({error: "Undefined id"});
			}
			this.insightFacade.removeDataset(req.params.id).then((result: string) => {
				res.status(200).json(result);
			}).catch((err: any) => {
				if(err instanceof NotFoundError) {
					res.status(404).json({error: "NotFoundError"});
				} else {
					res.status(400).json({error: "InsightError"});
				}
			});
		} catch (err: any) {
			res.status(400).json({error: "error after"});
		}
	};

	public serverQuery = (req: Request, res: Response): void => {
		console.log(`Server::serverQuery(..) - params: ${req.body}`);
		try{
			if(typeof req.params.id === undefined || req.params.id === null) {
				res.status(400).json({error: "Undefined id"});
			}
			this.insightFacade.performQuery(req.body).then((result) => {
				res.status(200).json(result);
			}).catch((err: any) => {
				res.status(400).json({error: "InsightError"});
			});
		} catch (err: any) {
			res.status(400).json({error: "error after"});
		}
	};

	public serverListDataset = (req: Request, res: Response): void => {
		try{
			this.insightFacade.listDatasets().then((result: InsightDataset[]) => {
				res.status(200).json(result);
			}).catch((err: any) => {
				res.status(400).json({error:  "InsightError"});
			});
		} catch (err: any) {
			res.status(400).json({error: "error after"});
		}
	};
}

export default ServerHelper;
