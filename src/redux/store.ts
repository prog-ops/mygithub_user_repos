import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import api from '../apis/api';
import { debounce } from 'lodash'; // lodash debounce function or another preferred debounce implementation

export interface User {
  login: string;
  avatar_url: string;
  id: number;
}

interface Repository {
  name: string;
  html_url: string;
}

export interface State {
  users: User[];
  repositories: Record<string, Repository[]>;
  loading: boolean;
  error: string | null;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  users: [],
  repositories: {},
  loading: false,
  error: null,
};

function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_REPOSITORIES':
      return {
        ...state,
        repositories: {
          ...state.repositories,
          [action.payload.userLogin]: action.payload.repositories,
        },
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_USERS': // Clear users and repositories
      return {
        ...state,
        users: [],
        repositories: {},
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function fetchUsers(query: string) {
  return async (dispatch: any) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const debouncedFetch = debounce(async () => {
        const response = await api.get(`/search/users?q=${query}&per_page=5`);
        const users = response.data.items.map((item: any) => ({
          login: item.login,
          avatar_url: item.avatar_url,
        }));
        dispatch({ type: 'SET_USERS', payload: users });
      }, 300);

      // Invoking the debounced function
      debouncedFetch();

    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.log(`${error.response?.status} : ${error.message}`)
        dispatch({ type: 'SET_ERROR', payload: 'Rate limit exceeded. Try again later.' });
      } else {
        console.log(error.message)
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };
}

export function fetchUsersNoDebounce(query: string) {
  return async (dispatch: any) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await api.get(`/search/users?q=${query}&per_page=5`);
      const users = response.data.items.map((item: any) => ({
        login: item.login,
        avatar_url: item.avatar_url,
      }));
      dispatch({ type: 'SET_USERS', payload: users });

    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        console.log(`${error.response?.status} : ${error.message}`)
        dispatch({ type: 'SET_ERROR', payload: 'Rate limit exceeded. Try again later.' });
      } else {
        console.log(error.message)
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };
}

export function fetchRepositories(userLogin: string) {
  return async (dispatch: any) => {
    try {

      dispatch({ type: 'SET_LOADING' });
      const response = await api.get(`/users/${userLogin}/repos`);
      const repositories = response.data.map((item: any) => ({
        name: item.name,
        html_url: item.html_url,
      }));
      dispatch({
        type: 'SET_REPOSITORIES',
        payload: { userLogin, repositories },
      });

    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        dispatch({ type: 'SET_ERROR', payload: 'Rate limit exceeded. Try again later.' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };
}

const store = createStore(reducer, applyMiddleware(thunk));

export default store;
