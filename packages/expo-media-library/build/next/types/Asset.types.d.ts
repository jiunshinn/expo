export declare enum MediaType {
    UNKNOWN = "unknown",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video"
}
/**
 * Describes specific variations of asset media. Maps to [`PHAssetMediaSubtype`](https://developer.apple.com/documentation/photokit/phassetmediasubtype).
 * @platform ios
 */
export declare enum MediaSubtype {
    DEPTH_EFFECT = "depthEffect",
    HDR = "hdr",
    HIGH_FRAME_RATE = "highFrameRate",
    LIVE_PHOTO = "livePhoto",
    PANORAMA = "panorama",
    SCREENSHOT = "screenshot",
    STREAM = "stream",
    TIME_LAPSE = "timelapse",
    SPATIAL_MEDIA = "spatialMedia",
    VIDEO_CINEMATIC = "videoCinematic"
}
export type Location = {
    latitude: number;
    longitude: number;
};
export type Shape = {
    width: number;
    height: number;
};
export type AssetInfo = {
    id: string;
    filename: string;
    uri: string;
    mediaType: MediaType;
    width: number;
    height: number;
    duration: number | null;
    creationTime: number | null;
    modificationTime: number | null;
    isFavorite?: boolean;
};
//# sourceMappingURL=Asset.types.d.ts.map