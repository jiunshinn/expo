import { Album } from './Album';
import ExpoMediaLibraryNext from '../native';
import type { MediaSubtype } from '../types';
export declare class Asset extends ExpoMediaLibraryNext.Asset {
    getAlbums(): Promise<Album[]>;
    static create(filePath: string, album?: Album): Promise<Asset>;
    getFavorite(): Promise<boolean>;
    setFavorite(isFavorite: boolean): Promise<void>;
    getMediaSubtypes(): Promise<MediaSubtype[]>;
    getLivePhotoVideoUri(): Promise<string | null>;
    getIsInCloud(): Promise<boolean>;
    getOrientation(): Promise<number | null>;
}
//# sourceMappingURL=Asset.d.ts.map