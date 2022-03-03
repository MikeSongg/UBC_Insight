import {InsightDatasetKind} from "../controller/IInsightFacade";


/**
 * Self-designed types
 * TODO: Consider rename. Consider Persistent this.
 */

export interface TestDataset {
	id: string;
	kind: InsightDatasetKind;
	numRows: number;
	content: string;
	// Map< ClassName, ClassObject >
	coursesObj: Map<string, string>;
}
