export interface RootState {
    timer: {
      elapsedTime: number;
      status: string;
      lastPause: string | Date;
      lastUpdate: string | Date;
      syncStatus: string,
      lastSynced: string
    };
}

