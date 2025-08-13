type VistarEntry = {
	name: string;
	img: string;
	refreshrate: number;
	ext_refreshrate: number;
	lgbk: number | "";
};

export type VistarData = Record<string, VistarEntry>;
