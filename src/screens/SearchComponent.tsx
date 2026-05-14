import React, {useCallback, useId, useMemo, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories, State, User} from '../redux/store';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Link,
  Typography
} from "@mui/material";
import '../styles/styles.css'
import {debounce} from "lodash";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SearchComponent() {
  const users = useSelector((state: State) => state.users);
  const repositories = useSelector((state: State) => state.repositories);
  const loading = useSelector((state: State) => state.loading);
  const error = useSelector((state: State) => state.error);
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Track which user cards are currently fetching repos
  const [loadingRepos, setLoadingRepos] = React.useState<Record<string, boolean>>({});

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

  // Fetch repos for a single user when their accordion is expanded
  const handleAccordionToggle = useCallback(
      (userLogin: string) => async (_event: React.SyntheticEvent, isExpanded: boolean) => {
        if (isExpanded && !repositories[userLogin]) {
          setLoadingRepos(prev => ({...prev, [userLogin]: true}));
          try {
            await dispatch(fetchRepositories(userLogin) as any);
          } catch {
            // Errors handled by the thunk → redux store
          } finally {
            setLoadingRepos(prev => ({...prev, [userLogin]: false}));
          }
        }
      },
      [repositories, dispatch]
  );

  const id = useId();

  const userList = users.map((user: User) => {
    const repos = repositories[user.login];
    const isFetchingRepos = loadingRepos[user.login] ?? false;

    return (
        <Accordion
            key={`${user.id}-${id}-${user.login}`}
            onChange={handleAccordionToggle(user.login)}
            className='user-accordion'
            sx={{
              width: '80%',
              mt: '12px',
              backgroundColor: 'rgba(105, 105, 105, 0.85)',
              borderRadius: '10px !important',
              color: 'white',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(120, 120, 120, 0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              },
              '&::before': {display: 'none'}, // remove MUI default divider
              '& .MuiAccordionSummary-expandIconWrapper': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}>

          {/* ── User header (clickable to expand) ── */}
          <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: '16px',
                },
              }}>
            <Avatar
                alt={user.login}
                src={user.avatar_url}
                sx={{
                  width: 44,
                  height: 44,
                  boxShadow: '0 0 5px 4px rgba(20, 180, 0, 0.8)',
                }}
            />
            <Typography variant='h6' sx={{fontWeight: 500}}>
              {user.login}
            </Typography>
          </AccordionSummary>

          {/* ── Repos section (shown on expand) ── */}
          <AccordionDetails className='vibrate' sx={{pt: 0, pb: '16px', px: '24px'}}>
            {isFetchingRepos && (
                <Box sx={{display: 'flex', alignItems: 'center', gap: '10px', py: '8px'}}>
                  <CircularProgress size={20} sx={{color: 'rgba(20, 180, 0, 0.8)'}}/>
                  <Typography variant='body2' sx={{color: 'rgba(255,255,255,0.7)'}}>
                    Fetching repositories…
                  </Typography>
                </Box>
            )}

            {repos && repos.length > 0 && (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {repos.map((repository) => (
                      <Chip
                          key={repository.name}
                          label={
                            <Link
                                className='link'
                                href={repository.html_url}
                                target="_blank"
                                rel="noopener noreferrer">
                              {repository.name}
                            </Link>
                          }
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.22)',
                              transform: 'scale(1.05)',
                            },
                          }}
                      />
                  ))}
                </Box>
            )}

            {repos && repos.length === 0 && !isFetchingRepos && (
                <Typography variant='body2' sx={{color: 'rgba(255,255,255,0.5)', fontStyle: 'italic'}}>
                  No public repositories found.
                </Typography>
            )}
          </AccordionDetails>
        </Accordion>
    );
  });

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', pb: '40px'}}>
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
              placeholder="Search GitHub users…"
              onChange={handleSearch}
              style={{flex: 1, padding: 10}}
          />
        </FormControl>
        {loading && <Typography variant='h5' sx={{color: 'white', mt: '20px'}}>Loading...</Typography>}
        {error && <Typography variant='body1' sx={{color: 'indianred', mt: '12px'}}>{error}</Typography>}
        {userList}
      </Box>
  );
}

export default SearchComponent;
/*
The useDebounce hook can be implemented in the SearchComponent to prevent the fetchUsers function from being called repeatedly on every keystroke.
 */
