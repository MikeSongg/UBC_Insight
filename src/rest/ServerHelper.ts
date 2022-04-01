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
		console.log("Server:: AddDataset");
		console.log(req.params.id, req.params.kind, Buffer.from(req.body).toString("base64").length);

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
			res.status(400).json({error: err});
		});
	};

	public serverDelDataset = (req: Request, res: Response): void => {

		this.insightFacade.removeDataset(req.params.id).then((result: string) => {
			res.status(200).json(result);
		}).catch((err: any) => {
			if(err instanceof NotFoundError) {
				res.status(404).json({error: err});
			} else {
				res.status(400).json({error: err});
			}
		});
	};

	public serverQuery = (req: Request, res: Response): void => {
		console.log(`Server::serverQuery(..) - params: ${req.body}`);
		this.insightFacade.performQuery(req.body).then((result) => {
			res.status(200).json(result);
		}).catch((err: any) => {
			res.status(400).json({error: err});
		});
	};

	public serverListDataset = (req: Request, res: Response): void => {
		this.insightFacade.listDatasets().then((result: InsightDataset[]) => {
			res.status(200).json(result);
		}).catch((err: any) => {
			res.status(400).json({error: err});
		});
	};
}

export default ServerHelper;
