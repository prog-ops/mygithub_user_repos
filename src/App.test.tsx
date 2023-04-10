import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import SearchComponent from './screens/SearchComponent';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('SearchComponent', () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      users: [
        { login: 'user1', id: 1, avatar_url: 'https://example.com/user1.jpg' },
        { login: 'user2', id: 2, avatar_url: 'https://example.com/user2.jpg' },
      ],
      repositories: {
        user1: [{ name: 'repo1', html_url: 'https://example.com/user1/repo1' }],
        user2: [{ name: 'repo2', html_url: 'https://example.com/user2/repo2' }],
      },
    });
  });

  it('renders a search input and a search button', () => {
    render(
        <Provider store={store}>
          <SearchComponent />
        </Provider>
    );

    expect(screen.getByPlaceholderText('Search users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders a list of users', () => {
    render(
        <Provider store={store}>
          <SearchComponent />
        </Provider>
    );

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('shows user repositories when "Search" button is clicked', () => {
    render(
        <Provider store={store}>
          <SearchComponent />
        </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('repo1')).toBeInTheDocument();
    expect(screen.getByText('repo2')).toBeInTheDocument();
  });
});
