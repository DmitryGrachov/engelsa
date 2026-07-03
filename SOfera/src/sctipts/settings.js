/** Меняется на каждый `npm run build` — ломает кэш index-*.js */
const BUILD_ID = __BUILD_ID__;

const createImage = (url) => {
    const img = new Image();

    img.src = url;

    return img;
};

const url = new URL(location.href);

const posterUrl = url.searchParams.get('poster');

const skyboxUrl = url.searchParams.has('skybox')
    ? (url.searchParams.get('skybox') || undefined)
    : '../../models/pizzo_pernice_puresky_1k.hdr';
const voxelUrl = url.searchParams.get('voxel');
const DEFAULT_SKY_UV_REPEAT = 1;
const skyRepeatFromQuery = url.searchParams.has('skyrepeat')
    ? parseFloat(url.searchParams.get('skyrepeat'))
    : NaN;
const skyboxUvRepeat = Number.isFinite(skyRepeatFromQuery) && skyRepeatFromQuery > 0
    ? skyRepeatFromQuery
    : DEFAULT_SKY_UV_REPEAT;
const settingsUrl = url.searchParams.has('settings') ? url.searchParams.get('settings') : '../../lib/settings.json';
const contentUrl = url.searchParams.has('content') ? url.searchParams.get('content') : '../../models/SOfera2.sog';

const sseConfig = {
    poster: posterUrl && createImage(posterUrl),
    skyboxUrl,
    voxelUrl,
    contentUrl,
    contents: fetch(new URL(contentUrl, location.href).href),
    noui: url.searchParams.has('noui'),
    noanim: url.searchParams.has('noanim'),
    nofx: url.searchParams.has('nofx'),
    hpr: url.searchParams.has('hpr') ? ['', '1', 'true', 'enable'].includes(url.searchParams.get('hpr')) : undefined,
    ministats: url.searchParams.has('ministats'),
    colorize: url.searchParams.has('colorize'),
    unified: url.searchParams.has('unified'),
    webgpu: url.searchParams.has('webgpu'),
    gpusort: url.searchParams.has('gpusort'),
    /** MSAA на canvas — нужен для POI через alphaToCoverage (прозрачность без BLEND_NORMAL). Отключить: ?noaa */
    aa: !url.searchParams.has('noaa'),
    heatmap: url.searchParams.has('heatmap'),
    /** Лёгкий режим: ниже бюджет splats, короче принудительный рендер; при включённом MSAA — не больше 2× */
    lite: url.searchParams.has('lite'),
    skyboxUvRepeat,
};

window.sse = {
    buildId: BUILD_ID,
    config: sseConfig,
    settings: fetch(settingsUrl).then(response => response.json())
};