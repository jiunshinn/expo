import { Asset } from './Asset';
import ExpoMediaLibraryNext from '../native';

export class Album extends ExpoMediaLibraryNext.Album {
  async getAssets(): Promise<Asset[]> {
    const natives = await super.getAssets();
    return natives.map((a) => new Asset(a.id));
  }

  static async create(
    name: string,
    assetsRefs: string[] | Asset[],
    moveAssets?: boolean
  ): Promise<Album> {
    const native = await super.create(name, assetsRefs, moveAssets);
    return new Album(native.id);
  }

  static async get(title: string): Promise<Album | null> {
    const native = await super.get(title);
    return native ? new Album(native.id) : null;
  }

  static async getAll(): Promise<Album[]> {
    const natives = await super.getAll();
    return natives.map((a) => new Album(a.id));
  }
}
