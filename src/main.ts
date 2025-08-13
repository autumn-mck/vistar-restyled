import vistarData from "./vistar.json";
import type { VistarData } from "./types.ts";

const data = vistarData as VistarData;

enum ScaleMode {
	fit = "fit",
	cover = "cover",
}

const CONTROLS_VISIBLE_MS = 3000;
const DEFAULT_KEY = "LHC1";
const DEFAULT_MODE = ScaleMode.fit;
const MODE_PARAM = "mode";
const KEY_PARAM = "usr";

function getElement<T extends HTMLElement>(id: string): T {
	return document.getElementById(id) as T;
}

const urlParams = {
	get: (name: string) => new URLSearchParams(location.search).get(name),
	set: (name: string, value: string) => {
		const url = new URL(location.href);
		url.searchParams.set(name, value);
		history.replaceState(null, "", url.toString());
	},
};

function getInitialKey() {
	const key = urlParams.get(KEY_PARAM);
	if (key && data[key]) return key;
	else return DEFAULT_KEY;
}

function getInitialMode() {
	const mode = urlParams.get(MODE_PARAM);
	if (!mode) return DEFAULT_MODE;
	else if (mode in ScaleMode) return mode as ScaleMode;
	else return DEFAULT_MODE;
}

let currentKey = getInitialKey();
let currentMode = getInitialMode();
let refreshTimer: number | null = null;
let hideUiTimer: number | null = null;

const controls = getElement<HTMLDivElement>("bar");
const select = getElement<HTMLSelectElement>("source");
const scaleBtn = getElement<HTMLButtonElement>("scale");
const infoLink = getElement<HTMLAnchorElement>("infoLink");
const img = getElement<HTMLImageElement>("img");
const details = getElement<HTMLDivElement>("details");

function showUi(visible = true) {
	controls.classList.toggle("visible", visible);
	clearTimeout(hideUiTimer!);
	if (visible) {
		hideUiTimer = window.setTimeout(() => showUi(false), CONTROLS_VISIBLE_MS);
	}
}

function updateUi() {
	const entry = data[currentKey];
	infoLink.href = `https://op-webtools.web.cern.ch/vistar/Doc/${currentKey}.pdf`;
	details.textContent = `Refresh: ${entry.refreshrate} ms • Mode: ${currentMode}`;
	scaleBtn.textContent = `Scale: ${currentMode === "fit" ? "Fit" : "Cover"}`;
	img.className = currentMode;
}

function refreshLoop() {
	clearTimeout(refreshTimer!);
	const entry = data[currentKey];
	img.src = `${entry.img}?t=${Date.now()}`;
	updateUi();
	refreshTimer = window.setTimeout(refreshLoop, entry.refreshrate);
}

function bindEvents() {
	select.addEventListener("change", () => {
		if (!data[select.value]) return;
		currentKey = select.value;
		urlParams.set(KEY_PARAM, currentKey);
		refreshLoop();
		updateUi();
		showUi();
	});

	scaleBtn.addEventListener("click", () => {
		currentMode = currentMode === ScaleMode.fit ? ScaleMode.cover : ScaleMode.fit;
		urlParams.set(MODE_PARAM, currentMode);
		updateUi();
		showUi();
	});

	["mousemove", "mousedown", "keydown", "touchstart"].forEach((event) =>
		window.addEventListener(event, () => showUi(), { passive: true })
	);
}

function init() {
	Object.keys(data).forEach((key) => {
		const opt = document.createElement("option");
		opt.value = key;
		opt.textContent = data[key].name;
		select.appendChild(opt);
	});
	select.value = currentKey;

	bindEvents();
	updateUi();
	refreshLoop();
	showUi();
}

init();
