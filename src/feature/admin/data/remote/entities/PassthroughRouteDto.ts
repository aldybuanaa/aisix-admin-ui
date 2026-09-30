export interface PassthroughRouteDto {
  readonly name: string;
  readonly target_url?: string | null;
  readonly path_prefix?: string | null;
  readonly [key: string]: unknown;
}
