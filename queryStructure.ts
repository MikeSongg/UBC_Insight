// eslint-disable-next-line @typescript-eslint/naming-convention
export interface queryTwo {
    "WHERE": FILTER,
	"OPTIONS": COL& ORD

}
export type QueryType = queryTwo
export interface ORD {
	"ORDER": string
}
export interface COL{
	"COLUMNS": string
}

export interface FILTER {
	"AND": [FILTER,FILTER],
	"OR": [FILTER,FILTER],
	"IS": skey,
	"LT": mkey,
	"GE": mkey,
	"EQ": mkey
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface mkey {
	"courses_avg": number,
	"courses_pass": number,
	"courses_fail": number,
	"courses_audit": number,
	"courses_year": number
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export  interface skey {
	"courses_dept": string,
	"courses_id": string,
	"courses_instructor": string,
	"courses_title": string,
	"courses_uuid": string
}
export type MCOMPARATOR = "LT" | "GT" | "EQ"
export type LOGIC = "AND" | "OR"
