import React, {Dispatch, useEffect, useId, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories, State, User} from '../redux/store';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  Link,
  Typography
} from "@mui/material";
import '../styles/styles.css'
import {debounce} from "lodash";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SearchComponent() {
  const [showRepos, setShowRepos] = useState(false);
  const [query, setQuery] = useState("");
  const users = useSelector((state: State) => state.users);
  const repositories = useSelector((state: State) => state.repositories);
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const newQuery = searchRef.current?.value ?? "";
    setQuery(newQuery);
    setLoading(true);
    try {
      if (newQuery === "") {
        dispatch({type: "CLEAR_USERS"});
      } else {
        await dispatch(fetchUsers(newQuery) as any); // immediate call to fetchUsers, this will call api after every character, instead, better use debouncing (debouncedHandleSearch)
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

  const debouncedHandleSearch = debounce(handleSearch, 1_000); // 1s debounce delay

  const handleShowAllRepositories = async () => {
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

  /*useEffect(() => {
    // console.log(query)
  }, [])*/

  const id = useId()

  const userList = users.map((user: User) => (
      <Box
          key={user.id + id + user.login}
          className='item-container'
          style={{width: showRepos ? '80%' : '50%'}}>
        <Box sx={{
          flexDirection: showRepos ? 'column' : 'row',
          flex: 1,
          flexBasis: '25%',
        }}>
          {/*<img src={user.avatar_url} alt={user.login} className='avatar'/>*/}
          <Box className='user'>
            <Avatar
                alt={user.login}
                src={user.avatar_url}
                sx={{marginTop: '20px', marginLeft: '15px', boxShadow: '0 0 5px 4px rgba(20, 180, 0, 0.8)'}}
            />
            {(showRepos && repositories[user.login]) ? null : <Typography
                variant='h4'
                className={
                  showRepos && repositories[user.login]
                      ? 'user-login-repos'
                      : 'user-login'}>
              {user.login}
            </Typography>}
          </Box>
        </Box>

        {(showRepos && repositories[user.login])
            ? (<Box
                className='vibrate'
                sx={{
                  // flex: 1,
                  // flexBasis: '100%'
                  marginLeft: '20px'
                }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography>{(showRepos && repositories[user.login]) ? user.login + " repositories:" : ""}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {repositories[user.login].map((repository) => (
                      // <Box key={repository.name} sx={{mt: '8px', mr: '8px', mb: '4px', p: '4px'}}>
                      <Chip
                          key={repository.name}
                          label={<Link className='link' href={repository.html_url}>{repository.name}</Link>}
                      />
                      // </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>)
            : (!showRepos && !repositories[user.login]) ?
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
              onChange={debouncedHandleSearch}
              // onChange={handleSearch}
              style={{flex: 1, padding: 10}}
          />
        </FormControl>
        <Button
            variant='contained'
            className='bounce-btn'
            sx={{width: '80%', mt: '10px'}}
            onClick={handleShowAllRepositories}>
          Show repositories
        </Button>
        {loading && <Typography variant='h2' sx={{color: 'white'}}>Loading...</Typography>}
        {error && <Typography variant='h3' sx={{color: 'indianred'}}>{error}</Typography>}
        {userList}
      </Box>
  );
};

export default SearchComponent;
/*
The useDebounce hook can be implemented in the SearchComponent to prevent the fetchUsers function from being called repeatedly on every keystroke.
 */
