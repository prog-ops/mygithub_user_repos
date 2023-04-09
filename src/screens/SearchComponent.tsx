import React, {useId, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories} from '../redux/store';
import {Button, FormControl} from "@mui/material";

export interface User {
  login: string;
  id: number;
  avatar_url: string;
}

export interface RootState {
  users: User[];
  repositories: Record<string, { name: string; html_url: string }[]>;
}

function SearchComponent() {
  const [showRepos, setShowRepos] = useState(false);
  const [query, setQuery] = useState("");
  const users = useSelector((state: RootState) => state.users);
  const repositories = useSelector((state: RootState) => state.repositories);
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = () => {
    const newQuery = searchRef.current?.value ?? "";
    setQuery(newQuery);
    if (newQuery === "") {
      dispatch({type: "CLEAR_USERS"});
    } else {
      dispatch(fetchUsers(newQuery) as any);
    }
  };

  const handleShowAllRepositories = () => {
    users.forEach((user: User) => {
      if (!repositories[user.login]) {
        dispatch(fetchRepositories(user.login) as any);
      }
    });
    setShowRepos(true);
  };

  const id = useId()

  const userList = users.map((user: User) => (
      <div key={user.id + id + user.login}
           style={{
             backgroundColor: "dimgray",
             marginBottom: "8px",
             borderRadius: "8px",
             width: showRepos ? '50%' : '20%',
             marginTop: "21px",
           }}>
        <img src={user.avatar_url}
             alt={user.login}
             style={{
               marginLeft: "15px",
               marginTop: "15px",
               borderRadius: '50%',
               boxShadow: '0 0 5px 4px rgba(255, 180, 128, 0.5)',
               width: '20%'
             }}/>
        <h2>{user.login}</h2>

        {showRepos && repositories[user.login] && (
            <div>
              {repositories[user.login].map((repository) => (
                  <div key={repository.name}>
                    <a href={repository.html_url}>{repository.name}</a>
                  </div>
              ))}.
            </div>
        )}
      </div>
  ));

  return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <FormControl sx={{width: '80%', mt: '10px'}} variant='filled'>
          <input
              type="text"
              ref={searchRef}
              placeholder="Search users"
              onChange={handleSearch}
              style={{flex: 1, padding: 10}}
          />
        </FormControl>
        <Button variant='contained' sx={{width: '80%', mt: '10px'}} onClick={handleShowAllRepositories}>
          Search
        </Button>
        {userList}
      </div>
  );
};

export default SearchComponent;
