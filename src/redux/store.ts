import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import api from '../apis/api';

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

// Strip hyphens, underscores, dots for fuzzy comparison
function normalize(str: string): string {
  return str.toLowerCase().replace(/[-_.]/g, '');
}

// Score how well a login matches the query (higher = better match)
function fuzzyScore(login: string, query: string): number {
  const loginLower = login.toLowerCase();
  const queryLower = query.toLowerCase();
  const normLogin = normalize(login);
  const normQuery = normalize(query);

  if (loginLower === queryLower) return 100;       // exact match
  if (normLogin === normQuery) return 90;           // exact after stripping special chars
  if (loginLower.startsWith(queryLower)) return 80; // starts with exact query
  if (normLogin.startsWith(normQuery)) return 70;   // starts with normalized query
  if (loginLower.includes(queryLower)) return 60;   // contains exact query
  if (normLogin.includes(normQuery)) return 50;     // contains normalized query
  return 0;
}

// Generate search query variants to catch hyphenated usernames.
// For "progops" → ["progops", "pr ogops", "pro gops", "prog ops", "progo ps"]
// GitHub treats space as AND, so "prog ops" finds users matching both "prog" AND "ops" → catches "prog-ops"
function buildSearchQueries(query: string): string[] {
  const normalized = normalize(query);
  const queries = [query];

  if (normalized !== query.toLowerCase()) {
    queries.push(normalized); // also search stripped version
  }

  // Split at every position where both halves are >= 2 chars (max 3 splits to limit API calls)
  if (normalized.length >= 4) {
    const positions: number[] = [];
    for (let i = 2; i <= normalized.length - 2; i++) {
      positions.push(i);
    }
    // Pick up to 3 evenly spaced split positions
    const maxSplits = 3;
    const step = Math.max(1, Math.floor(positions.length / maxSplits));
    for (let j = 0; j < positions.length && queries.length <= maxSplits + 1; j += step) {
      queries.push(normalized.slice(0, positions[j]) + ' ' + normalized.slice(positions[j]));
    }
  }

  return queries.filter((q, i) => queries.indexOf(q) === i); // deduplicate
}

export function fetchUsers(query: string) {
  return async (dispatch: any) => {
    try {
      dispatch({ type: 'SET_LOADING' });

      const searchQueries = buildSearchQueries(query);

      // Primary query (full per_page), secondary splits (smaller per_page to save rate limit)
      const responses = await Promise.all(
          searchQueries.map((q, idx) =>
              api.get(`/search/users?q=${encodeURIComponent(q)}&per_page=${idx === 0 ? 10 : 5}`)
                  .catch(() => ({ data: { items: [] } })) // graceful fallback per query
          )
      );

      // Merge and deduplicate by user id
      const seen = new Set<number>();
      const allUsers: User[] = [];
      for (const res of responses) {
        for (const item of (res as any).data.items) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            allUsers.push({ id: item.id, login: item.login, avatar_url: item.avatar_url });
          }
        }
      }

      // Score, sort by relevance, take top 5
      const ranked = allUsers
          .map(user => ({ user, score: fuzzyScore(user.login, query) }))
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.user.login.length - b.user.login.length; // shorter logins first as tiebreaker
          })
          .slice(0, 5)
          .map(({ user }) => user);

      dispatch({ type: 'SET_USERS', payload: ranked });
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        dispatch({ type: 'SET_ERROR', payload: 'Rate limit exceeded. Try again later.' });
      } else {
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
