import React, {useCallback, useId, useMemo, useRef} from 'react';
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
  const [showRepos, setShowRepos] = React.useState(false);
  const users = useSelector((state: State) => state.users);
  const repositories = useSelector((state: State) => state.repositories);
  const loading = useSelector((state: State) => state.loading);
  const error = useSelector((state: State) => state.error);
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Stable debounced search — memoized so the same debounce instance persists across renders
  const debouncedDispatch = useMemo(
      () => debounce((query: string) => {
        dispatch(fetchUsers(query) as any);
      }, 500),
      [dispatch]
  );

  const handleSearch = useCallback(() => {
    const query = searchRef.current?.value?.trim() ?? "";
    if (query === "") {
      debouncedDispatch.cancel();
      dispatch({type: "CLEAR_USERS"});
    } else {
      debouncedDispatch(query);
    }
  }, [dispatch, debouncedDispatch]);

  const handleShowAllRepositories = useCallback(async () => {
    if (users.length === 0) return;
    try {
      await Promise.all(
          users.map(async (user: User) => {
            if (!repositories[user.login]) {
              await dispatch(fetchRepositories(user.login) as any);
            }
          })
      );
      setShowRepos(true);
    } catch {
      // Errors are handled by the thunk → redux store
    }
  }, [users, repositories, dispatch]);

  const id = useId();

  const userList = users.map((user: User) => (
      <Box
          key={`${user.id}-${id}-${user.login}`}
          className='item-container'
          style={{width: showRepos ? '80%' : '50%'}}>
        <Box sx={{
          flexDirection: showRepos ? 'column' : 'row',
          flex: 1,
          flexBasis: '25%',
        }}>
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

        {/* ============================================================
            FIX P0: Only show repos section AFTER user clicks "Show repositories"
            - showRepos=true && repos exist & non-empty → show accordion
            - showRepos=true && repos fetched but empty → "No repos available"
            - showRepos=false → show nothing (don't confuse user)
            ============================================================ */}
        {showRepos && repositories[user.login] && repositories[user.login].length > 0
            ? (<Box
                className='vibrate'
                sx={{marginLeft: '20px'}}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                  <Typography>{user.login} repositories:</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {repositories[user.login].map((repository) => (
                      <Chip
                          key={repository.name}
                          label={<Link className='link' href={repository.html_url}>{repository.name}</Link>}
                      />
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>)
            : (showRepos && repositories[user.login] && repositories[user.login].length === 0)
                ? (<Typography sx={{mr: '20px', mt: '20px'}}>No repos available.</Typography>)
                : null
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
          Show repositories
        </Button>
        {loading && <Typography variant='h2' sx={{color: 'white'}}>Loading...</Typography>}
        {error && <Typography variant='h3' sx={{color: 'indianred'}}>{error}</Typography>}
        {userList}
      </Box>
  );
}

export default SearchComponent;
/*
The useDebounce hook can be implemented in the SearchComponent to prevent the fetchUsers function from being called repeatedly on every keystroke.
 */
