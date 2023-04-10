import React, {useEffect, useId, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories} from '../redux/store';
import {Box, Button, FormControl, Typography} from "@mui/material";
import '../styles/styles.css'

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = /*added async*/async () => {
    const newQuery = searchRef.current?.value ?? "";
    setQuery(newQuery);

    setLoading(true);

    try {
      if (newQuery === "") {
        dispatch({type: "CLEAR_USERS"});
      } else {
        await dispatch(fetchUsers(newQuery) as any);
        // dispatch(fetchUsers(newQuery) as any);
      }
      setError("");
    } catch (err: any) {
      setError(
          err.response?.status === 403
              ? "You have exceeded the Github API rate limit. Please try again later."
              : "An error occurred while fetching users. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllRepositories = /*added async*/async () => {
    setLoading(true);

    try {
      await Promise.all(
          users.map(async (user: User) => {
            if (!repositories[user.login]) {
              await dispatch(fetchRepositories(user.login) as any);
            }
          })
      );
      setShowRepos(true);

      setError("");

    } catch (err: any) {
      setError(
          err.response?.status === 403
              ? "You have exceeded the Github API rate limit. Please try again later."
              : "An error occurred while fetching repositories. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(query)
  }, [
    showRepos
  ])

  const id = useId()

  const userList = users.map((user: User) => (
      <Box key={user.id + id + user.login}
           style={{
             display: 'flex',
             flexDirection: 'row',
             backgroundColor: "dimgray",
             marginBottom: "8px",
             borderRadius: "8px",
             width: showRepos ? '50%' : '20%',
             marginTop: "21px",
           }}>
        <Box sx={{
          flexDirection: showRepos ? 'column' : 'row',
          flex: 1,
          flexBasis: '25%',
        }}>
          <img src={user.avatar_url}
               alt={user.login}
               className='avatar'/>
          <Typography variant='body2' sx={{
            textAlign: 'center',
            // position: 'absolute'
          }}>{showRepos ? `${user.login} repos` : user.login}</Typography>
        </Box>
        {showRepos && repositories[user.login] && (
            <Box className='vibrate' sx={{
              flex: 1,
              flexBasis: '75%',
            }}>
              {repositories[user.login].map((repository) => (
                  <Box key={repository.name} sx={{p: '4px', backgroundColor: 'brown', mb: '4px'}}>
                    <a href={repository.html_url}>{repository.name}</a>
                  </Box>
              ))}.
            </Box>
        )}
      </Box>
  ));

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
        <FormControl sx={{
          width: '80%',
          mt: '10px',
          height: "3rem",
          "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "blue",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "gray",
          }
        }} variant='filled'>
          <input
              type="text"
              ref={searchRef}
              placeholder="Search users"
              onChange={handleSearch}
              style={{flex: 1, padding: 10}}
          />
        </FormControl>
        <Button
            variant='contained'
            className='bounce-btn'
            sx={{width: '80%', mt: '10px'}}
            onClick={handleShowAllRepositories}>
          Search
        </Button>
        {loading && <Typography variant='h2' sx={{color: 'white'}}>Loading...</Typography>}
        {error && <Typography variant='h3' sx={{color: 'indianred'}}>{error}</Typography>}
        {userList}
      </Box>
  );
};

export default SearchComponent;
