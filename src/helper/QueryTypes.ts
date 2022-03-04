export interface IntendedQueryRequest {
	WHERE: IntendedWHERE;
	OPTIONS: IntendedOPTIONS;
}

export interface IntendedWHERE{
	IS: object;
}

export interface IntendedOPTIONS{
	COLUMNS: string[];
	ORDER: string;
}
