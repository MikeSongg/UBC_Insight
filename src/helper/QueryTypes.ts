export interface IntendedQuery {
	WHERE: IntendedBody;
	OPTIONS: IntendedOptions;
}

export interface IntendedBody {
	AND?: IntendedLogicComparison; // | IntendedMCOMPARISON | IntendedSCOMPARISON | IntendedNEGATION;
	OR?: IntendedLogicComparison;
	LT?: object; // IntendedMComparison;
	GT?: object; // IntendedMComparison;;
	EQ?: object; // IntendedMComparison;;
	IS?: {[key: string]: number}; // IntendedSComparison;;
	// IS?: {[sKey: string]: number};
	NOT?: IntendedNegation;
}

export interface IntendedLogicComparison{
	FILTER: IntendedBody[];
}
/*
export interface IntendedMComparison{
	object;
}
*/
export interface IntendedSComparison{
	[sKey: string]: number;
}

export interface IntendedNegation{
	NOT: IntendedBody;
}

export interface IntendedOptions{
	COLUMNS: string[];
	ORDER?: string;
}
