import { Asset } from './Asset';
import ExpoMediaLibraryNext from '../native';
export declare class Album extends ExpoMediaLibraryNext.Album {
    getAssets(): Promise<Asset[]>;
    static create(name: string, assetsRefs: string[] | Asset[], moveAssets?: boolean): Promise<Album>;
    static get(title: string): Promise<Album | null>;
    static getAll(): Promise<Album[]>;
}
//# sourceMappingURL=Album.d.ts.map