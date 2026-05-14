import React, {useCallback, useId, useMemo, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUsers, fetchRepositories, State, User, Repository} from '../redux/store';
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
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ForkRightRoundedIcon from '@mui/icons-material/ForkRightRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

// Map language names to branded colors
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d', C: '#555555',
  'C#': '#178600', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
  Kotlin: '#A97BFF', Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c',
  Shell: '#89e051', Lua: '#000080', Scala: '#c22d40', R: '#198CE7',
  Vue: '#41b883', Jupyter: '#DA5B0B',
};

function getLangColor(lang: string): string {
  return LANG_COLORS[lang] ?? '#8b949e';
}

function SearchComponent() {
  const users = useSelector((state: State) => state.users);
  const userDetails = useSelector((state: State) => state.userDetails);
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
    const details = userDetails[user.login];
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
              '&::before': {display: 'none'},
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
                  width: 48,
                  height: 48,
                  boxShadow: '0 0 5px 4px rgba(20, 180, 0, 0.8)',
                  flexShrink: 0,
                }}
            />

            {/* Username + repo count + top languages */}
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1}}>
              <Typography variant='h6' sx={{fontWeight: 500, lineHeight: 1.3}}>
                {user.login}
              </Typography>

              {/* Repo count */}
              {details && (
                  <Box sx={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <FolderRoundedIcon sx={{fontSize: 14, color: 'rgba(255,255,255,0.5)'}}/>
                    <Typography variant='caption' sx={{color: 'rgba(255,255,255,0.6)'}}>
                      {details.public_repos} repos
                    </Typography>
                  </Box>
              )}

              {/* Top 3 languages */}
              {details && details.top_languages.length > 0 && (
                  <Box sx={{display: 'flex', alignItems: 'center', gap: '4px', mt: '2px', flexWrap: 'wrap'}}>
                    <CodeRoundedIcon sx={{fontSize: 14, color: 'rgba(255,255,255,0.5)'}}/>
                    {details.top_languages.map(lang => (
                        <Chip
                            key={lang}
                            label={lang}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              backgroundColor: getLangColor(lang) + '30', // 30 = ~19% opacity hex
                              color: getLangColor(lang),
                              border: `1px solid ${getLangColor(lang)}50`,
                              '& .MuiChip-label': {px: '6px'},
                            }}
                        />
                    ))}
                  </Box>
              )}
            </Box>
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
                <Box sx={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {repos.map((repository: Repository) => (
                      <Box
                          key={repository.name}
                          className='repo-card'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            px: '14px',
                            py: '10px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.16)',
                              transform: 'translateX(4px)',
                            },
                          }}>
                        {/* Repo name link */}
                        <Link
                            href={repository.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#58a6ff',
                              textDecoration: 'none',
                              fontWeight: 500,
                              fontSize: '0.9rem',
                              '&:hover': { color: '#79c0ff', textDecoration: 'underline' },
                            }}>
                          {repository.name}
                        </Link>

                        {/* Stars & Forks */}
                        <Box sx={{display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, ml: '12px'}}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: '3px'}}>
                            <StarRoundedIcon sx={{fontSize: 16, color: '#f0c040'}}/>
                            <Typography variant='caption' sx={{color: 'rgba(255,255,255,0.75)', fontWeight: 600}}>
                              {repository.stargazers_count}
                            </Typography>
                          </Box>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: '3px'}}>
                            <ForkRightRoundedIcon sx={{fontSize: 16, color: 'rgba(255,255,255,0.5)'}}/>
                            <Typography variant='caption' sx={{color: 'rgba(255,255,255,0.75)', fontWeight: 600}}>
                              {repository.forks_count}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
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
