import {configureStore} from '@reduxjs/toolkit';
import timerReducer from './slice';


const store =  configureStore({
  reducer: {
    timer: timerReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export default store;
