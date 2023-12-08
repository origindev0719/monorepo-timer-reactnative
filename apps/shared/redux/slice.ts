import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios'
// syncStatus idle, send, download
// lastSynced sync, hasDataSend, hasDataSync
type TimerState = {
  elapsedTime: number;
  status: string;
  lastPause: Date | null;
  lastUpdate: Date | null;
  lastSynced: string;
  syncStatus: string;
};

const initialState: TimerState = {
  elapsedTime: 0,
  status: 'paused',
  lastPause: null, 
  lastUpdate: null,
  lastSynced: 'sync', 
  syncStatus: 'idle',
};

const updateTimer = async (data: any) => {
  const response = await axios.put('http://localhost:4000/timer/', data);
  if (response.data) {
    return response.data;
  } else {
    throw new Error('Unexpected server response');
  }
}

export const fetchElapsedTime = createAsyncThunk(
  'fetchElapsedTime',
  async () => {
    const response = await axios.get('http://localhost:4000/timer/');
    if (response.data) {
        return response.data;
    } else {
        throw new Error('Unexpected server response');
    }
  }
)

export const pauseTimer = createAsyncThunk(
  'pauseTimer',
  async (elapsedTime:number, { getState }) => {
      const now = new Date().toISOString();
      const state = getState() as RootState
      const data = {
          elapsedTime: elapsedTime,
          status: "paused",
          lastPause: now,
          lastUpdate: state.timer.lastUpdate,
          syncStatus: "send",
          lastSynced: state.timer.lastSynced
      }; 
      return updateTimer(data);
  }
)

export const controlTimer = createAsyncThunk(
  'controlTimer',
  async ({seconds, totalSeconds, direction}: {seconds: number, totalSeconds: number, direction: string}, {getState}) => {
    const state = getState() as RootState
    let newElapsedTime;

    if (direction === 'forward') {
      newElapsedTime = Math.max(totalSeconds + seconds, 0);
    } else if (direction === 'back') {
      newElapsedTime = Math.max(totalSeconds - seconds, 0);
    } else {
      throw new Error('Invalid direction');
    }
    const data = {
        elapsedTime: newElapsedTime,
        status: state.timer.status,
        lastPause: state.timer.lastPause,
        lastUpdate: state.timer.lastUpdate,
    };
    return updateTimer(data);
  }
)

export const resetTimer = createAsyncThunk(
  'resetTimer',
  async () => {
    const data = {
        elapsedTime: 0,
        status: "idle",
        lastPause: null,
        lastUpdate: null,
        lastSynced: 'sync',
        syncStatus: 'idle',
    };
    const response = await axios.put('http://localhost:4000/timer/', data);
    return response.data.elapsedTime;
  }
);

export const restartTimer = createAsyncThunk(
  'restartTimer',
  async (_, {getState}) => {
    const state = getState() as RootState
    const data = {
        elapsedTime: 0,
        status: state.timer.status,
        lastPause: state.timer.lastPause,
        lastUpdate: 'hasDataSync',
        syncStatus: 'idle',
    };
    const response = await axios.put('http://localhost:4000/timer/', data);
    return response.data.lastSynced;
  }
);

export const setSyncStatus = createAsyncThunk(
  'setSyncStatus',
  async (_, {getState}) => {
    const state = getState() as RootState;
    const data = {
      elapsedTime: 0,
      status: state.timer.status,
      lastPause: state.timer.lastPause,
      lastUpdate: state.timer.lastUpdate,
      lastSynced: 'hasDataSync',
      syncStatus: 'idle',
  };
    const response = await axios.put('http://localhost:4000/timer/', data);
    return response.data.lastSynced;
  }
)

type RootState = {
  timer: TimerState;
};

const rootState: RootState = {
  timer: initialState,
};


export const timerSlice = createSlice({
    name: 'timerSlice',
    initialState: rootState.timer,
    reducers: {},
    extraReducers: builder => {
      builder
        .addCase(fetchElapsedTime.pending, state => {
          state.status = 'loading'
        })

        .addCase(fetchElapsedTime.fulfilled, (state, action) => {
          state.elapsedTime = action.payload.elapsedTime;
          state.status = 'idle';
          state.lastUpdate = action.payload.lastUpdate;
          state.lastPause = action.payload.lastPause;
          state.syncStatus = action.payload.syncStatus;
          state.lastSynced = action.payload.lastSynced;

          if (state.lastPause && state.lastUpdate) {
            if (new Date(state.lastPause) > new Date(state.lastUpdate)) {
                state.syncStatus = 'send';
            } else {
                state.syncStatus = "download";
            }
          } else if (state.lastPause || state.lastUpdate) {
              state.syncStatus = 'send';
          } else {
              state.syncStatus = "idle";
          }
        })

        .addCase(fetchElapsedTime.rejected, (state, action) => {
          state.status = 'idle';
        })

        .addCase(pauseTimer.pending, state => {
            state.status = 'loading'
        })

        .addCase(pauseTimer.fulfilled, (state, action) => {
            state.elapsedTime = action.payload.elapsedTime;
            state.status = 'paused';
            state.lastPause = action.payload.lastPause;
            state.lastUpdate = action.payload.lastUpdate;
            state.syncStatus = action.payload.syncStatus
        })

        .addCase(pauseTimer.rejected, (state, action) => {
        state.status = 'idle';
        })

        .addCase(controlTimer.fulfilled, (state, action) => {
          state.elapsedTime = action.payload.elapsedTime;
        })

        .addCase(resetTimer.fulfilled, (state, action) => {
          state.elapsedTime = action.payload;
          state.status = 'uninitialized';
          state.lastPause = null;
          state.lastUpdate = null;
          state.syncStatus = 'idle';
          state.lastSynced = 'sync';
        })

        .addCase(restartTimer.fulfilled, (state, action) => {
          state.elapsedTime = action.payload;
        })

        .addCase(setSyncStatus.fulfilled, (state, action) => {
          state.syncStatus = 'idle';
          state.lastSynced = 'hasDataSync'
        })
    }
})

export default timerSlice.reducer;