import { UnavailabilityError } from 'expo-modules-core';
import { Platform } from 'react-native';

import { Album } from './Album';
import ExpoMediaLibraryNext from '../native';
import type { MediaSubtype } from '../types';

export class Asset extends ExpoMediaLibraryNext.Asset {
  async getAlbums(): Promise<Album[]> {
    const natives = await super.getAlbums();
    return natives.map((a) => new Album(a.id));
  }

  static async create(filePath: string, album?: Album): Promise<Asset> {
    const native = await super.create(filePath, album);
    return new Asset(native.id);
  }

  // @hidden
  getFavorite(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError('MediaLibrary', 'getFavorite is only available on iOS');
    }
    return super.getFavorite();
  }

  // @hidden
  setFavorite(isFavorite: boolean): Promise<void> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError('MediaLibrary', 'setFavorite is only available on iOS');
    }
    return super.setFavorite(isFavorite);
  }

  // @hidden
  getMediaSubtypes(): Promise<MediaSubtype[]> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError('MediaLibrary', 'getMediaSubtypes is only available on iOS');
    }
    return super.getMediaSubtypes();
  }

  // @hidden
  getLivePhotoVideoUri(): Promise<string | null> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError(
        'MediaLibrary',
        'getLivePhotoVideoUri is only available on iOS'
      );
    }
    return super.getLivePhotoVideoUri();
  }

  // @hidden
  getIsInCloud(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError('MediaLibrary', 'getIsInCloud is only available on iOS');
    }
    return super.getIsInCloud();
  }

  // @hidden
  getOrientation(): Promise<number | null> {
    if (Platform.OS !== 'ios') {
      throw new UnavailabilityError('MediaLibrary', 'getOrientation is only available on iOS');
    }
    return super.getOrientation();
  }
}
