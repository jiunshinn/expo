import { type PermissionResponse, NativeModule } from 'expo';
import type { NativeAlbum } from './NativeAlbum.types';
import type { NativeAsset } from './NativeAsset.types';
import type { NativeQuery } from './NativeQuery.types';
import type { GranularPermission, MediaTypeFilter, MediaLibraryAssetsChangeEvent } from '../types';
declare class ExpoMediaLibraryNextModule extends NativeModule<{
    mediaLibraryDidChange: (event: MediaLibraryAssetsChangeEvent) => void;
}> {
    Asset: typeof NativeAsset;
    Album: typeof NativeAlbum;
    Query: typeof NativeQuery;
    getPermissionsAsync(writeOnly?: boolean, granularPermissions?: GranularPermission[]): Promise<PermissionResponse>;
    requestPermissionsAsync(writeOnly?: boolean, granularPermissions?: GranularPermission[]): Promise<PermissionResponse>;
    presentPermissionsPicker(mediaTypes?: MediaTypeFilter[]): Promise<void>;
}
declare const _default: ExpoMediaLibraryNextModule;
export default _default;
//# sourceMappingURL=index.d.ts.map