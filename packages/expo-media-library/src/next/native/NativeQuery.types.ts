import type { AssetField, AssetFieldValueMap, SortDescriptor } from '../types';
import type { NativeAlbum } from './NativeAlbum.types';
import type { NativeAsset } from './NativeAsset.types';

export declare class NativeQuery {
  constructor();
  eq<T extends AssetField>(field: T, value: AssetFieldValueMap[T]): NativeQuery;
  within<T extends AssetField>(field: T, value: AssetFieldValueMap[T][]): NativeQuery;
  gt(field: AssetField, value: number): NativeQuery;
  gte(field: AssetField, value: number): NativeQuery;
  lt(field: AssetField, value: number): NativeQuery;
  lte(field: AssetField, value: number): NativeQuery;
  limit(limit: number): NativeQuery;
  offset(offset: number): NativeQuery;
  orderBy(sortDescriptors: SortDescriptor | AssetField): NativeQuery;
  album(album: NativeAlbum): NativeQuery;
  exe(): Promise<NativeAsset[]>;
}
