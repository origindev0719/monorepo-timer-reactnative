import { useEffect, useState } from 'react'
import { P } from 'app/design/typography'
import { View } from 'app/design/view'
import Ionicons from '@expo/vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {fetchElapsedTime, pauseTimer, controlTimer, resetTimer, restartTimer, setSyncStatus} from '../../../../apps/shared/redux/slice';
import {AppDispatch} from '../../../../apps/shared/redux/store';
import { Platform, StyleSheet } from 'react-native';
import EventSource from 'react-native-event-source';
import {RootState} from '../../design/type'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 36,
    backgroundColor: 'white',
    width: Platform.OS === 'web' ? '30%' : '100%',
    alignSelf: 'center',
  },
  timeControls: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  syncIconContainer: {
    position: 'absolute',
    right: Platform.OS === 'web' ? 12 : 24,
    top: Platform.OS === 'web' ? 12 : 48,
  },
});

export function HomeScreen() {
  const [time, setTime] = useState({ hour: 0, minute: 0, second: 0 });
  const [isRunning, setIsRunning] = useState(false)
  const [sync, setSync] = useState({isSync: '', isLastSync: ''})
  
  const { hour, minute, second } = time;

  if(Platform.OS === 'ios') {
    console.log(useSelector((state: RootState) => state.timer))
  } else if(Platform.OS === 'web') {
    console.log(useSelector((state: RootState) => state.timer))
  }
  
  const dispatch = useDispatch<AppDispatch>();
  
  const {elapsedTime, syncStatus, lastSynced} = useSelector((state: RootState) => state.timer);

  const paddedTime = {
    hour: String(hour).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    second: String(second).padStart(2, '0'),
  };
  const totalSeconds = hour * 3600 + minute * 60 + second;

  const handleTimerControl = (direction: string) => {
    dispatch(controlTimer({seconds: 30, totalSeconds, direction}));
  }

  const handlePauseClick = async () => {
    dispatch(pauseTimer(totalSeconds))
    setIsRunning(false);
  }

  const handleRestart = () => {
    dispatch(restartTimer())
    setTime({ hour: 0, minute: 0, second: 0 });
  };

  const handleReset = () => {
    dispatch(resetTimer())
    setTime({ hour: 0, minute: 0, second: 0 });
    setIsRunning(false);
  };

  const handleSetSyncStatus = () => {
    dispatch(setSyncStatus());
  }

  useEffect(() => {
    dispatch(fetchElapsedTime());
  }, [dispatch]);

  useEffect(() => {
    const hour = Math.floor(elapsedTime / 3600);
    const minute = Math.floor((elapsedTime % 3600) / 60);
    const second = elapsedTime % 60;
    console.log(elapsedTime, 'elapsedtime')
    setTime({ hour, minute, second });
  }, [elapsedTime]);

  useEffect(() => {
    setSync({...sync, isSync: syncStatus, isLastSync: lastSynced})
    console.log(lastSynced)
  }, [lastSynced])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newSecond = prevTime.second + 1;
          const newMinute = prevTime.minute + (newSecond === 60 ? 1 : 0);
          const newHour = prevTime.hour + (newMinute === 60 ? 1 : 0);
          return {
            second: newSecond % 60,
            minute: newMinute % 60,
            hour: newHour % 24,
          };
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if(interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4000/events');
  
    eventSource.onmessage = function(event) {
      const newElapsedTime = JSON.parse(event.data);
      setTime({ hour: newElapsedTime.hour, minute: newElapsedTime.minute, second: newElapsedTime.second });
    };
  
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('newelapsedtime');
      }
    };
  }, []);

  const IconWrapper = ({ children }) => (
    <View className="bg-white z-10 border-2 rounded-full -mx-2">
      {children}
    </View>
  );

  const IconButton = ({ iconName, onPress, style={} }) => (
    <Ionicons name={iconName} size={28} style={{ borderWidth: 2, borderRadius: 4, borderColor: 'black', ...style }} onPress={onPress} />
  );

  return (
    <>
    <View style={styles.container}>
      <View></View>
      <View>
        <P className={`text-center font-semibold ${Platform.OS === 'web' ? 'text-[64px]' : 'text-6xl'}`}>{`${paddedTime.hour}:${paddedTime.minute}:${paddedTime.second}`}</P>
      </View>
      <View className="flex-row items-center justify-between w-full">
        <IconButton iconName="md-refresh-outline" onPress={handleRestart} />
        <View className="flex-row items-center">
          <IconButton iconName="md-play-back-outline" onPress={() => handleTimerControl('back')} style={{paddingHorizontal: 8}} />
          <IconWrapper>
            {
              isRunning ? (
                <Ionicons name="md-pause" size={40} style={{ padding: 10 }} onPress={handlePauseClick} />
              ) : (
                <Ionicons name="md-play" size={40} style={{ padding: 10 }} onPress={() => setIsRunning(true)} />
              )
            }
          </IconWrapper>
          <IconButton iconName="md-play-forward-outline" onPress={() => handleTimerControl('forward')} style={{paddingHorizontal: 8}} />
        </View>
        <IconButton iconName="md-stop-outline" onPress={handleReset} />
      </View>
    </View>
    <View style={styles.syncIconContainer}>
      {lastSynced === 'hasDataSend' && Platform.OS === 'web' && <Ionicons name="md-cloud-upload-outline" size={48} onPress={handleSetSyncStatus} />}

      {lastSynced === 'hasDataSync' && Platform.OS === 'web' && <Ionicons name="md-cloud-download-outline" size={48} onPress={handleSetSyncStatus} />}

      {lastSynced === 'sync' && Platform.OS === 'web' && <Ionicons name="md-cloud-done-outline" size={48} onPress={handleSetSyncStatus} />}

      {syncStatus === 'idle' && (Platform.OS === 'android' || Platform.OS === 'ios') && <Ionicons name="md-cloud-done-outline" size={48} onPress={handleSetSyncStatus} />}

      {syncStatus === 'send' && (Platform.OS === 'android' || Platform.OS === 'ios') && <Ionicons name="md-cloud-upload-outline" size={48} onPress={handleSetSyncStatus} />}

      {syncStatus === 'download' && (Platform.OS === 'android' || Platform.OS === 'ios') && <Ionicons name="md-cloud-download-outline" size={48} onPress={handleSetSyncStatus} />}
    </View>
    </>
  )
}