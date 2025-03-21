import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { Holiday } from '../types';

const API_URL = 'http://localhost:5001/api';

interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface HolidayContextType {
  holidayState: HolidayState;
  getHolidays: () => Promise<void>;
  addHoliday: (holiday: Partial<Holiday>) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  isHoliday: (date: Date) => boolean;
  resetHolidayState: () => void;
}

// Initial state
const initialState: HolidayState = {
  holidays: [],
  loading: false,
  error: null,
  success: false
};

// Action types
type HolidayAction =
  | { type: 'HOLIDAY_REQUEST' }
  | { type: 'HOLIDAYS_SUCCESS'; payload: Holiday[] }
  | { type: 'HOLIDAY_SUCCESS'; payload: Holiday }
  | { type: 'HOLIDAY_FAIL'; payload: string }
  | { type: 'HOLIDAY_RESET' }
  | { type: 'HOLIDAY_STATE_RESET' };

// Reducer
const holidayReducer = (state: HolidayState, action: HolidayAction): HolidayState => {
  switch (action.type) {
    case 'HOLIDAY_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };
    case 'HOLIDAYS_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        holidays: action.payload,
        error: null
      };
    case 'HOLIDAY_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        holidays: [...state.holidays, action.payload],
        error: null
      };
    case 'HOLIDAY_FAIL':
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };
    case 'HOLIDAY_RESET':
      return {
        ...state,
        loading: false,
        success: false,
        error: null
      };
    case 'HOLIDAY_STATE_RESET':
      return initialState;
    default:
      return state;
  }
};

// Create context
const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

// Provider component
export const HolidayProvider = ({ children }: { children: ReactNode }) => {
  const [holidayState, dispatch] = useReducer(holidayReducer, initialState);
  
  // Configure axios with token from localStorage
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Get all holidays
  const getHolidays = async () => {
    try {
      dispatch({ type: 'HOLIDAY_REQUEST' });
      const res = await axios.get(`${API_URL}/holidays`);
      dispatch({ type: 'HOLIDAYS_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'HOLIDAY_FAIL',
        payload: err.response?.data?.message || 'Failed to get holidays'
      });
    }
  };

  // Add a new holiday (admin only)
  const addHoliday = async (holiday: Partial<Holiday>) => {
    try {
      dispatch({ type: 'HOLIDAY_REQUEST' });
      const res = await axios.post(`${API_URL}/holidays`, holiday, getConfig());
      dispatch({ type: 'HOLIDAY_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'HOLIDAY_FAIL',
        payload: err.response?.data?.message || 'Failed to add holiday'
      });
    }
  };

  // Delete a holiday (admin only)
  const deleteHoliday = async (id: string) => {
    try {
      dispatch({ type: 'HOLIDAY_REQUEST' });
      await axios.delete(`${API_URL}/holidays/${id}`, getConfig());
      // Refresh holidays after deletion
      await getHolidays();
    } catch (err: any) {
      dispatch({
        type: 'HOLIDAY_FAIL',
        payload: err.response?.data?.message || 'Failed to delete holiday'
      });
    }
  };

  // Check if a date is a holiday
  const isHoliday = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return holidayState.holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toISOString().split('T')[0] === dateString;
    });
  };

  // Reset holiday state
  const resetHolidayState = useCallback(() => {
    dispatch({ type: 'HOLIDAY_STATE_RESET' });
  }, []);

  return (
    <HolidayContext.Provider
      value={{
        holidayState,
        getHolidays,
        addHoliday,
        deleteHoliday,
        isHoliday,
        resetHolidayState
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
};

// Custom hook to use holiday context
export const useHoliday = () => {
  const context = useContext(HolidayContext);
  if (context === undefined) {
    throw new Error('useHoliday must be used within a HolidayProvider');
  }
  return context;
};