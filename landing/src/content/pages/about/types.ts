export interface AboutMeta {
  title: string;
  description: string;
}

export interface AboutContent {
  meta: AboutMeta;
  load: () => Promise<{ default: React.ComponentType }>;
}

