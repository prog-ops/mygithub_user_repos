import React, {useEffect, useId, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories} from '../redux/store';
import {Box, Button, FormControl, Link, Typography} from "@mui/material";
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
  }, [])

  const id = useId()

  const userList = users.map((user: User) => (
      <Box key={user.id + id + user.login} className='item-container' style={{width: showRepos ? '50%' : '20%'}}>

        <Box sx={{
          flexDirection: showRepos ? 'column' : 'row',
          flex: 1,
          flexBasis: '25%',
          mr: '8px'
        }}>

          <img src={user.avatar_url} alt={user.login} className='avatar'/>

          <Box className='user'>
            <Typography variant='body2' sx={{textAlign: 'center'}}>{user.login}</Typography>
          </Box>

        </Box>

        {(showRepos && repositories[user.login]) ?
            (<Box className='vibrate' sx={{
              flex: 1,
              flexBasis: '75%'
            }}>
              {repositories[user.login].map((repository) => (
                  <Box key={repository.name} sx={{mt: '8px', mr: '8px', mb: '4px', p: '4px'}}>
                    <Link className='link' href={repository.html_url}>{repository.name}</Link>
                  </Box>
              ))}.
            </Box>) :
            (showRepos && !repositories[user.login]) ?
                (<Typography sx={{mr: '20px', mt: '20px'}}>No repos available.</Typography>) :
                null
        }
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
