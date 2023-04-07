import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import api from '../apis/api';

interface User {
  login: string;
  avatar_url: string;
}

interface Repository {
  name: string;
  html_url: string;
}

interface State {
  users: User[];
  repositories: Record<string, Repository[]>;
}

interface Action {
  type: string;
  payload: any;
}

const initialState: State = {
  users: [],
  repositories: {},
};

function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    case 'SET_REPOSITORIES':
      return {
        ...state,
        repositories: {
          ...state.repositories,
          [action.payload.userLogin]: action.payload.repositories,
        },
      };
    default:
      return state;
  }
}

export function fetchUsers(query: string) {
  return async (dispatch: any) => {
    const response = await api.get(`/search/users?q=${query}&per_page=5`);
    const users = response.data.items.map((item: any) => ({
      login: item.login,
      avatar_url: item.avatar_url,
    }));
    dispatch({ type: 'SET_USERS', payload: users });
  };
}

export function fetchRepositories(userLogin: string) {
  return async (dispatch: any) => {
    const response = await api.get(`/users/${userLogin}/repos`);
    const repositories = response.data.map((item: any) => ({
      name: item.name,
      html_url: item.html_url,
    }));
    dispatch({
      type: 'SET_REPOSITORIES',
      payload: { userLogin, repositories },
    });
  };
}

const store = createStore(reducer, applyMiddleware(thunk));

export default store;
