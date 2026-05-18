import { UnavailabilityError } from 'expo-modules-core';
import { Platform } from 'react-native';
import { Album } from './Album';
import ExpoMediaLibraryNext from '../native';
export class Asset extends ExpoMediaLibraryNext.Asset {
    async getAlbums() {
        const natives = await super.getAlbums();
        return natives.map((a) => new Album(a.id));
    }
    static async create(filePath, album) {
        const native = await super.create(filePath, album);
        return new Asset(native.id);
    }
    // @hidden
    getFavorite() {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'getFavorite is only available on iOS');
        }
        return super.getFavorite();
    }
    // @hidden
    setFavorite(isFavorite) {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'setFavorite is only available on iOS');
        }
        return super.setFavorite(isFavorite);
    }
    // @hidden
    getMediaSubtypes() {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'getMediaSubtypes is only available on iOS');
        }
        return super.getMediaSubtypes();
    }
    // @hidden
    getLivePhotoVideoUri() {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'getLivePhotoVideoUri is only available on iOS');
        }
        return super.getLivePhotoVideoUri();
    }
    // @hidden
    getIsInCloud() {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'getIsInCloud is only available on iOS');
        }
        return super.getIsInCloud();
    }
    // @hidden
    getOrientation() {
        if (Platform.OS !== 'ios') {
            throw new UnavailabilityError('MediaLibrary', 'getOrientation is only available on iOS');
        }
        return super.getOrientation();
    }
}
//# sourceMappingURL=Asset.js.map